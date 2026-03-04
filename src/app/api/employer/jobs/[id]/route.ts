import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

// Authenticate and verify ownership
async function verifyOwnership(jobId: string) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return { error: 'Unauthorized', status: 401 };

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string, role: string };
    } catch {
        return { error: 'Invalid token', status: 401 };
    }

    if (decoded.role !== 'EMPLOYER' && decoded.role !== 'ADMIN') {
        return { error: 'Forbidden', status: 403 };
    }

    const db = await getDb();
    const job = await db.get('SELECT posterId FROM Job WHERE id = ?', [jobId]);

    if (!job) return { error: 'Job not found', status: 404 };

    // Only the poster (or a super admin) can modify this job
    if (job.posterId !== decoded.userId && decoded.role !== 'ADMIN') {
        return { error: 'Forbidden: You do not own this job posting', status: 403 };
    }

    return { success: true, db };
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const auth = await verifyOwnership(id);
        if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

        const body = await req.json();
        const { title, company, location, type, category, salaryInterval, description, requirements } = body;

        const updatedAt = new Date().toISOString();

        await auth.db!.run(
            `UPDATE Job SET title = ?, company = ?, location = ?, type = ?, category = ?, salaryInterval = ?, description = ?, requirements = ?, updatedAt = ? WHERE id = ?`,
            [title, company, location, type, category, salaryInterval || null, description, JSON.stringify(requirements || []), updatedAt, id]
        );

        return NextResponse.json({ success: true, message: 'Job updated' });
    } catch (error) {
        console.error('Update employer job error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const auth = await verifyOwnership(id);
        if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

        // Delete associated applications first to maintain referential integrity
        await auth.db!.run('DELETE FROM Application WHERE jobId = ?', [id]);
        await auth.db!.run('DELETE FROM Job WHERE id = ?', [id]);

        return NextResponse.json({ success: true, message: 'Job deleted' });
    } catch (error) {
        console.error('Delete employer job error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

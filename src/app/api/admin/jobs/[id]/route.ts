import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

// Helper to authenticate Admin
async function authenticateAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return false;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
        return decoded.role === 'ADMIN';
    } catch {
        return false;
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const isAdmin = await authenticateAdmin();
        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        if (!id) {
            return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
        }

        const db = await getDb();

        // Delete the job
        const result = await db.run(`DELETE FROM Job WHERE id = ?`, [id]);

        if (result.changes === 0) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Job deleted successfully' }, { status: 200 });
    } catch (error: any) {
        console.error('Delete job error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const isAdmin = await authenticateAdmin();
        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        if (!id) {
            return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
        }

        const body = await req.json();
        const { title, company, location, type, category, salaryInterval, description, requirements } = body;

        // Requirements should be an array, serialize to JSON
        const requirementsJson = Array.isArray(requirements) ? JSON.stringify(requirements) : JSON.stringify([]);

        const db = await getDb();

        const result = await db.run(`
            UPDATE Job 
            SET title = ?, company = ?, location = ?, type = ?, category = ?, salaryInterval = ?, description = ?, requirements = ?
            WHERE id = ?
        `, [title, company, location, type, category, salaryInterval, description, requirementsJson, id]);

        if (result.changes === 0) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Job updated successfully' }, { status: 200 });
    } catch (error: any) {
        console.error('Update job error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

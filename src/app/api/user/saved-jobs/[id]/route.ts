import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
        const db = await getDb();

        // The 'id' parameter is the actual 'jobId' that we want to unsave
        await db.run(`DELETE FROM SavedJob WHERE userId = ? AND jobId = ?`, [decoded.userId, id]);

        return NextResponse.json({ success: true, message: 'Job unsaved successfully' });
    } catch (error) {
        console.error('Unsave job error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

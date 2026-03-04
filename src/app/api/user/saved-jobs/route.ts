import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
        const db = await getDb();

        const savedJobs = await db.all(`
            SELECT sj.id as savedJobId, sj.savedAt,
                   j.id as jobId, j.title, j.company, j.location, j.type, j.category, j.salaryInterval
            FROM SavedJob sj
            JOIN Job j ON sj.jobId = j.id
            WHERE sj.userId = ?
            ORDER BY sj.savedAt DESC
        `, [decoded.userId]);

        return NextResponse.json({ success: true, savedJobs });
    } catch (error) {
        console.error('Fetch saved jobs error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
        const body = await req.json();
        const { jobId } = body;

        if (!jobId) return NextResponse.json({ error: 'Job ID missing' }, { status: 400 });

        const db = await getDb();
        const newId = crypto.randomUUID();

        // Use INSERT OR IGNORE to prevent duplicate saves from throwing 500s
        await db.run(
            `INSERT OR IGNORE INTO SavedJob (id, userId, jobId) VALUES (?, ?, ?)`,
            [newId, decoded.userId, jobId]
        );

        return NextResponse.json({ success: true, message: 'Job saved successfully' }, { status: 201 });
    } catch (error) {
        console.error('Save job error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

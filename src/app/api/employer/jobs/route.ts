import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// GET all jobs for the logged in employer
export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string, role: string };
        if (decoded.role !== 'EMPLOYER' && decoded.role !== 'ADMIN') { return NextResponse.json({ error: 'Forbidden' }, { status: 403 }); }

        const db = await getDb();
        const jobs = await db.all(`SELECT * FROM Job WHERE posterId = ? ORDER BY createdAt DESC`, [decoded.userId]);

        const parsedJobs = jobs.map(job => ({
            ...job,
            requirements: JSON.parse(job.requirements)
        }));

        return NextResponse.json({ success: true, jobs: parsedJobs });
    } catch (error) {
        console.error('Fetch employer jobs error:', error);
        return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
    }
}

// POST a new job as an employer
export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string, role: string };
        if (decoded.role !== 'EMPLOYER' && decoded.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const body = await req.json();
        const { title, company, location, type, category, salaryInterval, description, requirements } = body;

        if (!title || !company || !location || !type || !category || !description) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const db = await getDb();
        const newJobId = crypto.randomUUID();
        const createdAt = new Date().toISOString();

        await db.run(
            `INSERT INTO Job (id, title, company, location, type, category, salaryInterval, description, requirements, posterId, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [newJobId, title, company, location, type, category, salaryInterval || null, description, JSON.stringify(requirements || []), decoded.userId, createdAt, createdAt]
        );

        return NextResponse.json({ success: true, message: 'Job posted' }, { status: 201 });
    } catch (error) {
        console.error('Create employer job error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

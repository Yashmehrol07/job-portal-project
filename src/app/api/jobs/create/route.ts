import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token');

        if (!token) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
        }

        let decoded;
        try {
            decoded = jwt.verify(token.value, process.env.JWT_SECRET as string) as { userId: string, role: string };
        } catch (err) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        if (decoded.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Only employers can post jobs' }, { status: 403 });
        }

        const body = await req.json();
        const { title, company, location, type, category, salaryInterval, description, requirements } = body;

        if (!title || !company || !location || !type || !category || !description) {
            return NextResponse.json({ error: 'Please provide all required fields' }, { status: 400 });
        }

        const db = await getDb();
        const newJobId = crypto.randomUUID();
        const createdAt = new Date().toISOString();

        await db.run(
            `INSERT INTO Job (id, title, company, location, type, category, salaryInterval, description, requirements, posterId, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [newJobId, title, company, location, type, category, salaryInterval || null, description, JSON.stringify(requirements || []), decoded.userId, createdAt, createdAt]
        );

        const job = await db.get(`SELECT * FROM Job WHERE id = ?`, [newJobId]);

        return NextResponse.json({ success: true, job }, { status: 201 });
    } catch (error: any) {
        console.error('Job creation error:', error);
        return NextResponse.json({ error: error.message || 'Server error while creating job' }, { status: 500 });
    }
}

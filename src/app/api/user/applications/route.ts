import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
        } catch (err) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const db = await getDb();

        // Fetch user's applications joined with the job details
        const applications = await db.all(`
            SELECT a.id as applicationId, a.status, a.appliedAt, 
                   j.id as jobId, j.title, j.company, j.location, j.type
            FROM Application a
            JOIN Job j ON a.jobId = j.id
            WHERE a.applicantId = ?
            ORDER BY a.appliedAt DESC
        `, [decoded.userId]);

        return NextResponse.json({ success: true, applications }, { status: 200 });
    } catch (error: any) {
        console.error('Fetch user applications error:', error);
        return NextResponse.json({ error: 'Server error while fetching applications' }, { status: 500 });
    }
}

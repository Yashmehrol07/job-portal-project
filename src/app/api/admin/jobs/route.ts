import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
    try {
        // Authenticate the request
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
            if (decoded.role !== 'ADMIN') {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        } catch {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const db = await getDb();

        // Fetch all jobs ordered by newest first
        const jobs = await db.all(`SELECT * FROM Job ORDER BY createdAt DESC`);

        // Parse requirements from JSON string to array for frontend
        const parsedJobs = jobs.map((job: any) => {
            let requirements = [];
            try {
                requirements = JSON.parse(job.requirements);
            } catch (e) {
                // Ignore parse errors if data is corrupted
            }
            return {
                ...job,
                requirements
            };
        });

        return NextResponse.json({ success: true, jobs: parsedJobs }, { status: 200 });
    } catch (error: any) {
        console.error('Fetch admin jobs error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

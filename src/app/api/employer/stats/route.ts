import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string, role: string };

        if (decoded.role !== 'EMPLOYER' && decoded.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const db = await getDb();

        const jobsCount = await db.get(`SELECT COUNT(*) as count FROM Job WHERE posterId = ?`, [decoded.userId]);

        const appsCount = await db.get(`
            SELECT COUNT(a.id) as count 
            FROM Application a
            JOIN Job j ON a.jobId = j.id
            WHERE j.posterId = ?
        `, [decoded.userId]);

        return NextResponse.json({
            success: true,
            stats: {
                totalJobs: jobsCount?.count || 0,
                totalApplications: appsCount?.count || 0
            }
        });

    } catch (error) {
        console.error('Employer Stats Error:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}

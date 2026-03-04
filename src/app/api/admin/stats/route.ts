import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
    try {
        // Authenticate the request via JWT token
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
            if (decoded.role !== 'ADMIN') {
                return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
            }
        } catch (err) {
            return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
        }

        // Fetch counts from the SQLite database
        const db = await getDb();

        const [jobsResult, usersResult, applicationsResult] = await Promise.all([
            db.get('SELECT COUNT(*) as count FROM Job'),
            db.get('SELECT COUNT(*) as count FROM User'),
            db.get('SELECT COUNT(*) as count FROM Application')
        ]);

        return NextResponse.json({
            success: true,
            stats: {
                totalJobs: jobsResult?.count || 0,
                totalUsers: usersResult?.count || 0,
                totalApplications: applicationsResult?.count || 0
            }
        }, { status: 200 });

    } catch (error: any) {
        console.error('Stats endpoint error:', error);
        return NextResponse.json({ error: 'Server error while fetching stats' }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string, role: string };
        if (decoded.role !== 'EMPLOYER' && decoded.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const db = await getDb();

        const applications = await db.all(`
SELECT
a.id as applicationId, a.status, a.coverLetter, a.createdAt as appliedAt,
    u.id as applicantId, u.firstName as applicantFirstName, u.lastName as applicantLastName, u.email as applicantEmail,
    j.id as jobId, j.title as jobTitle, j.company as jobCompany
            FROM Application a
            JOIN User u ON a.userId = u.id
            JOIN Job j ON a.jobId = j.id
            WHERE j.posterId = ?
    ORDER BY a.createdAt DESC
        `, [decoded.userId]);

        return NextResponse.json({ success: true, applications });
    } catch (error) {
        console.error('Fetch employer applications error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

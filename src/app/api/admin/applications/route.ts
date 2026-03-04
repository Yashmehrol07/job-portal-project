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
            decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string, role: string };
            if (decoded.role !== 'ADMIN') {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        } catch (err) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const db = await getDb();

        // Fetch all applications and join with User and Job tables
        const applications = await db.all(`
            SELECT 
                a.id as applicationId, 
                a.status, 
                a.coverLetter, 
                a.appliedAt, 
                u.id as applicantId, 
                u.firstName as applicantFirstName, 
                u.lastName as applicantLastName, 
                u.email as applicantEmail,
                j.id as jobId, 
                j.title as jobTitle, 
                j.company as jobCompany
            FROM Application a
            JOIN User u ON a.applicantId = u.id
            JOIN Job j ON a.jobId = j.id
            ORDER BY a.appliedAt DESC
        `);

        return NextResponse.json({ success: true, applications }, { status: 200 });
    } catch (error: any) {
        console.error('Fetch admin applications error:', error);
        return NextResponse.json({ error: 'Server error while fetching applications' }, { status: 500 });
    }
}

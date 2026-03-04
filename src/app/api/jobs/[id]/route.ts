import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: jobId } = await params;

        if (!jobId) {
            return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
        }

        const db = await getDb();
        const jobRaw = await db.get(`
            SELECT j.*, 
                   u.firstName as posterFirstName, 
                   u.lastName as posterLastName, 
                   u.avatarUrl as posterAvatarUrl
            FROM Job j
            JOIN User u ON j.posterId = u.id
            WHERE j.id = ?
        `, [jobId]);

        if (!jobRaw) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        // Parse requirements
        let reqArray = [];
        try {
            reqArray = JSON.parse(jobRaw.requirements);
        } catch (e) { }

        const parsedJob = {
            id: jobRaw.id,
            title: jobRaw.title,
            company: jobRaw.company,
            location: jobRaw.location,
            type: jobRaw.type,
            category: jobRaw.category,
            salaryInterval: jobRaw.salaryInterval,
            description: jobRaw.description,
            requirements: reqArray,
            posterId: jobRaw.posterId,
            createdAt: jobRaw.createdAt,
            updatedAt: jobRaw.updatedAt,
            poster: {
                firstName: jobRaw.posterFirstName,
                lastName: jobRaw.posterLastName,
                avatarUrl: jobRaw.posterAvatarUrl
            }
        };

        return NextResponse.json({ success: true, job: parsedJob }, { status: 200 });
    } catch (error: any) {
        console.error('Fetch job error:', error);
        return NextResponse.json({ error: 'Server error while fetching job details' }, { status: 500 });
    }
}

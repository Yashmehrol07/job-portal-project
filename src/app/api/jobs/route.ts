import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);

        let queryConditions = [];
        let params = [];

        const category = searchParams.get('category');
        if (category && category !== 'All') {
            queryConditions.push('j.category = ?');
            params.push(category);
        }

        const type = searchParams.get('type');
        if (type && type !== 'All') {
            queryConditions.push('j.type = ?');
            params.push(type);
        }

        const search = searchParams.get('search');
        if (search) {
            const searchParam = `%${search}%`;
            queryConditions.push('(j.title LIKE ? OR j.company LIKE ? OR j.description LIKE ?)');
            params.push(searchParam, searchParam, searchParam);
        }

        const location = searchParams.get('location');
        if (location && location !== 'Any Location' && location !== 'All') {
            queryConditions.push('j.location LIKE ?');
            params.push(`%${location}%`);
        }

        const whereClause = queryConditions.length > 0 ? `WHERE ${queryConditions.join(' AND ')}` : '';

        let jobsRaw = [];
        try {
            const db = await getDb();
            jobsRaw = await db.all(`
                SELECT j.*, 
                       u.firstName as posterFirstName, 
                       u.lastName as posterLastName, 
                       u.avatarUrl as posterAvatarUrl
                FROM Job j
                JOIN User u ON j.posterId = u.id
                ${whereClause}
                ORDER BY j.createdAt DESC
            `, params);
        } catch (dbError: any) {
            console.error('SQLITE JOBS FETCH CRASH:', dbError.message);
            return NextResponse.json({ error: 'Database Connection Error', details: dbError.message }, { status: 500 });
        }

        // Parse requirements back to array for frontend and structure poster object
        const parsedJobs = jobsRaw.map((job: any) => {
            let reqArray = [];
            try {
                reqArray = JSON.parse(job.requirements);
            } catch (e) { }

            return {
                id: job.id,
                title: job.title,
                company: job.company,
                location: job.location,
                type: job.type,
                category: job.category,
                salaryInterval: job.salaryInterval,
                description: job.description,
                requirements: reqArray,
                posterId: job.posterId,
                createdAt: job.createdAt,
                updatedAt: job.updatedAt,
                poster: {
                    firstName: job.posterFirstName,
                    lastName: job.posterLastName,
                    avatarUrl: job.posterAvatarUrl
                }
            };
        });

        return NextResponse.json({ success: true, count: parsedJobs.length, jobs: parsedJobs }, { status: 200 });
    } catch (error: any) {
        console.error('CRITICAL INTERNAL FETCH JOBS ERROR:', error.message, error.stack);
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
}

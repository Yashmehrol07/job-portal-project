import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { sendEmail } from '@/lib/sendEmail';
import crypto from 'crypto';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string, role: string };
        if (decoded.role !== 'EMPLOYER' && decoded.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const body = await req.json();
        const { status } = body;

        if (!['PENDING', 'REVIEWING', 'ACCEPTED', 'REJECTED'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const db = await getDb();

        // Security Check: Make sure the employer owns the job this application is for
        const application = await db.get(`
            SELECT a.userId, j.title, j.company, j.posterId, u.email as userEmail, u.firstName as userFirstName
            FROM Application a
            JOIN Job j ON a.jobId = j.id
            JOIN User u ON a.userId = u.id
            WHERE a.id = ?
        `, [id]);

        if (!application) return NextResponse.json({ error: 'Application not found' }, { status: 404 });

        if (application.posterId !== decoded.userId && decoded.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden: Cannot modify applications for jobs you do not own' }, { status: 403 });
        }

        const updatedAt = new Date().toISOString();
        await db.run(
            `UPDATE Application SET status = ?, updatedAt = ? WHERE id = ?`,
            [status, updatedAt, id]
        );

        // Notifications
        if (status === 'ACCEPTED' || status === 'REJECTED') {
            const notifId = crypto.randomUUID();
            let msg = '';
            if (status === 'ACCEPTED') {
                msg = `Congratulations! You have been accepted for the role of ${application.title} at ${application.company}.`;
            } else {
                msg = `Update on your application for ${application.title} at ${application.company}: The employer has decided to move forward with other candidates.`;
            }

            // In-app Notification for the Job Seeker
            await db.run(
                `INSERT INTO Notification (id, userId, message, read, createdAt) VALUES (?, ?, ?, 0, ?)`,
                [notifId, application.userId, msg, updatedAt]
            );

            // Email to Job Seeker
            await sendEmail(
                application.userEmail,
                `Application Status Update: ${application.title}`,
                `<p>Hi ${application.userFirstName},</p><p>${msg}</p>`
            );
        }

        return NextResponse.json({ success: true, message: 'Status updated' });
    } catch (error) {
        console.error('Update employer application error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

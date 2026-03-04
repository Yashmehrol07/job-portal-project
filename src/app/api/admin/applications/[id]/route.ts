import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { sendEmail } from '@/lib/sendEmail';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
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

        const applicationId = id;
        const body = await req.json();
        const { status } = body;

        if (!status || !['PENDING', 'REVIEWING', 'ACCEPTED', 'REJECTED'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status provided' }, { status: 400 });
        }

        const db = await getDb();

        const application = await db.get(`
            SELECT a.id, a.applicantId, a.jobId, u.email, u.firstName, j.title, j.company
            FROM Application a
            JOIN User u ON a.applicantId = u.id
            JOIN Job j ON a.jobId = j.id
            WHERE a.id = ?
        `, [applicationId]);

        if (!application) {
            return NextResponse.json({ error: 'Application not found' }, { status: 404 });
        }

        if (status === 'ACCEPTED') {
            // Also update job to closed - wait, user didn't request job closing, just application status update. We will skip closing job for now.
        }

        const updatedAt = new Date().toISOString();

        await db.run(
            `UPDATE Application SET status = ?, updatedAt = ? WHERE id = ?`,
            [status, updatedAt, applicationId]
        );

        // Notifications when status is changed to ACCEPTED or REJECTED
        if (status === 'ACCEPTED' || status === 'REJECTED') {
            const notificationId = crypto.randomUUID();
            const title = status === 'ACCEPTED' ? 'Application Accepted! 🎉' : 'Application Update';
            const message = status === 'ACCEPTED'
                ? `Great news! Your application for the ${application.title} role at ${application.company} has been accepted.`
                : `Thank you for applying to the ${application.title} role at ${application.company}. Unfortunately, they have decided to move forward with other candidates.`;

            await db.run(
                `INSERT INTO Notification (id, userId, title, message, createdAt) VALUES (?, ?, ?, ?, ?)`,
                [notificationId, application.applicantId, title, message, updatedAt]
            );

            if (application.email) {
                await sendEmail(
                    application.email,
                    `Application Status Update: ${application.title}`,
                    `Hi ${application.firstName || 'there'},\n\n${message}\n\nBest regards,\nThe Job Portal Team`
                );
            }
        }

        return NextResponse.json({ success: true, message: 'Application status updated successfully' }, { status: 200 });
    } catch (error: any) {
        console.error('Update application status error:', error);
        return NextResponse.json({ error: 'Server error while updating application' }, { status: 500 });
    }
}

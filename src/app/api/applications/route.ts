import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { sendEmail } from '@/lib/sendEmail';

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized. Please log in to apply.' }, { status: 401 });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string, role: string };
        } catch (err) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const body = await req.json();
        const { jobId, coverLetter } = body;

        if (!jobId) {
            return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
        }

        const db = await getDb();

        // Ensure the job exists
        const job = await db.get(`SELECT id, title, company FROM Job WHERE id = ?`, [jobId]);
        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        // Prevent duplicate applications
        const existingApplication = await db.get(
            `SELECT id FROM Application WHERE applicantId = ? AND jobId = ?`,
            [decoded.userId, jobId]
        );

        if (existingApplication) {
            return NextResponse.json({ error: 'You have already applied for this job.' }, { status: 400 });
        }

        // Get User Email for Notification
        const user = await db.get(`SELECT email FROM User WHERE id = ?`, [decoded.userId]);

        // Insert new application
        const applicationId = crypto.randomUUID();
        const appliedAt = new Date().toISOString();
        const status = 'PENDING';

        await db.run(
            `INSERT INTO Application (id, applicantId, jobId, status, coverLetter, appliedAt, updatedAt) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [applicationId, decoded.userId, jobId, status, coverLetter || null, appliedAt, appliedAt]
        );

        // 1. Insert In-App Notification for User
        const notificationId = crypto.randomUUID();
        await db.run(
            `INSERT INTO Notification (id, userId, title, message, createdAt) VALUES (?, ?, ?, ?, ?)`,
            [notificationId, decoded.userId, 'Application Submitted!', `You have successfully applied for: ${job.title} at ${job.company}. We will notify you when the status changes.`, appliedAt]
        );

        // 2. Fire Simulated Emails
        if (user && user.email) {
            // To Applicant
            await sendEmail(
                user.email,
                `Application Confirmed: ${job.title}`,
                `Hi there,\n\nYour application for ${job.title} at ${job.company} has been received successfully!\n\nBest,\nThe Job Portal Team`
            );
        }

        // To Admin
        await sendEmail(
            'admin@pytalent.com',
            `New Application: ${job.title}`,
            `A new user has just applied for the ${job.title} role at ${job.company}.\n\nPlease review it in the Admin Dashboard.`
        );

        return NextResponse.json({ success: true, message: 'Application submitted successfully' }, { status: 201 });
    } catch (error: any) {
        console.error('Job application error:', error);
        return NextResponse.json({ error: 'Server error while submitting application' }, { status: 500 });
    }
}

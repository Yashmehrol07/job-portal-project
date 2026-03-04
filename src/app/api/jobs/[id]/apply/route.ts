import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { sendEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: jobId } = await params;
        const cookieStore = await cookies();
        const token = cookieStore.get('token');

        if (!token) {
            return NextResponse.json({ error: 'Please login to apply for this job' }, { status: 401 });
        }

        let decoded;
        try {
            decoded = jwt.verify(token.value, process.env.JWT_SECRET as string) as { userId: string };
        } catch (err) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const userId = decoded.userId;
        const db = await getDb();

        // Verify Job exists
        const job = await db.get(`SELECT * FROM Job WHERE id = ?`, [jobId]);
        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        // Verify User exists
        const user = await db.get(`SELECT * FROM User WHERE id = ?`, [userId]);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Check if user already applied
        const existingApplication = await db.get(`SELECT * FROM Application WHERE jobId = ? AND userId = ?`, [jobId, userId]);

        if (existingApplication) {
            return NextResponse.json({ error: 'You have already applied for this job' }, { status: 400 });
        }

        // Create Application
        const newApplicationId = crypto.randomUUID();
        const createdAt = new Date().toISOString();

        await db.run(
            `INSERT INTO Application (id, jobId, userId, status, createdAt, updatedAt)
             VALUES (?, ?, ?, 'PENDING', ?, ?)`,
            [newApplicationId, jobId, userId, createdAt, createdAt]
        );

        const application = await db.get(`SELECT * FROM Application WHERE id = ?`, [newApplicationId]);

        // ... existing email notification code ...
        const emailHtml = `
            <h2>Job Application Received</h2>
            <p>Dear ${user.firstName} ${user.lastName},</p>
            <p>Thank you for applying to the <strong>${job.title}</strong> position at <strong>${job.company}</strong>.</p>
            <p>We have received your application successfully. Here are the details we have on file for you:</p>
            <ul>
                <li><strong>Application ID (Internal):</strong> ${application.id}</li>
                <li><strong>Your User ID:</strong> ${user.id}</li>
                <li><strong>Name:</strong> ${user.firstName} ${user.lastName}</li>
                <li><strong>Email:</strong> ${user.email}</li>
                <li><strong>Mobile No:</strong> ${user.mobileNo || 'N/A'}</li>
            </ul>
            <p>We will contact you if your profile matches our requirements.</p>
            <br/>
            <p>Best Regards,</p>
            <p>The PyTalent Team</p>
        `;

        try {
            await sendEmail({
                to: user.email,
                subject: `Application Received: ${job.title} at ${job.company}`,
                html: emailHtml
            });
        } catch (emailError) {
            console.error('Failed to send application confirmation email:', emailError);
            // We don't want to fail the application if email fails, but we should log it
        }

        return NextResponse.json({ success: true, message: 'Application submitted successfully', application }, { status: 201 });

    } catch (error: any) {
        console.error('Job application error:', error);
        return NextResponse.json({ error: error.message || 'Server error while applying for job' }, { status: 500 });
    }
}

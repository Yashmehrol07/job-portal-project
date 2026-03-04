import nodemailer from 'nodemailer';

// Configure standard SMTP transport
// Using environment variables or fallback to a test ethereal account if not provided
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT || '587'),
    auth: {
        user: process.env.SMTP_USER || 'ethereal.user@ethereal.email', // Replace with real credentials in .env
        pass: process.env.SMTP_PASS || 'ethereal_password'
    }
});

export async function sendEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || '"PyTalent Job Portal" <noreply@pytalent.com>',
            to,
            subject,
            html,
        });

        console.log('Message sent: %s', info.messageId);

        // If using Ethereal email for testing, log the preview URL
        if (info.messageId && process.env.SMTP_HOST === 'smtp.ethereal.email') {
            const previewUrl = nodemailer.getTestMessageUrl(info);
            console.log('Preview URL: %s', previewUrl);
        }

        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}

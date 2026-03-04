export async function sendEmail(to: string, subject: string, text: string) {
    // In a real production application, you would integrate a service provider 
    // like SendGrid, AWS SES, or NodeMailer here.

    console.log('----------------------------------------------------');
    console.log('📧 SIMULATED EMAIL DISPATCHED');
    console.log(`➡️  To:      ${to}`);
    console.log(`📋 Subject: ${subject}`);
    console.log(`📝 Body:    ${text}`);
    console.log('----------------------------------------------------');

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return true;
}

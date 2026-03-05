import Link from 'next/link';

export default function PrivacyPage() {
    return (
        <div style={{ padding: '4rem 1rem', maxWidth: '800px', margin: '0 auto', minHeight: '60vh' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: 'var(--primary)', textAlign: 'center' }}>
                Privacy Policy
            </h1>

            <div style={{ backgroundColor: 'var(--surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid var(--border)' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Information We Collect</h2>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '2rem' }}>
                    When you use PyTalent, we collect essential information to provide our services. This includes your name, email address,
                    resumes, job preferences, and application history. We ensure that this data is securely encrypted in our Turso databases and never sold to third parties.
                </p>

                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-main)' }}>How We Use Data</h2>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '2rem' }}>
                    Your data is strictly used to match you with potential employers and facilitate seamless job applications.
                    Employers only see your contact details when you explicitly choose to apply for their specific job listings or opt-in to our talent networking pool.
                </p>

                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Cookie Policy</h2>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '2rem' }}>
                    We use purely technical cookies to manage your secure authentication sessions. By browsing PyTalent, you consent to these fundamental operational cookies. We avoid aggressive cross-site tracking cookies.
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Last updated: March 2026</p>
                </div>
            </div>
        </div>
    );
}

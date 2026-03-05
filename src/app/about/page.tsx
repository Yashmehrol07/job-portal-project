import Link from 'next/link';

export default function AboutPage() {
    return (
        <div style={{ padding: '4rem 1rem', maxWidth: '800px', margin: '0 auto', minHeight: '60vh' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: 'var(--primary)', textAlign: 'center' }}>
                About Future Tech & Solution
            </h1>

            <div style={{ backgroundColor: 'var(--surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid var(--border)' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Our Mission</h2>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '2rem' }}>
                    At Future Tech & Solution, our mission is to connect top technical talent with the world's most innovative companies.
                    We believe that finding the right career opportunity should be seamless, transparent, and rewarding.
                    Our platform is designed to empower job seekers while providing employers with access to a pre-vetted pool of exceptional professionals.
                </p>

                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Our Vision</h2>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '2rem' }}>
                    We envision a future where technology bridges the gap between potential and opportunity.
                    By utilizing modern web engineering and data-driven matching, we aim to be the premier destination
                    for IT professionals looking to advance their technical careers and organizations seeking to build world-class teams.
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                    <Link href="/jobs" className="btn btn-primary">
                        Browse Open Opportunities
                    </Link>
                </div>
            </div>
        </div>
    );
}

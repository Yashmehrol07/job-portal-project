import Link from 'next/link';
import styles from './about.module.css';

export default function AboutPage() {
    return (
        <div style={{ padding: '4rem 1rem', maxWidth: '800px', margin: '0 auto', minHeight: '60vh' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: 'var(--primary)', textAlign: 'center' }}>
                About PyTalent
            </h1>

            <div style={{ backgroundColor: 'var(--surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid var(--border)' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Our Mission</h2>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '2rem' }}>
                    At PyTalent, our mission is to connect top technical talent with the world's most innovative companies.
                    We believe that finding the right career opportunity should be seamless, transparent, and rewarding.
                    Our platform is designed to empower job seekers while providing employers with access to a pre-vetted pool of exceptional professionals.
                </p>

                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Project Documentation & Tech Stack</h2>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1rem' }}>
                    This modern Job Portal was engineered from the ground up using state-of-the-art web technologies and a robust serverless architecture.
                    Below is the core technology stack governing the platform's speed, security, and rendering capabilities:
                </p>
                <ul style={{ color: 'var(--text-muted)', lineHeight: '1.8', marginBottom: '2rem', listStyleType: 'disc', paddingLeft: '1.5rem' }}>
                    <li><strong>Framework:</strong> Next.js (App Router) with React 19</li>
                    <li><strong>Language:</strong> TypeScript for strict type-safety and scalability</li>
                    <li><strong>Database:</strong> Turso (Edge SQLite) utilizing <code style={{ backgroundColor: 'var(--background)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>@libsql/client</code></li>
                    <li><strong>Styling:</strong> Pure CSS Modules with custom variables for dynamic Dark/Light themes</li>
                    <li><strong>Authentication:</strong> Custom JWT-based stateless auth & bcryptjs encryption</li>
                    <li><strong>Deployment:</strong> Vercel Serverless Edge computing</li>
                </ul>

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                    <Link href="/jobs" className="btn btn-primary">
                        Browse Open Opportunities
                    </Link>
                </div>
            </div>
        </div>
    );
}

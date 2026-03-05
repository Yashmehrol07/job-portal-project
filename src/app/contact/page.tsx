'use client';
import { useState } from 'react';

export default function ContactPage() {
    const [status, setStatus] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Since there is no backend route for contact yet, simulate sending
        setStatus('Sending...');
        setTimeout(() => {
            setStatus('success');
        }, 1500);
    };

    return (
        <div style={{ padding: '4rem 1rem', maxWidth: '800px', margin: '0 auto', minHeight: '60vh' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: 'var(--primary)', textAlign: 'center' }}>
                Contact Us
            </h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                <div style={{ backgroundColor: 'var(--surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid var(--border)' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Get in Touch</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                        Have questions about our platform or need assistance finding the perfect role? Drop us a line.
                    </p>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            📍 Office Location
                        </h3>
                        <p style={{ color: 'var(--text-muted)' }}>123 Tech Avenue, Suite 400<br />San Francisco, CA 94105</p>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            ✉️ Email
                        </h3>
                        <p style={{ color: 'var(--text-muted)' }}>support@futuretech.com</p>
                    </div>

                    <div>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            📞 Phone
                        </h3>
                        <p style={{ color: 'var(--text-muted)' }}>+1 (555) 123-4567</p>
                    </div>
                </div>

                <div style={{ backgroundColor: 'var(--surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid var(--border)' }}>
                    {status === 'success' ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--success)' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                            <h3 style={{ marginBottom: '1rem' }}>Message Sent!</h3>
                            <p>Thank you for reaching out. Our team will get back to you shortly.</p>
                            <button onClick={() => setStatus(null)} className="btn btn-secondary" style={{ marginTop: '2rem' }}>
                                Send Another
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Name</label>
                                <input type="text" className="input" required placeholder="John Doe" />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Email</label>
                                <input type="email" className="input" required placeholder="john@example.com" />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Message</label>
                                <textarea className="input" required rows={5} placeholder="How can we help you?"></textarea>
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={status === 'Sending...'}>
                                {status === 'Sending...' ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

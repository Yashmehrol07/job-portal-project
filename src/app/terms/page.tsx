'use client';
import { useEffect, useState } from 'react';

export default function TermsPage() {
    const [dots, setDots] = useState('.');

    useEffect(() => {
        // Fun animation loop
        const interval = setInterval(() => {
            setDots(prev => prev.length >= 3 ? '.' : prev + '.');
        }, 500);

        // Execute the gag redirect after a short pause
        const redirectTimer = setTimeout(() => {
            window.location.href = 'https://chatgpt.com/?q=Show+me+standard+job+portal+terms+of+service';
        }, 3500);

        return () => {
            clearInterval(interval);
            clearTimeout(redirectTimer);
        };
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', textAlign: 'center', padding: '2rem' }}>
            <div style={{ backgroundColor: 'var(--surface)', padding: '4rem', borderRadius: 'var(--radius-lg)', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '2px solid var(--primary)', maxWidth: '600px', animation: 'fadeIn 0.5s ease-in' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🤖😂</div>
                <h1 style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '1rem', background: 'linear-gradient(90deg, #6C35DE, #C22ED0 50%, #EAA700)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Jo dekhna hai...
                </h1>
                <h2 style={{ fontSize: '2rem', color: 'var(--text-main)', marginBottom: '2rem' }}>
                    Yaha se dekh le!
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    Redirecting you to ChatGPT to read the Terms of Service{dots}
                </p>
                <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--border)', marginTop: '2rem', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--primary)', animation: 'progress 3.5s linear forwards' }}></div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes progress {
                    from { width: 0%; }
                    to { width: 100%; }
                }
            `}</style>
        </div>
    );
}

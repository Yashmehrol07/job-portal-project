'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './login.module.css';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (res.ok) {
                // Save user structure to localStorage for compatibility with existing dashboard setup
                localStorage.setItem('user', JSON.stringify(data.user));
                if (data.token) {
                    localStorage.setItem('token', data.token);
                }

                // Dynamic Role Routing
                if (data.user.role === 'ADMIN') {
                    router.push('/admin');
                } else if (data.user.role === 'EMPLOYER') {
                    router.push('/employer');
                } else {
                    router.push('/dashboard');
                }
            } else {
                setErrorMsg(data.error || 'Invalid credentials.');
            }
        } catch (error) {
            setErrorMsg('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.loginContainer}>
            <div className={styles.loginBox}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Welcome Back</h1>
                    <p className={styles.subtitle}>Enter your details to access your account.</p>
                </div>

                {errorMsg && (
                    <div style={{ backgroundColor: 'var(--error)', color: 'white', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: 500 }}>
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleLogin} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="email" className="label">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            className="input"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <div className="flex justify-between items-center mb-1">
                            <label htmlFor="password" className="label m-0">Password</label>
                            <Link href="/forgot-password" className={styles.forgotLink}>Forgot password?</Link>
                        </div>
                        <input
                            type="password"
                            id="password"
                            className="input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className={`btn btn-primary ${styles.submitBtn} ${isLoading ? styles.loading : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className={styles.footer}>
                    <p style={{ marginBottom: '0.75rem' }}>
                        Don't have an account?{' '}
                        <Link href="/signup" className={styles.signupLink}>Sign up</Link>
                    </p>
                </div>
            </div>

            {/* Decorative Elements */}
            <div className={styles.decoration1}></div>
            <div className={styles.decoration2}></div>
        </div>
    );
}

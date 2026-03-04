'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './signup.module.css';
import InterestSelectionModal from '@/components/ui/modals/InterestSelectionModal';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'USER' // Default to Job Seeker
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [showInterestModal, setShowInterestModal] = useState(false);
    const router = useRouter();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setErrorMsg("Passwords do not match");
            return;
        }

        setIsLoading(true);
        setErrorMsg('');

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                // Save base user data to local storage for quick access
                localStorage.setItem('user', JSON.stringify(data.user));
                if (data.token) {
                    localStorage.setItem('token', data.token);
                }

                // Show the interest modal after successful DB registration
                setShowInterestModal(true);
            } else {
                setErrorMsg(data.error || 'Failed to register account');
            }
        } catch (error) {
            setErrorMsg('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInterestsSaved = async (selections: { categories: string[], types: string[] }) => {
        try {
            // Combine both arrays to save to the main "interests" database field
            const combinedInterests = [...selections.categories, ...selections.types];

            const res = await fetch('/api/user/interests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ interests: combinedInterests })
            });

            if (res.ok) {
                const data = await res.json();

                // Update local storage user with new interests
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    parsedUser.interests = data.interests;
                    localStorage.setItem('user', JSON.stringify(parsedUser));
                }
            }
        } catch (error) {
            console.error("Failed to save interests cleanly:", error);
        } finally {
            setShowInterestModal(false);
            if (formData.role === 'EMPLOYER') {
                router.push('/employer');
            } else {
                router.push('/dashboard');
            }
        }
    };

    return (
        <div className={styles.signupContainer}>
            <div className={styles.signupBox}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Create an Account</h1>
                    <p className={styles.subtitle}>Join us and find your dream job today.</p>
                </div>

                {errorMsg && (
                    <div style={{ backgroundColor: 'var(--error)', color: 'white', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: 500 }}>
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleSignup} className={styles.form}>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
                        <button
                            type="button"
                            onClick={() => setFormData(p => ({ ...p, role: 'USER' }))}
                            style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', border: formData.role === 'USER' ? '2px solid var(--primary)' : '1px solid var(--border)', backgroundColor: formData.role === 'USER' ? 'rgba(var(--primary-rgb), 0.1)' : 'var(--surface)', color: formData.role === 'USER' ? 'var(--primary)' : 'var(--text-color)', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s ease' }}
                        >
                            👨‍💻 Job Seeker
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData(p => ({ ...p, role: 'EMPLOYER' }))}
                            style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', border: formData.role === 'EMPLOYER' ? '2px solid var(--primary)' : '1px solid var(--border)', backgroundColor: formData.role === 'EMPLOYER' ? 'rgba(var(--primary-rgb), 0.1)' : 'var(--surface)', color: formData.role === 'EMPLOYER' ? 'var(--primary)' : 'var(--text-color)', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s ease' }}
                        >
                            🏢 Employer
                        </button>
                    </div>

                    <div className={styles.nameGroup}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="firstName" className="label">First Name</label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                className="input"
                                placeholder="John"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label htmlFor="lastName" className="label">Last Name</label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                className="input"
                                placeholder="Doe"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="email" className="label">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="input"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="password" className="label">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className="input"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                            minLength={8}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="confirmPassword" className="label">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            className="input"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            required
                            minLength={8}
                        />
                    </div>

                    <button
                        type="submit"
                        className={`btn btn-primary ${styles.submitBtn} ${isLoading ? styles.loading : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <div className={styles.footer}>
                    <p>
                        Already have an account?{' '}
                        <Link href="/login" className={styles.loginLink}>Log in</Link>
                    </p>
                </div>
            </div>

            {/* Decorative Elements */}
            <div className={styles.decoration1}></div>
            <div className={styles.decoration2}></div>

            {/* Interest Selection Modal */}
            {showInterestModal && (
                <InterestSelectionModal
                    onClose={() => setShowInterestModal(false)}
                    onSave={handleInterestsSaved}
                />
            )}
        </div>
    );
}

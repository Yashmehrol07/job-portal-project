'use client';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Navbar.module.css';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [user, setUser] = useState<{ firstName?: string, lastName?: string, role?: string, email?: string, avatarUrl?: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [notifications, setNotifications] = useState<Array<{ id: string, title: string, message: string, createdAt: string, isRead: number }>>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch('/api/user/profile');
                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        setUser(data.user);
                    }
                } else if (res.status === 401) {
                    setUser(null);
                } else if (res.status === 401) {
                    // Soft fail for unauthenticated guest, no need to log an error
                    setUser(null);
                } else {
                    console.error('Failed to fetch user profile. Status:', res.status);
                }
            } catch (error) {
                console.error('Error fetching user profile:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, []);

    useEffect(() => {
        if (user) {
            const fetchNotifications = async () => {
                try {
                    const res = await fetch('/api/user/notifications');
                    if (res.ok) {
                        const data = await res.json();
                        if (data.success) {
                            setNotifications(data.notifications);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching notifications:', error);
                }
            };
            fetchNotifications();
        }
    }, [user]);

    const handleNotificationsClick = async () => {
        setShowNotifications(!showNotifications);

        // If opening and there are unread, mark them read
        if (!showNotifications && unreadCount > 0) {
            try {
                await fetch('/api/user/notifications', { method: 'PUT' });
                setNotifications(prev => prev.map(n => ({ ...n, isRead: 1 })));
            } catch {
                console.error('Failed to mark notifications read');
            }
        }
    };

    const unreadCount = notifications.filter(n => n.isRead === 0).length;

    const handleLogout = async () => {
        try {
            const res = await fetch('/api/auth/logout', { method: 'POST' });
            if (res.ok) {
                setUser(null);
                router.push('/login');
                router.refresh(); // Refresh to update layouts if necessary
            }
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <nav className={styles.navbar}>
            <div className={`container ${styles.navContainer}`}>
                <Link href="/" className={styles.logo}>
                    <Image
                        src="/pytalent-logo.png"
                        alt="PyTalent Logo"
                        width={140}
                        height={50}
                        className={styles.logoImage}
                        priority
                    />
                    <span className={styles.logoText}>PyTalent</span>
                </Link>

                {/* Desktop Menu */}
                <div className={styles.navLinks}>
                    <Link href="/jobs" className={styles.link}>Find Jobs</Link>
                    {user && <Link href="/admin" className={styles.link}>Post a Job</Link>}
                    <div className={styles.divider}></div>

                    {!isLoading && (
                        <>
                            {user ? (
                                <>
                                    {/* Notification Bell */}
                                    <div style={{ position: 'relative' }}>
                                        <button
                                            onClick={handleNotificationsClick}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', padding: '0.5rem', position: 'relative' }}
                                            aria-label="Notifications"
                                        >
                                            🔔
                                            {unreadCount > 0 && (
                                                <span style={{ position: 'absolute', top: 0, right: 0, backgroundColor: 'red', color: 'white', borderRadius: '50%', padding: '0.1rem 0.4rem', fontSize: '0.7rem', fontWeight: 'bold' }}>
                                                    {unreadCount}
                                                </span>
                                            )}
                                        </button>

                                        {/* Dropdown */}
                                        {showNotifications && (
                                            <div style={{ position: 'absolute', top: '100%', right: 0, width: '300px', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', zIndex: 1000, maxHeight: '400px', overflowY: 'auto' }}>
                                                <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', fontWeight: 'bold' }}>
                                                    Notifications
                                                </div>
                                                {notifications.length === 0 ? (
                                                    <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                                        No new notifications
                                                    </div>
                                                ) : (
                                                    <div>
                                                        {notifications.map(notif => (
                                                            <div key={notif.id} style={{ padding: '1rem', borderBottom: '1px solid var(--border)', backgroundColor: notif.isRead ? 'transparent' : 'rgba(var(--primary-rgb), 0.05)' }}>
                                                                <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem' }}>{notif.title}</h4>
                                                                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{notif.message}</p>
                                                                <small style={{ display: 'block', marginTop: '0.5rem', color: 'var(--text-light)', fontSize: '0.7rem' }}>
                                                                    {new Date(notif.createdAt).toLocaleDateString()}
                                                                </small>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <Link href="/dashboard" className={styles.loginBtn}>Dashboard</Link>
                                    <button onClick={handleLogout} className={styles.loginBtn} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Logout</button>
                                </>
                            ) : (
                                <>
                                    <Link href="/login" className={styles.loginBtn}>Login</Link>
                                    <Link href="/signup" className={`btn btn-primary ${styles.signupBtn}`}>Sign Up</Link>
                                </>
                            )}
                        </>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className={styles.mobileMenuBtn}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {isMenuOpen ? '✕' : '☰'}
                </button>

                {/* Mobile Menu Layout */}
                {isMenuOpen && (
                    <div className={styles.mobileMenu}>
                        <Link href="/jobs" className={styles.mobileLink} onClick={() => setIsMenuOpen(false)}>Find Jobs</Link>
                        {user && <Link href="/admin" className={styles.mobileLink} onClick={() => setIsMenuOpen(false)}>Post a Job</Link>}

                        {!isLoading && (
                            <>
                                {user ? (
                                    <>
                                        <Link href="/dashboard" className={styles.mobileLink} onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                                        <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className={styles.mobileLink} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}>Logout</button>
                                    </>
                                ) : (
                                    <>
                                        <Link href="/login" className={styles.mobileLink} onClick={() => setIsMenuOpen(false)}>Login</Link>
                                        <Link href="/signup" className={styles.mobileLink} onClick={() => setIsMenuOpen(false)}>Sign Up</Link>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}

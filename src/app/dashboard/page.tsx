'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import Link from 'next/link';

export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState<{ firstName?: string, lastName?: string, role?: string, email?: string, avatarUrl?: string, interests?: string[] } | null>(null);
    const [activeTab, setActiveTab] = useState('overview');

    // Applications State
    const [userApplications, setUserApplications] = useState<Array<{ applicationId: string, status: string, appliedAt: string, jobId: string, title: string, company: string, location: string, type: string }>>([]);
    const [isLoadingApps, setIsLoadingApps] = useState(false);

    // Saved Jobs State
    const [savedJobs, setSavedJobs] = useState<Array<{ savedJobId: string, savedAt: string, jobId: string, title: string, company: string, location: string, type: string, category: string, salaryInterval: string }>>([]);
    const [isLoadingSaved, setIsLoadingSaved] = useState(false);

    // Edit Form State
    const [isSaving, setIsSaving] = useState(false);
    const [editForm, setEditForm] = useState({
        firstName: '',
        lastName: '',
        avatarUrl: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const res = await fetch('/api/user/profile');
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                    setEditForm({
                        firstName: data.user.firstName || '',
                        lastName: data.user.lastName || '',
                        avatarUrl: data.user.avatarUrl || ''
                    });
                    localStorage.setItem('user', JSON.stringify(data.user));
                } else {
                    router.push('/login');
                }
            } catch {
                console.error('Failed to load real profile');
                router.push('/login');
            }
        };

        const fetchApplications = async () => {
            setIsLoadingApps(true);
            try {
                const res = await fetch('/api/user/applications');
                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        setUserApplications(data.applications);
                    }
                }
            } catch (error) {
                console.error("Failed to load applications:", error);
            } finally {
                setIsLoadingApps(false);
            }
        };

        const fetchSavedJobs = async () => {
            setIsLoadingSaved(true);
            try {
                const res = await fetch('/api/user/saved-jobs');
                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        setSavedJobs(data.savedJobs);
                    }
                }
            } catch (error) {
                console.error("Failed to load saved jobs:", error);
            } finally {
                setIsLoadingSaved(false);
            }
        };

        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                if (parsed.role === 'ADMIN') {
                    router.push('/admin'); // Admins don't belong in the standard user dashboard
                    return;
                }

                // Show cached data immediately, then fetch fresh data
                setUser(parsed);
                setEditForm({
                    firstName: parsed.firstName || '',
                    lastName: parsed.lastName || '',
                    avatarUrl: parsed.avatarUrl || ''
                });
            } catch { }
        }

        fetchUserProfile();
        fetchApplications();
        fetchSavedJobs();
    }, [router]);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        setIsSaving(true);

        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm),
            });
            const data = await res.json();

            if (res.ok) {
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
                setUser(data.user);
                localStorage.setItem('user', JSON.stringify(data.user));
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to update profile' });
            }
        } catch {
            setMessage({ type: 'error', text: 'An unexpected error occurred.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleRemoveSavedJob = async (jobId: string) => {
        try {
            const res = await fetch(`/api/user/saved-jobs/${jobId}`, { method: 'DELETE' });
            if (res.ok) {
                setSavedJobs(prev => prev.filter(job => job.jobId !== jobId));
            }
        } catch (error) {
            console.error("Error removing saved job", error);
        }
    };

    if (!user) {
        return <div className={styles.loading}>Loading dashboard...</div>;
    }

    return (
        <div className={styles.dashboardContainer}>
            <div className={`container ${styles.dashboardLayout}`}>
                {/* Sidebar */}
                <aside className={styles.sidebar}>
                    <div className={styles.userInfo}>
                        <div className={styles.avatar}>
                            {user.avatarUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={user.avatarUrl} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                                user.firstName?.charAt(0) || 'U'
                            )}
                        </div>
                        <h2 className={styles.userName}>{user.firstName} {user.lastName}</h2>
                        <p className={styles.userRole}>{user.role === 'ADMIN' ? 'Employer' : 'Job Seeker'}</p>
                    </div>

                    <nav className={styles.navMenu}>
                        <button
                            className={`${styles.navItem} ${activeTab === 'overview' ? styles.active : ''}`}
                            onClick={() => setActiveTab('overview')}
                        >
                            Overview
                        </button>
                        <button
                            className={`${styles.navItem} ${activeTab === 'applications' ? styles.active : ''}`}
                            onClick={() => setActiveTab('applications')}
                        >
                            My Applications
                        </button>
                        <button
                            className={`${styles.navItem} ${activeTab === 'saved' ? styles.active : ''}`}
                            onClick={() => setActiveTab('saved')}
                        >
                            Saved Jobs
                        </button>
                        <button
                            className={`${styles.navItem} ${activeTab === 'settings' ? styles.active : ''}`}
                            onClick={() => setActiveTab('settings')}
                        >
                            Settings
                        </button>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className={styles.mainContent}>
                    <div className={styles.header}>
                        <h1 className={styles.pageTitle}>
                            {activeTab === 'overview' && 'Dashboard Overview'}
                            {activeTab === 'applications' && 'My Applications'}
                            {activeTab === 'saved' && 'Saved Jobs'}
                            {activeTab === 'settings' && 'Profile Settings'}
                        </h1>
                    </div>

                    {activeTab === 'overview' && (
                        <div className={styles.overviewGrid}>
                            <div className={`${styles.statCard} animate-fade-in-up`}>
                                <h3>Total Applications</h3>
                                <p className={styles.statNumber}>{userApplications.length}</p>
                            </div>
                            <div className={`${styles.statCard} animate-fade-in-up delay-100`}>
                                <h3>Saved Jobs</h3>
                                <p className={styles.statNumber}>{savedJobs.length}</p>
                            </div>
                            <div className={`${styles.statCard} animate-fade-in-up delay-200`}>
                                <h3>Profile Views</h3>
                                <p className={styles.statNumber}>12</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'applications' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2>Your Applied Jobs</h2>
                            </div>

                            {isLoadingApps ? (
                                <div className={styles.loading}>Loading applications...</div>
                            ) : userApplications.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <div className={styles.emptyIcon}>📄</div>
                                    <h3>No Applications Yet</h3>
                                    <p>You haven&apos;t applied to any jobs yet. Start browsing to find your next opportunity!</p>
                                    <Link href="/jobs" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
                                        Find Jobs
                                    </Link>
                                </div>
                            ) : (
                                <div className={styles.jobsList}>
                                    {userApplications.map((app, i) => (
                                        <div key={app.applicationId} className={`${styles.jobRow} animate-fade-in-up`} style={{ animationDelay: `${i * 50}ms`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)', marginBottom: '0.5rem' }}>
                                            <div>
                                                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--primary)' }}>
                                                    <Link href={`/jobs/${app.jobId}`}>{app.title}</Link>
                                                </h3>
                                                <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                                    {app.company} • {app.location} • {app.type}
                                                </p>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <span style={{
                                                    display: 'inline-block',
                                                    padding: '0.25rem 0.75rem',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 'bold',
                                                    backgroundColor: app.status === 'PENDING' ? 'var(--secondary)' : 'var(--primary)',
                                                    color: 'white',
                                                    borderRadius: 'var(--radius-full)',
                                                    marginBottom: '0.25rem'
                                                }}>
                                                    {app.status}
                                                </span>
                                                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                    Applied {new Date(app.appliedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'saved' && (
                        <div className={styles.settingsPanel}>
                            <div className="flex justify-between items-center mb-6">
                                <h2>Your Saved Jobs</h2>
                            </div>

                            {isLoadingSaved ? (
                                <div className={styles.loading}>Loading saved jobs...</div>
                            ) : savedJobs.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <div className={styles.emptyIcon}>🔖</div>
                                    <h3>No Saved Jobs</h3>
                                    <p>You haven&apos;t saved any jobs yet. Bookmark roles you like to review them later!</p>
                                    <Link href="/jobs" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
                                        Browse Jobs
                                    </Link>
                                </div>
                            ) : (
                                <div className={styles.jobsList}>
                                    {savedJobs.map((job, i) => (
                                        <div key={job.savedJobId} className={`${styles.jobRow} animate-fade-in-up`} style={{ animationDelay: `${i * 50}ms`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)', marginBottom: '0.5rem' }}>
                                            <div>
                                                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--primary)' }}>
                                                    <Link href={`/jobs/${job.jobId}`}>{job.title}</Link>
                                                </h3>
                                                <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                                    {job.company} • {job.location} • {job.type}
                                                </p>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <button
                                                    onClick={() => handleRemoveSavedJob(job.jobId)}
                                                    className="btn btn-secondary btn-sm"
                                                    style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', backgroundColor: 'var(--surface)', color: 'var(--error)', border: '1px solid var(--error)', borderRadius: 'var(--radius-sm)', marginBottom: '0.25rem', cursor: 'pointer' }}
                                                >
                                                    Remove
                                                </button>
                                                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                    Saved {new Date(job.savedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className={styles.settingsPanel}>
                            {message.text && (
                                <div className={`alert ${message.type === 'error' ? 'alert-error' : 'alert-success'}`}>
                                    {message.text}
                                </div>
                            )}
                            <form onSubmit={handleProfileUpdate} className={styles.settingsForm}>
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>First Name</label>
                                        <input type="text" value={editForm.firstName} onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })} className="input" required />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Last Name</label>
                                        <input type="text" value={editForm.lastName} onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })} className="input" required />
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Profile Picture URL</label>
                                    <input type="url" placeholder="https://example.com/my-photo.jpg" value={editForm.avatarUrl} onChange={(e) => setEditForm({ ...editForm, avatarUrl: e.target.value })} className="input" />
                                    <span className={styles.helpText}>Provide a working image URL to display as your avatar.</span>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Email Address</label>
                                    <input type="email" value={user.email} disabled className="input" />
                                    <span className={styles.helpText}>Email cannot be changed at this time.</span>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Your Interests</label>
                                    <div className={styles.interestsList}>
                                        {user.interests?.map((interest: string) => (
                                            <span key={interest} className={styles.interestTag}>{interest}</span>
                                        ))}
                                        {(!user.interests || user.interests.length === 0) && (
                                            <span>No interests selected.</span>
                                        )}
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary" disabled={isSaving}>
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </form>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

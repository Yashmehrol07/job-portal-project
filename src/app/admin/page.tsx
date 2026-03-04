'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../dashboard/page.module.css'; // Reuse dashboard styles

export default function AdminDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<{ firstName?: string, lastName?: string, role?: string, email?: string, avatarUrl?: string } | null>(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({ totalJobs: 0, totalUsers: 0, totalApplications: 0 });
    const [isLoadingStats, setIsLoadingStats] = useState(true);

    // Job Management State
    const [jobsList, setJobsList] = useState<Array<{ id: string, title: string, company: string, location: string, type: string, category: string, salaryInterval: string, description: string, requirements: string[] }>>([]);
    const [isLoadingJobs, setIsLoadingJobs] = useState(false);
    const [editingJobId, setEditingJobId] = useState<string | null>(null);

    // Users Management State
    const [usersList, setUsersList] = useState<Array<{ id: string, firstName: string, lastName: string, email: string, role: string, createdAt: string }>>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);

    // Application Review State
    const [adminApplications, setAdminApplications] = useState<Array<{ applicationId: string, status: string, coverLetter: string | null, appliedAt: string, applicantId: string, applicantFirstName: string, applicantLastName: string, applicantEmail: string, jobId: string, jobTitle: string, jobCompany: string }>>([]);
    const [isLoadingAdminApps, setIsLoadingAdminApps] = useState(false);

    // Create Form State
    const [isPosting, setIsPosting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [jobForm, setJobForm] = useState({
        title: '',
        company: '',
        location: '',
        type: 'Full Time',
        category: 'IT',
        salaryInterval: '',
        description: '',
        requirements: ''
    });

    const categories = ['IT', 'Marketing', 'Finance', 'Healthcare', 'Engineering', 'Education', 'Design'];
    const jobTypes = ['Full Time', 'Part Time', 'Contract', 'Internship'];

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/admin/stats');
                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        setStats(data.stats);
                    }
                }
            } catch (error) {
                console.error("Failed to load dashboard stats", error);
            } finally {
                setIsLoadingStats(false);
            }
        };

        const fetchAdminJobs = async () => {
            setIsLoadingJobs(true);
            try {
                const res = await fetch('/api/admin/jobs');
                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        setJobsList(data.jobs);
                    }
                }
            } catch (error) {
                console.error("Failed to load admin jobs", error);
            } finally {
                setIsLoadingJobs(false);
            }
        };

        const fetchAdminApplications = async () => {
            setIsLoadingAdminApps(true);
            try {
                const res = await fetch('/api/admin/applications');
                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        setAdminApplications(data.applications);
                    }
                }
            } catch (error) {
                console.error("Failed to load admin applications", error);
            } finally {
                setIsLoadingAdminApps(false);
            }
        };

        const fetchAdminUsers = async () => {
            setIsLoadingUsers(true);
            try {
                const res = await fetch('/api/admin/users');
                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        setUsersList(data.users);
                    }
                }
            } catch (error) {
                console.error("Failed to load admin users", error);
            } finally {
                setIsLoadingUsers(false);
            }
        };

        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            if (parsed.role !== 'ADMIN') {
                router.push('/dashboard'); // Kick regular users out
            } else {
                setUser(parsed);
                fetchStats();
            }
        } else {
            // For preview, set a fake admin if none exists
            setUser({ firstName: 'Admin', role: 'ADMIN', email: 'admin@example.com' });
            fetchStats();
            fetchAdminJobs();
            fetchAdminApplications();
            fetchAdminUsers();
        }
    }, [router]);

    const handleCreateOrUpdateJob = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        setIsPosting(true);

        try {
            // Convert newline-separated requirements into array
            const reqArray = jobForm.requirements
                .split('\n')
                .map(req => req.trim())
                .filter(req => req.length > 0);

            const payload = {
                ...jobForm,
                requirements: reqArray
            };

            const url = editingJobId ? `/api/admin/jobs/${editingJobId}` : '/api/jobs/create';
            const method = editingJobId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (res.ok) {
                setMessage({ type: 'success', text: editingJobId ? 'Job updated successfully!' : 'Job posted successfully!' });
                setJobForm({
                    title: '', company: '', location: '', type: 'Full Time', category: 'IT', salaryInterval: '', description: '', requirements: ''
                });

                if (!editingJobId) {
                    setStats(prev => ({ ...prev, totalJobs: prev.totalJobs + 1 }));
                }

                setEditingJobId(null);
                setActiveTab('manage'); // Switch to manage tab

                // Refresh list if we stay mounted
                try {
                    const jobsRes = await fetch('/api/admin/jobs');
                    if (jobsRes.ok) {
                        const jobsData = await jobsRes.json();
                        if (jobsData.success) {
                            setJobsList(jobsData.jobs);
                        }
                    }
                } catch { }

            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to save job.' });
            }
        } catch {
            setMessage({ type: 'error', text: 'An unexpected error occurred.' });
        } finally {
            setIsPosting(false);
        }
    };

    const handleEditClick = (job: { id: string, title: string, company: string, location: string, type: string, category: string, salaryInterval?: string, description: string, requirements?: string[] }) => {
        setEditingJobId(job.id);
        setJobForm({
            title: job.title,
            company: job.company,
            location: job.location,
            type: job.type,
            category: job.category,
            salaryInterval: job.salaryInterval || '',
            description: job.description,
            requirements: job.requirements ? job.requirements.join('\n') : ''
        });
        setActiveTab('post'); // Switch to the form view
    };

    const handleDeleteJob = async (id: string) => {
        if (!confirm('Are you sure you want to delete this job posting?')) return;

        try {
            const res = await fetch(`/api/admin/jobs/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setJobsList(prev => prev.filter(job => job.id !== id));
                setStats(prev => ({ ...prev, totalJobs: prev.totalJobs > 0 ? prev.totalJobs - 1 : 0 }));
            } else {
                alert('Failed to delete job');
            }
        } catch (error) {
            console.error('Error deleting job:', error);
            alert('Error deleting job');
        }
    };

    if (!user) {
        return <div className={styles.loading}>Loading Employer Dashboard...</div>;
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
                                user.firstName?.charAt(0) || 'A'
                            )}
                        </div>
                        <h2 className={styles.userName}>{user.firstName} {user.lastName}</h2>
                        <p className={styles.userRole}>Super Admin</p>
                    </div>

                    <nav className={styles.navMenu}>
                        <button
                            className={`${styles.navItem} ${activeTab === 'overview' ? styles.active : ''}`}
                            onClick={() => setActiveTab('overview')}
                        >
                            Overview
                        </button>
                        <button
                            className={`${styles.navItem} ${activeTab === 'post' ? styles.active : ''}`}
                            onClick={() => {
                                setEditingJobId(null);
                                setJobForm({
                                    title: '', company: '', location: '', type: 'Full Time', category: 'IT', salaryInterval: '', description: '', requirements: ''
                                });
                                setMessage({ type: '', text: '' });
                                setActiveTab('post');
                            }}
                        >
                            ➕ {editingJobId ? 'Edit Job' : 'Post a Job'}
                        </button>
                        <button
                            className={`${styles.navItem} ${activeTab === 'manage' ? styles.active : ''}`}
                            onClick={() => setActiveTab('manage')}
                        >
                            Manage Job Postings
                        </button>
                        <button
                            className={`${styles.navItem} ${activeTab === 'users' ? styles.active : ''}`}
                            onClick={() => setActiveTab('users')}
                        >
                            Manage Users
                        </button>
                        <button
                            className={`${styles.navItem} ${activeTab === 'applications' ? styles.active : ''}`}
                            onClick={() => setActiveTab('applications')}
                        >
                            Review Applications
                        </button>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className={styles.mainContent}>
                    <div className={styles.header}>
                        <h1 className={styles.pageTitle}>
                            {activeTab === 'overview' && 'Super Admin Overview'}
                            {activeTab === 'post' && (editingJobId ? 'Edit Job Posting' : 'Create New Job Posting')}
                            {activeTab === 'manage' && 'Manage All Jobs'}
                            {activeTab === 'users' && 'Manage All Users'}
                            {activeTab === 'applications' && 'Review All Applications'}
                        </h1>
                    </div>

                    {activeTab === 'overview' && (
                        <div className={styles.overviewGrid}>
                            <div className={`${styles.statCard} animate-fade-in-up`}>
                                <h3>Total Active Jobs</h3>
                                {isLoadingStats ? (
                                    <p className={styles.statNumber} style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Loading...</p>
                                ) : (
                                    <p className={styles.statNumber}>{stats.totalJobs}</p>
                                )}
                            </div>
                            <div className={`${styles.statCard} animate-fade-in-up delay-100`}>
                                <h3>Total Users</h3>
                                {isLoadingStats ? (
                                    <p className={styles.statNumber} style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Loading...</p>
                                ) : (
                                    <p className={styles.statNumber}>{stats.totalUsers}</p>
                                )}
                            </div>
                            <div className={`${styles.statCard} animate-fade-in-up delay-200`}>
                                <h3>Total Applications</h3>
                                {isLoadingStats ? (
                                    <p className={styles.statNumber} style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Loading...</p>
                                ) : (
                                    <p className={styles.statNumber}>{stats.totalApplications}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'post' && (
                        <div className={styles.settingsPanel} style={{ maxWidth: '800px' }}>
                            {message.text && (
                                <div className={`alert ${message.type === 'error' ? 'alert-error' : 'alert-success'}`}>
                                    {message.text}
                                </div>
                            )}

                            <form onSubmit={handleCreateOrUpdateJob} className={styles.settingsForm}>
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>Job Title</label>
                                        <input type="text" className="input" required value={jobForm.title} onChange={e => setJobForm({ ...jobForm, title: e.target.value })} placeholder="e.g. Senior React Developer" />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Company Name</label>
                                        <input type="text" className="input" required value={jobForm.company} onChange={e => setJobForm({ ...jobForm, company: e.target.value })} placeholder="e.g. Acme Corp" />
                                    </div>
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>Location</label>
                                        <input type="text" className="input" required value={jobForm.location} onChange={e => setJobForm({ ...jobForm, location: e.target.value })} placeholder="e.g. Remote, or New York, NY" />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Salary (Optional)</label>
                                        <input type="text" className="input" value={jobForm.salaryInterval} onChange={e => setJobForm({ ...jobForm, salaryInterval: e.target.value })} placeholder="e.g. $100k - $120k / year" />
                                    </div>
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>Job Type</label>
                                        <select className="input" value={jobForm.type} onChange={e => setJobForm({ ...jobForm, type: e.target.value })}>
                                            {jobTypes.map(t => <option key={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Category</label>
                                        <select className="input" value={jobForm.category} onChange={e => setJobForm({ ...jobForm, category: e.target.value })}>
                                            {categories.map(c => <option key={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Job Description</label>
                                    <textarea className="input" required rows={6} value={jobForm.description} onChange={e => setJobForm({ ...jobForm, description: e.target.value })} placeholder="Describe the role and responsibilities..."></textarea>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Requirements</label>
                                    <textarea className="input" rows={4} value={jobForm.requirements} onChange={e => setJobForm({ ...jobForm, requirements: e.target.value })} placeholder="Enter one requirement per line..."></textarea>
                                    <span className={styles.helpText}>Press Enter for a new line. Each line will be a bullet point.</span>
                                </div>

                                <div className="flex gap-4">
                                    <button type="submit" className="btn btn-primary" disabled={isPosting}>
                                        {isPosting ? 'Saving...' : (editingJobId ? 'Save Changes' : 'Publish Job Listing')}
                                    </button>
                                    {editingJobId && (
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => {
                                                setEditingJobId(null);
                                                setJobForm({
                                                    title: '', company: '', location: '', type: 'Full Time', category: 'IT', salaryInterval: '', description: '', requirements: ''
                                                });
                                                setActiveTab('manage');
                                            }}
                                        >
                                            Cancel Editing
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'manage' && (
                        <div className={styles.settingsPanel}>
                            <div className="flex justify-between items-center mb-6">
                                <h2>All Posted Jobs</h2>
                                <button className="btn btn-primary btn-sm" onClick={() => {
                                    setEditingJobId(null);
                                    setJobForm({
                                        title: '', company: '', location: '', type: 'Full Time', category: 'IT', salaryInterval: '', description: '', requirements: ''
                                    });
                                    setActiveTab('post');
                                }}>➕ Create New</button>
                            </div>

                            {isLoadingJobs ? (
                                <div className={styles.loading}>Loading jobs...</div>
                            ) : jobsList.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <div className={styles.emptyIcon}>💼</div>
                                    <h3>No Jobs Found</h3>
                                    <p>You haven&apos;t posted any jobs yet.</p>
                                </div>
                            ) : (
                                <div className={styles.jobsList}>
                                    {jobsList.map((job, i) => (
                                        <div key={job.id} className={`${styles.jobRow} animate-fade-in-up`} style={{ animationDelay: `${i * 50}ms`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)', marginBottom: '0.5rem' }}>
                                            <div>
                                                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--primary)' }}>{job.title}</h3>
                                                <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                                    {job.company} • {job.location} • {job.type}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => handleEditClick(job)}
                                                    style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteJob(job.id)}
                                                    style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', backgroundColor: 'var(--error)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'applications' && (
                        <div className={styles.settingsPanel}>
                            <div className="flex justify-between items-center mb-6">
                                <h2>Incoming Applications</h2>
                            </div>

                            {isLoadingAdminApps ? (
                                <div className={styles.loading}>Loading applications...</div>
                            ) : adminApplications.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <div className={styles.emptyIcon}>📂</div>
                                    <h3>No Applications Found</h3>
                                    <p>Your job postings have not received any applications yet.</p>
                                </div>
                            ) : (
                                <div className={styles.jobsList}>
                                    {adminApplications.map((app, i) => (
                                        <div key={app.applicationId} className={`animate-fade-in-up`} style={{ animationDelay: `${i * 50}ms`, padding: '1rem', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                                <div>
                                                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--primary)' }}>
                                                        {app.jobTitle} <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 'normal' }}>at {app.jobCompany}</span>
                                                    </h3>
                                                    <p style={{ margin: '0.25rem 0 0 0', fontWeight: 'bold' }}>
                                                        Applicant: {app.applicantFirstName} {app.applicantLastName}
                                                    </p>
                                                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                                        Email: {app.applicantEmail} • Applied: {new Date(app.appliedAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                                                    <select
                                                        className="input"
                                                        style={{ padding: '0.25rem 0.5rem', width: 'auto', fontSize: '0.875rem' }}
                                                        value={app.status}
                                                        onChange={async (e) => {
                                                            const newStatus = e.target.value;
                                                            try {
                                                                const res = await fetch(`/api/admin/applications/${app.applicationId}`, {
                                                                    method: 'PUT',
                                                                    headers: { 'Content-Type': 'application/json' },
                                                                    body: JSON.stringify({ status: newStatus })
                                                                });
                                                                if (res.ok) {
                                                                    setAdminApplications(prev => prev.map(a => a.applicationId === app.applicationId ? { ...a, status: newStatus } : a));
                                                                }
                                                            } catch (err) {
                                                                console.error("Failed to update status", err);
                                                            }
                                                        }}
                                                    >
                                                        <option value="PENDING">Pending</option>
                                                        <option value="REVIEWING">Reviewing</option>
                                                        <option value="ACCEPTED">Accepted</option>
                                                        <option value="REJECTED">Rejected</option>
                                                    </select>
                                                </div>
                                            </div>
                                            {app.coverLetter && (
                                                <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', borderLeft: '3px solid var(--primary)' }}>
                                                    <strong>Cover Letter:</strong>
                                                    <p style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap', color: 'var(--text-color)' }}>{app.coverLetter}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className={styles.settingsPanel}>
                            <div className="flex justify-between items-center mb-6">
                                <h2>All Registered Users</h2>
                            </div>

                            {isLoadingUsers ? (
                                <div className={styles.loading}>Loading users...</div>
                            ) : usersList.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <div className={styles.emptyIcon}>👥</div>
                                    <h3>No Users Found</h3>
                                    <p>The platform has no registered users yet.</p>
                                </div>
                            ) : (
                                <div className={styles.jobsList}>
                                    {usersList.map((usr, i) => (
                                        <div key={usr.id} className={`${styles.jobRow} animate-fade-in-up`} style={{ animationDelay: `${i * 50}ms`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)', marginBottom: '0.5rem' }}>
                                            <div>
                                                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--primary)' }}>{usr.firstName} {usr.lastName}</h3>
                                                <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                                    {usr.email}
                                                </p>
                                                <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                                    Joined: {new Date(usr.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <span style={{
                                                    padding: '0.25rem 0.75rem',
                                                    fontSize: '0.875rem',
                                                    backgroundColor: usr.role === 'ADMIN' ? 'var(--primary)' : usr.role === 'EMPLOYER' ? '#eab308' : 'var(--text-muted)',
                                                    color: 'white',
                                                    borderRadius: 'var(--radius-sm)',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {usr.role}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

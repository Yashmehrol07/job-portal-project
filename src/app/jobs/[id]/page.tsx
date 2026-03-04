'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

export default function JobDetailsPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const jobId = params.id;
    const [job, setJob] = useState<{ id: string, title: string, company: string, location: string, type: string, category: string, salaryInterval?: string, description: string, requirements?: string[], poster?: { firstName: string, lastName: string, avatarUrl: string }, createdAt: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [coverLetter, setCoverLetter] = useState('');

    // Saved Job State
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const res = await fetch(`/api/jobs/${jobId}`);
                const data = await res.json();
                if (data.success) {
                    setJob(data.job);
                } else {
                    setMessage('Job not found.');
                }
            } catch (error) {
                console.error('Error fetching job details:', error);
                setMessage('An error occurred while loading job details.');
            } finally {
                setLoading(false);
            }
        };

        if (jobId) {
            fetchJob();
        }
    }, [jobId]);

    const handleApply = async () => {
        setApplying(true);
        setMessage('');
        setIsError(false);

        try {
            const res = await fetch('/api/applications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobId, coverLetter })
            });

            const data = await res.json();

            if (res.ok) {
                setMessage('Application submitted successfully! 🚀');
                setCoverLetter('');
            } else {
                setMessage(data.error || 'Failed to apply');
                setIsError(true);
            }
        } catch (error) {
            setMessage('A network error occurred');
            setIsError(true);
        } finally {
            setApplying(false);
        }
    };

    const handleSaveJob = async () => {
        setSaving(true);
        setSaveMessage('');

        try {
            const res = await fetch('/api/user/saved-jobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobId })
            });

            if (res.ok) {
                setSaveMessage('Saved!');
            } else {
                setSaveMessage('Failed to save');
            }
        } catch {
            setSaveMessage('Error saving');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.centeredContainer}>
                <div className={styles.spinner}></div>
                <p>Loading job details...</p>
            </div>
        );
    }

    if (!job) {
        return (
            <div className={styles.centeredContainer}>
                <h2>Oops!</h2>
                <p>{message || 'We could not find the job you are looking for.'}</p>
                <Link href="/jobs" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                    Back to Jobs
                </Link>
            </div>
        );
    }

    return (
        <div className={styles.jobDetailsContainer}>
            <div className="container">
                <Link href="/jobs" className={styles.backLink}>← Back to all jobs</Link>

                {message && !message.includes('not found') && (
                    <div className={`alert ${isError ? 'alert-error' : 'alert-success'}`} style={{ marginBottom: '2rem' }}>
                        {message}
                    </div>
                )}

                <div className={styles.mainLayout}>
                    {/* Left Column: Job Info */}
                    <div className={styles.contentColumn}>
                        <div className={styles.headerCard}>
                            <h1 className={styles.title}>{job.title}</h1>
                            <div className={styles.companyInfo}>
                                <div className={styles.companyLogo}>
                                    {job.company.charAt(0)}
                                </div>
                                <div>
                                    <h2 className={styles.companyName}>{job.company}</h2>
                                    <p className={styles.location}>📍 {job.location}</p>
                                </div>
                            </div>

                            <div className={styles.tagsContainer}>
                                <span className={styles.tag}>{job.type}</span>
                                <span className={styles.tag}>{job.category}</span>
                                {job.salaryInterval && <span className={styles.tag}>💰 {job.salaryInterval}</span>}
                            </div>
                        </div>

                        <div className={styles.detailsCard}>
                            <h3>Job Description</h3>
                            <div className={styles.descriptionContent}>
                                {job.description.split('\n').map((paragraph: string, i: number) => (
                                    <p key={i}>{paragraph}</p>
                                ))}
                            </div>

                            {job.requirements && job.requirements.length > 0 && (
                                <>
                                    <h3 style={{ marginTop: '2rem' }}>Requirements</h3>
                                    <ul className={styles.requirementsList}>
                                        {job.requirements.map((req: string, i: number) => (
                                            <li key={i}>{req}</li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Actions */}
                    <div className={styles.sidebarColumn}>
                        <div className={styles.actionCard}>
                            <h3>Ready to Apply?</h3>
                            <p>Submit your application now to be considered for this role at {job.company}.</p>

                            {!message.includes('success') && (
                                <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                                    <label htmlFor="coverLetter" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Cover Letter (Optional)</label>
                                    <textarea
                                        id="coverLetter"
                                        className="input"
                                        rows={4}
                                        placeholder="Why are you a great fit?"
                                        value={coverLetter}
                                        onChange={(e) => setCoverLetter(e.target.value)}
                                        style={{ resize: 'vertical' }}
                                    ></textarea>
                                </div>
                            )}

                            <button
                                className={`btn btn-primary ${styles.fullWidthBtn}`}
                                onClick={handleApply}
                                disabled={applying || message.includes('success')}
                            >
                                {applying ? 'Submitting...' : message.includes('success') ? 'Applied ✓' : 'Apply Now'}
                            </button>
                            <button
                                className={`btn btn-outline ${styles.fullWidthBtn}`}
                                style={{ marginTop: '1rem' }}
                                onClick={handleSaveJob}
                                disabled={saving || saveMessage === 'Saved!'}
                            >
                                {saving ? 'Saving...' : saveMessage === 'Saved!' ? 'Saved for Later ★' : 'Save for Later'}
                            </button>

                            {saveMessage && saveMessage !== 'Saved!' && (
                                <p style={{ color: 'var(--error)', fontSize: '0.8rem', marginTop: '0.5rem', textAlign: 'center' }}>
                                    {saveMessage}
                                </p>
                            )}
                        </div>

                        <div className={styles.posterCard}>
                            <h4>Posted By</h4>
                            <div className={styles.posterInfo}>
                                <div className={styles.posterAvatar}>
                                    {job.poster?.avatarUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={job.poster.avatarUrl} alt="Poster" />
                                    ) : (
                                        job.poster?.firstName?.charAt(0) || 'E'
                                    )}
                                </div>
                                <div>
                                    <p className={styles.posterName}>
                                        {job.poster?.firstName} {job.poster?.lastName}
                                    </p>
                                    <p className={styles.postDate}>
                                        Posted {new Date(job.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

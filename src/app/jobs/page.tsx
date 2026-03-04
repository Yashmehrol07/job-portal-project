'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function JobsPage() {
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [locationTerm, setLocationTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');

    const categories = ['All', 'Information Technology (IT)', 'Marketing', 'Finance', 'Healthcare', 'Engineering', 'Education', 'Design'];
    const jobTypes = ['All', 'Full Time', 'Part Time', 'Contract', 'Internship'];

    useEffect(() => {
        fetchJobs();
    }, [categoryFilter, typeFilter]);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            // Build absolute URL for Next.js 15 dev environment compatibility on Windows
            const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
            let url = `${origin}/api/jobs?`;

            if (categoryFilter !== 'All') url += `category=${encodeURIComponent(categoryFilter)}&`;
            if (typeFilter !== 'All') url += `type=${encodeURIComponent(typeFilter)}&`;
            if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`;
            if (locationTerm) url += `location=${encodeURIComponent(locationTerm)}`;

            const res = await fetch(url);

            if (!res.ok) {
                console.error("Fetch returned status:", res.status);
                throw new Error("API Fetch failed");
            }

            const data = await res.json();

            if (data.success) {
                setJobs(data.jobs);
            }
        } catch (error) {
            console.error('Error fetching jobs explicitly:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchJobs();
    };

    const handleSaveJob = async (jobId: string) => {
        try {
            const res = await fetch('/api/user/saved-jobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobId })
            });
            if (res.ok) {
                alert('Job saved to your dashboard!');
            } else {
                alert('Please sign in as a Job Seeker to save jobs.');
            }
        } catch (error) {
            console.error('Error saving job:', error);
        }
    };

    return (
        <div className={styles.jobsContainer}>
            {/* Page Header */}
            <header className={styles.pageHeader}>
                <div className="container">
                    <h1 className={styles.title}>Find Your Next Dream Job</h1>
                    <p className={styles.subtitle}>Explore opportunities from top companies across various industries.</p>
                </div>
            </header>

            <div className={`container ${styles.layout}`}>
                {/* Filters Sidebar */}
                <aside className={styles.sidebar}>
                    <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
                        <div className={styles.formGroup}>
                            <label>Search Keywords</label>
                            <input
                                type="text"
                                placeholder="Job title, keywords, or company"
                                className="input"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className={styles.formGroup} style={{ marginTop: '1rem' }}>
                            <label>Location</label>
                            <input
                                type="text"
                                placeholder="City, state, or 'Remote'"
                                className="input"
                                value={locationTerm}
                                onChange={(e) => setLocationTerm(e.target.value)}
                            />
                        </div>
                        <button type="submit" className={`btn btn-primary ${styles.fullWidth}`} style={{ marginTop: '1rem' }}>Search Jobs</button>
                    </form>

                    <div className={styles.filterSection}>
                        <h3 className={styles.filterTitle}>Category</h3>
                        <div className={styles.filterOptions}>
                            {categories.map(cat => (
                                <label key={cat} className={styles.radioLabel}>
                                    <input
                                        type="radio"
                                        name="category"
                                        value={cat}
                                        checked={categoryFilter === cat}
                                        onChange={(e) => setCategoryFilter(e.target.value)}
                                        className={styles.radioInput}
                                    />
                                    <span>{cat}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className={styles.filterSection}>
                        <h3 className={styles.filterTitle}>Job Type</h3>
                        <div className={styles.filterOptions}>
                            {jobTypes.map(type => (
                                <label key={type} className={styles.radioLabel}>
                                    <input
                                        type="radio"
                                        name="jobType"
                                        value={type}
                                        checked={typeFilter === type}
                                        onChange={(e) => setTypeFilter(e.target.value)}
                                        className={styles.radioInput}
                                    />
                                    <span>{type}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Job Listings Main */}
                <main className={styles.mainContent}>
                    <div className={styles.resultsHeader}>
                        <h2>{loading ? 'Searching...' : `${jobs.length} Jobs Found`}</h2>
                        <div className={styles.sortOptions}>
                            <select className="input" style={{ width: 'auto', padding: '0.5rem' }}>
                                <option>Newest First</option>
                                <option>Oldest First</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className={styles.loadingState}>
                            <div className={styles.spinner}></div>
                            <p>Loading jobs...</p>
                        </div>
                    ) : jobs.length === 0 ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>🔍</div>
                            <h3>No jobs found!</h3>
                            <p>Try adjusting your search criteria or removing filters.</p>
                            <button
                                className="btn btn-outline"
                                onClick={() => {
                                    setSearchTerm('');
                                    setCategoryFilter('All');
                                    setTypeFilter('All');
                                }}
                                style={{ marginTop: '1rem' }}
                            >
                                Clear All Filters
                            </button>
                        </div>
                    ) : (
                        <div className={styles.jobList}>
                            {jobs.map((job, i) => (
                                <div key={job.id} className={`${styles.jobCard} animate-fade-in-up`} style={{ animationDelay: `${i * 50}ms` }}>
                                    <div className={styles.jobCardHeader}>
                                        <div className={styles.companyLogoPlaceholder}>
                                            {job.company.charAt(0)}
                                        </div>
                                        <div className={styles.jobTitles}>
                                            <h3 className={styles.jobTitle}>
                                                <Link href={`/jobs/${job.id}`}>{job.title}</Link>
                                            </h3>
                                            <p className={styles.companyName}>{job.company}</p>
                                        </div>
                                    </div>

                                    <div className={styles.jobMeta}>
                                        <span className={styles.metaBadge}>📍 {job.location}</span>
                                        <span className={styles.metaBadge}>💼 {job.type}</span>
                                        {job.salaryInterval && <span className={styles.metaBadge}>💰 {job.salaryInterval}</span>}
                                        <span className={styles.metaBadge}>🏷️ {job.category}</span>
                                    </div>

                                    <p className={styles.jobDescriptionPreview}>
                                        {job.description.length > 150 ? job.description.substring(0, 150) + '...' : job.description}
                                    </p>

                                    <div className={styles.jobCardFooter}>
                                        <span className={styles.postDate}>
                                            Posted {new Date(job.createdAt).toLocaleDateString()}
                                        </span>
                                        <div className={styles.cardActions}>
                                            <button
                                                className={`btn btn-outline ${styles.smBtn}`}
                                                onClick={() => handleSaveJob(job.id)}
                                            >
                                                Save
                                            </button>
                                            <Link href={`/jobs/${job.id}`} className={`btn btn-primary ${styles.smBtn}`}>
                                                View Details
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

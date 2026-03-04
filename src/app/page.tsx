'use client';
import { useState, useEffect } from 'react';
import styles from './page.module.css';
import Link from 'next/link';

export default function Home() {
  const [featuredJobs, setFeaturedJobs] = useState<any[]>([]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch('/api/jobs');
        const data = await res.json();
        if (!res.ok) {
          console.error("API response not ok", res.status, res.statusText);
          return;
        }
        if (data.success && data.jobs) {
          setFeaturedJobs(data.jobs.slice(0, 6));
        }
      } catch (e) {
        console.error("Failed to fetch jobs", e);
      }
    };
    fetchJobs();
  }, []);
  return (
    <div className={styles.main}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <video
          autoPlay
          loop
          muted
          playsInline
          className={styles.heroVideo}
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-abstract-technology-network-connection-background-3134-large.mp4" type="video/mp4" />
        </video>
        <div className={`container ${styles.heroContainer}`}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Find Your <span className="text-primary">Dream Job</span> Today
            </h1>
            <p className={styles.heroSubtitle}>
              Connecting top talent with the best companies.
              We prioritize IT jobs, but offer opportunities across all industries.
            </p>
            <div className={styles.heroButtons}>
              <Link href="/jobs" className={`btn btn-primary ${styles.heroBtn}`}>Browse Jobs</Link>
              <Link href="/signup" className={`btn btn-secondary ${styles.heroBtnSecondary}`}>Post a Job</Link>
            </div>
          </div>
          <div className={styles.heroImageContainer}>
            {/* Visual placeholder - usually an image or SVG illustration */}
            <div className={styles.heroBlob}></div>
            <div className={styles.heroStatsCard}>
              <div className={styles.statNumber}>10k+</div>
              <div className={styles.statLabel}>Active Jobs</div>
            </div>
            <div className={`${styles.heroStatsCard} ${styles.heroStatsCard2}`}>
              <div className={styles.statNumber}>5k+</div>
              <div className={styles.statLabel}>Companies</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section Placeholder */}
      <section id="jobs-section" className={styles.featuredSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Featured Opportunities</h2>
          </div>

          <div className={styles.jobsGrid}>
            {featuredJobs.length > 0 ? featuredJobs.map((job) => (
              <div key={job.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div className={styles.companyLogoPlaceholder} style={{
                    width: '40px', height: '40px', borderRadius: '8px',
                    background: 'linear-gradient(135deg, #6C35DE, #C22ED0)', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 'bold', fontSize: '1.2rem'
                  }}>
                    {job.company.charAt(0)}
                  </div>
                  <span className="badge badge-primary">{job.type}</span>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                  <Link href={`/jobs/${job.id}`} style={{ color: 'var(--text-main)', textDecoration: 'none' }}>
                    {job.title}
                  </Link>
                </h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  {job.company} • {job.location}
                </p>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                  <span className="badge badge-secondary">{job.category}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                  <span style={{ fontWeight: '600' }}>{job.salaryInterval || 'Competitive'}</span>
                  <Link href={`/jobs/${job.id}`} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                    View Job
                  </Link>
                </div>
              </div>
            )) : (
              <p style={{ color: 'var(--text-muted)', gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
                No jobs posted yet. Check back soon!
              </p>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem' }}>
            <Link href="/login" className="btn btn-primary" style={{ padding: '0.875rem 2.5rem', fontSize: '1.125rem', borderRadius: 'var(--radius-full)' }}>
              View All Opportunities &rarr;
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

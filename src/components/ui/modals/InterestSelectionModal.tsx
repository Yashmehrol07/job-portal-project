'use client';

import { useState } from 'react';
import styles from './InterestSelectionModal.module.css';
import { useRouter } from 'next/navigation';

interface InterestSelectionModalProps {
    onClose: () => void;
    onSave: (selections: { categories: string[], types: string[] }) => void;
}

const JOB_CATEGORIES = [
    { id: 'it', name: 'Information Technology (IT)', desc: 'Software, Web Dev, Cloud, Cybersecurity', priority: true },
    { id: 'marketing', name: 'Marketing', desc: 'Digital Marketing, SEO, Content Creation' },
    { id: 'finance', name: 'Finance', desc: 'Financial Analysis, Accounting, Banking' },
    { id: 'healthcare', name: 'Healthcare', desc: 'Nursing, Medical Assisting, Pharmacy' },
    { id: 'engineering', name: 'Engineering', desc: 'Civil, Mechanical, Electrical, Industrial' },
    { id: 'education', name: 'Education', desc: 'Teaching, Tutoring, Administration' },
    { id: 'design', name: 'Design', desc: 'UI/UX, Graphic Design, Video Editing' },
];

const JOB_TYPES = [
    { id: 'full-time', name: 'Full Time' },
    { id: 'part-time', name: 'Part Time' },
    { id: 'contract', name: 'Contract' },
    { id: 'internship', name: 'Internship' }
];

export default function InterestSelectionModal({ onClose, onSave }: InterestSelectionModalProps) {
    // Pre-select IT Jobs as per requirement
    const [selectedInterests, setSelectedInterests] = useState<string[]>(['it']);
    const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    const toggleInterest = (id: string) => {
        setSelectedInterests(prev =>
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };

    const toggleJobType = (id: string) => {
        setSelectedJobTypes(prev =>
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };

    const handleSave = () => {
        setIsSaving(true);
        // Simulate API save
        setTimeout(() => {
            onSave({ categories: selectedInterests, types: selectedJobTypes });
            router.push('/dashboard');
        }, 1000);
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.title}>What kind of jobs are you looking for?</h2>
                    <p className={styles.subtitle}>
                        Select your interests to help us personalize your job feed.
                        We've pre-selected IT Jobs for you as it's our specialty.
                    </p>
                </div>

                <div className={styles.modalBody}>
                    <div className={styles.interestList}>
                        {JOB_CATEGORIES.map(category => (
                            <label
                                key={category.id}
                                className={`${styles.interestItem} ${selectedInterests.includes(category.id) ? styles.selected : ''}`}
                            >
                                <input
                                    type="checkbox"
                                    className={styles.checkbox}
                                    checked={selectedInterests.includes(category.id)}
                                    onChange={() => toggleInterest(category.id)}
                                />
                                <div className={styles.interestDetails}>
                                    <span className={styles.interestName}>{category.name}</span>
                                    <span className={styles.interestDesc}>{category.desc}</span>
                                </div>
                                {category.priority && (
                                    <span className={styles.priorityBadge}>Priority</span>
                                )}
                            </label>
                        ))}
                    </div>
                    <h3 style={{ marginTop: '2rem', marginBottom: '1rem', fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-main)' }}>
                        Preferred Job Type
                    </h3>
                    <div className={styles.interestList}>
                        {JOB_TYPES.map(type => (
                            <label
                                key={type.id}
                                className={`${styles.interestItem} ${selectedJobTypes.includes(type.id) ? styles.selected : ''}`}
                            >
                                <input
                                    type="checkbox"
                                    className={styles.checkbox}
                                    checked={selectedJobTypes.includes(type.id)}
                                    onChange={() => toggleJobType(type.id)}
                                />
                                <div className={styles.interestDetails}>
                                    <span className={styles.interestName}>{type.name}</span>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                <div className={styles.modalFooter}>
                    <button
                        type="button"
                        className={`btn ${styles.skipBtn}`}
                        onClick={() => router.push('/dashboard')}
                        disabled={isSaving}
                    >
                        Skip for now
                    </button>
                    <button
                        type="button"
                        className={`btn btn-primary ${styles.saveBtn} ${isSaving ? styles.loading : ''}`}
                        onClick={handleSave}
                        disabled={isSaving || selectedInterests.length === 0 || selectedJobTypes.length === 0}
                    >
                        {isSaving ? 'Saving...' : 'Save & Continue'}
                    </button>
                </div>
            </div>
        </div>
    );
}

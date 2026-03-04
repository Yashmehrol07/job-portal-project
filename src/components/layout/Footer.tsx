'use client';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Footer.module.css';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const TypewriterSequence = () => {
    const [displayText, setDisplayText] = useState('');
    const [showCursor, setShowCursor] = useState(true);

    useEffect(() => {
        let isStopped = false;

        const typeLoop = async () => {
            const phrases = [
                "SHIVU ❤️",
                "ohh Sorry Soryy",
                "SHIVI TYAGI ❤️"
            ];
            const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

            for (let i = 0; i < phrases.length; i++) {
                if (isStopped) break;
                const phrase = phrases[i];
                const chars = Array.from(phrase);

                let currentText = "";
                for (const char of chars) {
                    if (isStopped) break;
                    currentText += char;
                    setDisplayText(currentText);
                    await sleep(150);
                }

                if (i < phrases.length - 1) {
                    await sleep(1200);

                    let deleteChars = Array.from(currentText);
                    while (deleteChars.length > 0) {
                        if (isStopped) break;
                        deleteChars.pop();
                        setDisplayText(deleteChars.join(''));
                        await sleep(80);
                    }
                    await sleep(400);
                }
            }
        };

        typeLoop();

        return () => {
            isStopped = true;
        };
    }, []);

    useEffect(() => {
        const cursorInterval = setInterval(() => {
            setShowCursor(prev => !prev);
        }, 400);
        return () => clearInterval(cursorInterval);
    }, []);

    return (
        <span className={styles.typewriterWrapper}>
            <span className={styles.typewriterText}>{displayText}</span>
            <span className={styles.cursor} style={{ opacity: showCursor ? 1 : 0 }}>_</span>
        </span>
    );
};

export default function Footer() {
    const [user, setUser] = useState<{ role?: string } | null>(null);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch { }
        }
    }, []);

    return (
        <footer className={styles.footer}>
            <div className={`container ${styles.footerGrid}`}>
                <div className={styles.brandSection}>
                    <Link href="/" className={styles.logo}>
                        <Image
                            src="/pytalent-logo.png"
                            alt="PyTalent Logo"
                            width={160}
                            height={60}
                            className={styles.logoImage}
                        />
                        <span className={styles.logoText}>PyTalent</span>
                    </Link>
                    <p className={styles.description}>
                        Connecting talented professionals with top companies.
                        Find your dream job today, specializing in IT and beyond on PyTalent.
                    </p>
                </div>

                <div className={styles.linksSection}>
                    <h3 className={styles.heading}>For Job Seekers</h3>
                    <ul className={styles.linkList}>
                        <li><Link href="/login" className={styles.link}>Browse Jobs</Link></li>
                        {user && (
                            <>
                                <li><Link href="/dashboard" className={styles.link}>User Dashboard</Link></li>
                                <li><Link href="/dashboard" className={styles.link}>Saved Jobs</Link></li>
                            </>
                        )}
                    </ul>
                </div>

                <div className={styles.linksSection}>
                    <h3 className={styles.heading}>For Employers</h3>
                    <ul className={styles.linkList}>
                        <li><Link href="/admin/post-job" className={styles.link}>Post a Job</Link></li>
                        <li><Link href="/admin" className={styles.link}>Employer Dashboard</Link></li>
                        <li><Link href="/pricing" className={styles.link}>Pricing</Link></li>
                    </ul>
                </div>

                <div className={styles.linksSection}>
                    <h3 className={styles.heading}>Support</h3>
                    <ul className={styles.linkList}>
                        <li><Link href="/about" className={styles.link}>About Us</Link></li>
                        <li><Link href="/contact" className={styles.link}>Contact</Link></li>
                        <li><Link href="/privacy" className={styles.link}>Privacy Policy</Link></li>
                        <li><Link href="/terms" className={styles.link}>Terms of Service</Link></li>
                    </ul>
                </div>
            </div>

            <div className={styles.bottomBar}>
                <div className={`container ${styles.bottomBarContent}`}>
                    <p>&copy; {new Date().getFullYear()} JobConnect. All rights reserved.</p>
                    <p className={styles.developerCredit}>
                        Developed by <TypewriterSequence />
                    </p>
                </div>
            </div>
        </footer>
    );
}

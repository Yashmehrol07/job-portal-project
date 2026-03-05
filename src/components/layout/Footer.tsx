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
                    <div className={styles.socialLinks}>
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="LinkedIn">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="Twitter">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg>
                        </a>
                        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="GitHub">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                        </a>
                    </div>
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
                        <li><Link href={user ? "/admin" : "/login"} className={styles.link}>Post a Job</Link></li>
                        {user && (
                            <li><Link href="/admin" className={styles.link}>Employer Dashboard</Link></li>
                        )}
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
                    <p>&copy; {new Date().getFullYear()} PyTalent. All rights reserved.</p>
                    <p className={styles.developerCredit}>
                        Developed by <TypewriterSequence />
                    </p>
                </div>
            </div>
        </footer>
    );
}

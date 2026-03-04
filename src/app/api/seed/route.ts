import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const IT_JOB_TITLES = [
    'Software Engineer', 'Senior Frontend Developer', 'Backend Developer', 'Full Stack Developer',
    'DevOps Engineer', 'Cloud Architect', 'Data Scientist', 'Machine Learning Engineer',
    'React Native Developer', 'iOS Developer', 'Android Developer', 'QA Automation Engineer',
    'System Administrator', 'Database Administrator', 'Cybersecurity Analyst', 'UX/UI Designer',
    'Product Manager (Tech)', 'Scrum Master', 'IT Support Specialist', 'Network Engineer'
];

const NON_IT_JOB_TITLES = [
    'Marketing Manager', 'HR Generalist', 'Sales Executive', 'Financial Analyst',
    'Graphic Designer', 'Content Writer', 'Customer Support Representative', 'Operations Manager',
    'Business Development Manager', 'Accountant', 'Legal Advisor', 'Supply Chain Coordinator'
];

const LOCATIONS = [
    'Mumbai, Maharashtra', 'Bengaluru, Karnataka', 'Hyderabad, Telangana', 'Pune, Maharashtra',
    'Chennai, Tamil Nadu', 'Delhi, NCR', 'Gurugram, Haryana', 'Noida, Uttar Pradesh',
    'Kolkata, West Bengal', 'Ahmedabad, Gujarat'
];

const COMPANIES = [
    'TechNova Solutions', 'Global Web Services', 'Future Soft', 'Innovatech Systems',
    'NextGen AI Labs', 'CloudScale Dynamics', 'Hyperion Tech', 'Apex Solutions',
    'Quantum Computing Pvt Ltd', 'DataCore India', 'Reliable Finance', 'Creative Marketing Co'
];

const SALARY_RANGES = [
    '₹6,000,00 - ₹12,000,00', '₹10,000,00 - ₹15,000,00', '₹15,000,00 - ₹25,000,00',
    '₹20,000,00 - ₹35,000,00', '₹5,000,00 - ₹8,000,00', '₹8,000,00 - ₹14,000,00'
];

const INTERVALS = ['Yearly', 'Monthly'];

const TYPES = ['Full-time', 'Part-time', 'Contract', 'Freelance'];

function getRandomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

export async function GET() {
    try {
        const db = await getDb();
        const adminPassword = await bcrypt.hash('admin123', 10);

        let admin = await db.get(`SELECT id FROM User WHERE email = 'admin@pytalent.com'`);
        let adminId;

        if (!admin) {
            adminId = crypto.randomUUID();
            const now = new Date().toISOString();
            await db.run(
                `INSERT INTO User (id, firstName, lastName, email, password, role, interests, createdAt, updatedAt)
                 VALUES (?, 'System', 'Admin', 'admin@pytalent.com', ?, 'ADMIN', ?, ?, ?)`,
                [adminId, adminPassword, JSON.stringify(['Technology', 'Management']), now, now]
            );
        } else {
            adminId = admin.id;
        }

        const ALL_CATEGORIES = ['Information Technology (IT)', 'Marketing', 'Finance', 'Healthcare', 'Engineering', 'Education', 'Design'];

        let jobsCreated = 0;

        for (let i = 0; i < 50; i++) {
            const jobId = crypto.randomUUID();
            const now = new Date().toISOString();
            const cat = Math.random() > 0.3 ? 'Information Technology (IT)' : 'Engineering';
            await db.run(
                `INSERT INTO Job (id, title, company, location, type, category, salaryInterval, description, requirements, posterId, createdAt, updatedAt)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    jobId,
                    getRandomItem(IT_JOB_TITLES),
                    getRandomItem(COMPANIES),
                    getRandomItem(LOCATIONS),
                    getRandomItem(TYPES),
                    cat,
                    getRandomItem(INTERVALS),
                    `We are looking for a highly skilled professional to join our team. \n\nSalary: ${getRandomItem(SALARY_RANGES)}`,
                    JSON.stringify(['3+ Years Experience', 'Strong Communication Skills', 'Team Player']),
                    adminId,
                    now,
                    now
                ]
            );
            jobsCreated++;
        }

        for (let i = 0; i < 30; i++) {
            const jobId = crypto.randomUUID();
            const now = new Date().toISOString();
            const nonItCategories = ['Marketing', 'Finance', 'Healthcare', 'Education', 'Design'];
            await db.run(
                `INSERT INTO Job (id, title, company, location, type, category, salaryInterval, description, requirements, posterId, createdAt, updatedAt)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    jobId,
                    getRandomItem(NON_IT_JOB_TITLES),
                    getRandomItem(COMPANIES),
                    getRandomItem(LOCATIONS),
                    getRandomItem(TYPES),
                    getRandomItem(nonItCategories),
                    getRandomItem(INTERVALS),
                    `Exciting opportunity in our growing firm. Join us to make a difference. \n\nSalary: ${getRandomItem(SALARY_RANGES)}`,
                    JSON.stringify(['Relevant Degree', 'Leadership Skills']),
                    adminId,
                    now,
                    now
                ]
            );
            jobsCreated++;
        }

        return NextResponse.json({ success: true, jobsCreated });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { firstName, lastName, email, password, mobileNo, role } = body;

        // Ensure role is either USER or EMPLOYER, default to USER if missing/tampered
        const validRole = role === 'EMPLOYER' ? 'EMPLOYER' : 'USER';

        if (!firstName || !lastName || !email || !password) {
            return NextResponse.json({ error: 'Please provide all required fields' }, { status: 400 });
        }

        const db = await getDb();

        // Check if user exists
        const existingUser = await db.get(`SELECT id FROM User WHERE email = ?`, [email]);
        if (existingUser) {
            return NextResponse.json({ error: 'Email is already registered' }, { status: 400 });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const newUserId = crypto.randomUUID();
        const createdAt = new Date().toISOString();

        await db.run(
            `INSERT INTO User (id, firstName, lastName, email, password, mobileNo, role, interests, createdAt, updatedAt) 
             VALUES (?, ?, ?, ?, ?, ?, ?, '[]', ?, ?)`,
            [newUserId, firstName, lastName, email, hashedPassword, mobileNo || null, validRole, createdAt, createdAt]
        );

        const user = { id: newUserId, firstName, lastName, email, mobileNo: mobileNo || null, role: validRole, avatarUrl: null };

        // Create token
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET as string,
            { expiresIn: '7d' }
        );

        const response = NextResponse.json(
            {
                success: true,
                user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, mobileNo: user.mobileNo, role: user.role, avatarUrl: user.avatarUrl }
            },
            { status: 201 }
        );

        response.cookies.set({
            name: 'token',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/',
        });

        return response;
    } catch (error: any) {
        console.error('Signup error:', error);
        return NextResponse.json({ error: error.message || 'Server error during signup' }, { status: 500 });
    }
}

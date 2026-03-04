import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: 'Please provide email and password' }, { status: 400 });
        }

        const db = await getDb();

        // Find user
        const user = await db.get(`SELECT * FROM User WHERE email = ?`, [email]);

        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Create token
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET as string,
            { expiresIn: '7d' }
        );

        // Parse interests if needed
        let interestsArray = [];
        try {
            interestsArray = JSON.parse(user.interests);
        } catch (e) { }

        const response = NextResponse.json(
            {
                success: true,
                user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role, interests: interestsArray, avatarUrl: user.avatarUrl }
            },
            { status: 200 }
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
        console.error('Login error:', error);
        return NextResponse.json({ error: error.message || 'Server error during login' }, { status: 500 });
    }
}

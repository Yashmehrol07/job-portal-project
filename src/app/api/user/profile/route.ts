import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token');

        if (!token) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
        }

        let decoded;
        try {
            decoded = jwt.verify(token.value, process.env.JWT_SECRET as string) as { userId: string };
        } catch (err) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const db = await getDb();
        const user = await db.get(`SELECT * FROM User WHERE id = ?`, [decoded.userId]);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        let interestsArray = [];
        try {
            interestsArray = JSON.parse(user.interests);
        } catch (e) { }

        const userData = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            mobileNo: user.mobileNo,
            role: user.role,
            interests: interestsArray,
            avatarUrl: user.avatarUrl
        };

        return NextResponse.json({ success: true, user: userData }, { status: 200 });
    } catch (error: any) {
        console.error('Profile fetch error:', error);
        return NextResponse.json({ error: 'Server error while fetching profile' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token');

        if (!token) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
        }

        let decoded;
        try {
            decoded = jwt.verify(token.value, process.env.JWT_SECRET as string) as { userId: string };
        } catch (err) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const body = await req.json();
        const { firstName, lastName, mobileNo, avatarUrl } = body;

        const db = await getDb();

        const updates: string[] = [];
        const values: any[] = [];

        if (firstName !== undefined) { updates.push('firstName = ?'); values.push(firstName); }
        if (lastName !== undefined) { updates.push('lastName = ?'); values.push(lastName); }
        if (mobileNo !== undefined) { updates.push('mobileNo = ?'); values.push(mobileNo); }
        if (avatarUrl !== undefined) { updates.push('avatarUrl = ?'); values.push(avatarUrl); }

        if (updates.length > 0) {
            updates.push('updatedAt = ?');
            values.push(new Date().toISOString());
            values.push(decoded.userId);
            await db.run(`UPDATE User SET ${updates.join(', ')} WHERE id = ?`, values);
        }

        const user = await db.get(`SELECT * FROM User WHERE id = ?`, [decoded.userId]);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        let interestsArray = [];
        try {
            interestsArray = JSON.parse(user.interests);
        } catch (e) { }

        const updatedUser = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            mobileNo: user.mobileNo,
            role: user.role,
            interests: interestsArray,
            avatarUrl: user.avatarUrl
        };

        return NextResponse.json({ success: true, user: updatedUser }, { status: 200 });
    } catch (error: any) {
        console.error('Profile update error:', error);
        return NextResponse.json({ error: error.message || 'Server error while updating profile' }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        // Basic Authentication Check
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
        const { interests } = body;

        if (!Array.isArray(interests)) {
            return NextResponse.json({ error: 'Interests must be an array' }, { status: 400 });
        }

        const db = await getDb();
        const interestsString = JSON.stringify(interests);
        const updatedAt = new Date().toISOString();

        // Update user's interests (store as JSON string in SQLite)
        await db.run(
            `UPDATE User SET interests = ?, updatedAt = ? WHERE id = ?`,
            [interestsString, updatedAt, decoded.userId]
        );

        const user = await db.get(`SELECT interests FROM User WHERE id = ?`, [decoded.userId]);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        let interestsArray = [];
        try {
            interestsArray = JSON.parse(user.interests);
        } catch (e) { }

        return NextResponse.json({ success: true, interests: interestsArray }, { status: 200 });
    } catch (error: any) {
        console.error('Interests update error:', error);
        return NextResponse.json({ error: error.message || 'Server error while updating interests' }, { status: 500 });
    }
}

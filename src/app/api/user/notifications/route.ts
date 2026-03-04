import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
        } catch (err) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const db = await getDb();
        const notifications = await db.all(`
            SELECT * FROM Notification 
            WHERE userId = ? 
            ORDER BY createdAt DESC 
            LIMIT 50
        `, [decoded.userId]);

        return NextResponse.json({ success: true, notifications }, { status: 200 });
    } catch (error: any) {
        console.error('Fetch notifications error:', error);
        return NextResponse.json({ error: 'Server error while fetching notifications' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
        } catch (err) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const db = await getDb();

        // Mark all as read
        await db.run(`
            UPDATE Notification
            SET isRead = 1
            WHERE userId = ? AND isRead = 0
        `, [decoded.userId]);

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {
        console.error('Update notifications error:', error);
        return NextResponse.json({ error: 'Server error while updating notifications' }, { status: 500 });
    }
}

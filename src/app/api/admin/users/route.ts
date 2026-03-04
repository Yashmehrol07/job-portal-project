import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
            if (decoded.role !== 'ADMIN') {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        } catch {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const db = await getDb();
        const users = await db.all(`SELECT id, firstName, lastName, email, role, createdAt FROM User ORDER BY createdAt DESC`);

        return NextResponse.json({ success: true, users }, { status: 200 });
    } catch (error: any) {
        console.error('Fetch users error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

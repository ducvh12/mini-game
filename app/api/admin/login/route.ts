
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { password } = body;

        const adminPassword = process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

        if (password === adminPassword) {
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Mật khẩu không đúng' }, { status: 401 });
    } catch (error) {
        return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
    }
}

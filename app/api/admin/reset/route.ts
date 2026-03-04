import { NextRequest, NextResponse } from 'next/server';
import { resetAll } from '@/lib/storage';
import bcrypt from 'bcryptjs';

const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '$2a$10$YourHashHere';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (password !== '2512') {
      return NextResponse.json(
        { success: false, error: 'Invalid password' },
        { status: 401 }
      );
    }

    await resetAll();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reset error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reset' },
      { status: 500 }
    );
  }
}

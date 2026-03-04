import { NextRequest, NextResponse } from 'next/server';
import { getAllParticipants, removeParticipant, getGameState } from '@/lib/storage';
import bcrypt from 'bcryptjs';

const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '$2a$10$YourHashHere';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const password = searchParams.get('password');

    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Password required' },
        { status: 401 }
      );
    }

    if (password !== '2512') {
      return NextResponse.json(
        { success: false, error: 'Invalid password' },
        { status: 401 }
      );
    }

    const participants = await getAllParticipants();
    const gameState = await getGameState();

    return NextResponse.json({
      success: true,
      participants,
      gameState
    });
  } catch (error) {
    console.error('Get participants error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get participants' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { password, participantId } = await request.json();

    if (password !== '2512') {
      return NextResponse.json(
        { success: false, error: 'Invalid password' },
        { status: 401 }
      );
    }

    await removeParticipant(participantId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Remove participant error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove participant' },
      { status: 500 }
    );
  }
}

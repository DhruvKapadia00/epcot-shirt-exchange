import { NextRequest, NextResponse } from 'next/server';
import { getAllParticipants, setAssignments, setGameState, getGameState } from '@/lib/storage';
import { generateAssignments } from '@/lib/assignments';
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

    const gameState = await getGameState();
    if (gameState.locked) {
      return NextResponse.json(
        { success: false, error: 'Assignments already generated' },
        { status: 400 }
      );
    }

    const participants = await getAllParticipants();
    const confirmed = participants.filter(p => p.confirmed);

    if (confirmed.length < 3) {
      return NextResponse.json(
        { success: false, error: 'Need at least 3 confirmed participants' },
        { status: 400 }
      );
    }

    const assignments = generateAssignments(participants);
    await setAssignments(assignments);
    await setGameState({ locked: true, timestamp: Date.now() });

    return NextResponse.json({ success: true, count: assignments.length });
  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate assignments' },
      { status: 500 }
    );
  }
}

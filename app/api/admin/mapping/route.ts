import { NextRequest, NextResponse } from 'next/server';
import { getAllParticipants, getAssignments } from '@/lib/storage';
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
    const assignments = await getAssignments();

    const mapping = assignments.map(a => {
      const buyer = participants.find(p => p.id === a.buyerId);
      const recipient = participants.find(p => p.id === a.recipientId);
      return {
        buyer: buyer?.name || 'Unknown',
        recipient: recipient?.name || 'Unknown',
        recipientSize: recipient?.shirtSize
      };
    });

    return NextResponse.json({
      success: true,
      mapping
    });
  } catch (error) {
    console.error('Mapping error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get mapping' },
      { status: 500 }
    );
  }
}

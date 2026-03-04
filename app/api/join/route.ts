import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { addParticipant, getParticipant } from '@/lib/storage';
import { Participant } from '@/lib/redis';

export async function POST(request: NextRequest) {
  try {
    const { userId, name, shirtSize } = await request.json();

    let participantId = userId;
    
    if (!participantId) {
      participantId = uuidv4();
    }

    const existingParticipant = await getParticipant(participantId);
    
    const participant: Participant = {
      id: participantId,
      name,
      shirtSize,
      confirmed: true,
      timestamp: existingParticipant?.timestamp || Date.now(),
    };

    await addParticipant(participant);

    return NextResponse.json({ 
      success: true, 
      userId: participantId,
      participant 
    });
  } catch (error) {
    console.error('Join error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to join' },
      { status: 500 }
    );
  }
}

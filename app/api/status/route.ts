import { NextRequest, NextResponse } from 'next/server';
import { 
  getParticipant, 
  getAllParticipants, 
  getAssignmentForBuyer,
  getSuggestionsForRecipient,
  getGameState 
} from '@/lib/storage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const gameState = await getGameState();
    const allParticipants = await getAllParticipants();
    const confirmedCount = allParticipants.filter(p => p.confirmed).length;

    let participant = null;
    let assignment = null;
    let recipient = null;
    let suggestions: any[] = [];

    if (userId) {
      participant = await getParticipant(userId);
      
      if (participant && gameState.locked) {
        assignment = await getAssignmentForBuyer(userId);
        if (assignment) {
          recipient = await getParticipant(assignment.recipientId);
          suggestions = await getSuggestionsForRecipient(assignment.recipientId);
        }
      }
    }

    return NextResponse.json({
      success: true,
      participant,
      assignment: assignment ? {
        recipient,
        suggestions
      } : null,
      gameState: {
        locked: gameState.locked,
        confirmedCount
      }
    });
  } catch (error) {
    console.error('Status error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get status' },
      { status: 500 }
    );
  }
}

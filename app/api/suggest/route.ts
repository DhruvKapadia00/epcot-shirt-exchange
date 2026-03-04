import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { addSuggestion } from '@/lib/storage';
import { Suggestion } from '@/lib/redis';

export async function POST(request: NextRequest) {
  try {
    const { recipientId, text, link } = await request.json();

    if (!recipientId || !text) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const suggestion: Suggestion = {
      id: uuidv4(),
      recipientId,
      text,
      link: link || undefined,
      timestamp: Date.now(),
    };

    await addSuggestion(suggestion);

    return NextResponse.json({ success: true, suggestion });
  } catch (error) {
    console.error('Suggestion error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add suggestion' },
      { status: 500 }
    );
  }
}

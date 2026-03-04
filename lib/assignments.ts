import { Participant, Assignment } from './redis';

export function generateAssignments(participants: Participant[]): Assignment[] {
  const confirmed = participants.filter(p => p.confirmed);
  
  if (confirmed.length < 3) {
    throw new Error('Need at least 3 participants');
  }

  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const shuffled = [...confirmed].sort(() => Math.random() - 0.5);
    const assignments: Assignment[] = [];
    let valid = true;

    for (let i = 0; i < shuffled.length; i++) {
      const buyer = shuffled[i];
      const recipient = shuffled[(i + 1) % shuffled.length];

      if (buyer.id === recipient.id) {
        valid = false;
        break;
      }

      assignments.push({
        buyerId: buyer.id,
        recipientId: recipient.id,
      });
    }

    if (valid) {
      return assignments;
    }

    attempts++;
  }

  throw new Error('Could not generate valid assignments');
}

import { getRedis, Participant, Assignment, Suggestion, GameState } from './redis';

const PARTICIPANTS_KEY = 'participants';
const ASSIGNMENTS_KEY = 'assignments';
const SUGGESTIONS_KEY = 'suggestions';
const GAME_STATE_KEY = 'game_state';

export async function addParticipant(participant: Participant): Promise<void> {
  const redis = await getRedis();
  await redis.hSet(PARTICIPANTS_KEY, participant.id, JSON.stringify(participant));
}

export async function getParticipant(id: string): Promise<Participant | null> {
  const redis = await getRedis();
  const data = await redis.hGet(PARTICIPANTS_KEY, id);
  return data ? JSON.parse(data) : null;
}

export async function getAllParticipants(): Promise<Participant[]> {
  const redis = await getRedis();
  const data = await redis.hGetAll(PARTICIPANTS_KEY);
  return Object.values(data).map(p => JSON.parse(p as string));
}

export async function removeParticipant(id: string): Promise<void> {
  const redis = await getRedis();
  await redis.hDel(PARTICIPANTS_KEY, id);
}

export async function setAssignments(assignments: Assignment[]): Promise<void> {
  const redis = await getRedis();
  await redis.set(ASSIGNMENTS_KEY, JSON.stringify(assignments));
}

export async function getAssignments(): Promise<Assignment[]> {
  const redis = await getRedis();
  const data = await redis.get(ASSIGNMENTS_KEY);
  return data ? JSON.parse(data) : [];
}

export async function getAssignmentForBuyer(buyerId: string): Promise<Assignment | null> {
  const assignments = await getAssignments();
  return assignments.find(a => a.buyerId === buyerId) || null;
}

export async function addSuggestion(suggestion: Suggestion): Promise<void> {
  const redis = await getRedis();
  await redis.hSet(SUGGESTIONS_KEY, suggestion.id, JSON.stringify(suggestion));
}

export async function getSuggestionsForRecipient(recipientId: string): Promise<Suggestion[]> {
  const redis = await getRedis();
  const data = await redis.hGetAll(SUGGESTIONS_KEY);
  const allSuggestions = Object.values(data).map(s => JSON.parse(s as string) as Suggestion);
  return allSuggestions.filter(s => s.recipientId === recipientId);
}

export async function setGameState(state: GameState): Promise<void> {
  const redis = await getRedis();
  await redis.set(GAME_STATE_KEY, JSON.stringify(state));
}

export async function getGameState(): Promise<GameState> {
  const redis = await getRedis();
  const data = await redis.get(GAME_STATE_KEY);
  return data ? JSON.parse(data) : { locked: false };
}

export async function resetAll(): Promise<void> {
  const redis = await getRedis();
  await redis.del([PARTICIPANTS_KEY, ASSIGNMENTS_KEY, SUGGESTIONS_KEY, GAME_STATE_KEY]);
}

import { getRedis, Participant, Assignment, Suggestion, GameState } from './redis';

const PARTICIPANTS_KEY = 'participants';
const ASSIGNMENTS_KEY = 'assignments';
const SUGGESTIONS_KEY = 'suggestions';
const GAME_STATE_KEY = 'game_state';

export async function addParticipant(participant: Participant): Promise<void> {
  const redis = getRedis();
  await redis.hset(PARTICIPANTS_KEY, participant.id, JSON.stringify(participant));
}

export async function getParticipant(id: string): Promise<Participant | null> {
  const redis = getRedis();
  const data = await redis.hget(PARTICIPANTS_KEY, id);
  return data ? JSON.parse(data) : null;
}

export async function getAllParticipants(): Promise<Participant[]> {
  const redis = getRedis();
  const data = await redis.hgetall(PARTICIPANTS_KEY);
  return Object.values(data).map(p => JSON.parse(p as string));
}

export async function removeParticipant(id: string): Promise<void> {
  const redis = getRedis();
  await redis.hdel(PARTICIPANTS_KEY, id);
}

export async function setAssignments(assignments: Assignment[]): Promise<void> {
  const redis = getRedis();
  await redis.set(ASSIGNMENTS_KEY, JSON.stringify(assignments));
}

export async function getAssignments(): Promise<Assignment[]> {
  const redis = getRedis();
  const data = await redis.get(ASSIGNMENTS_KEY);
  return data ? JSON.parse(data) : [];
}

export async function getAssignmentForBuyer(buyerId: string): Promise<Assignment | null> {
  const assignments = await getAssignments();
  return assignments.find(a => a.buyerId === buyerId) || null;
}

export async function addSuggestion(suggestion: Suggestion): Promise<void> {
  const redis = getRedis();
  await redis.hset(SUGGESTIONS_KEY, suggestion.id, JSON.stringify(suggestion));
}

export async function getSuggestionsForRecipient(recipientId: string): Promise<Suggestion[]> {
  const redis = getRedis();
  const data = await redis.hgetall(SUGGESTIONS_KEY);
  const allSuggestions = Object.values(data).map(s => JSON.parse(s as string) as Suggestion);
  return allSuggestions.filter(s => s.recipientId === recipientId);
}

export async function setGameState(state: GameState): Promise<void> {
  const redis = getRedis();
  await redis.set(GAME_STATE_KEY, JSON.stringify(state));
}

export async function getGameState(): Promise<GameState> {
  const redis = getRedis();
  const data = await redis.get(GAME_STATE_KEY);
  return data ? JSON.parse(data) : { locked: false };
}

export async function resetAll(): Promise<void> {
  const redis = getRedis();
  await redis.del(PARTICIPANTS_KEY, ASSIGNMENTS_KEY, SUGGESTIONS_KEY, GAME_STATE_KEY);
}

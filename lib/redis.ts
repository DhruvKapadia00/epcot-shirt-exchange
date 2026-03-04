import { createClient } from 'redis';

let redis: ReturnType<typeof createClient> | null = null;

export async function getRedis() {
  if (!redis) {
    redis = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    await redis.connect();
  }
  return redis;
}

export interface Participant {
  id: string;
  name: string;
  shirtSize: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
  confirmed: boolean;
  timestamp: number;
}

export interface Assignment {
  buyerId: string;
  recipientId: string;
}

export interface Suggestion {
  id: string;
  recipientId: string;
  text: string;
  link?: string;
  timestamp: number;
}

export interface GameState {
  locked: boolean;
  timestamp?: number;
}

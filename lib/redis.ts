import { Redis } from "@upstash/redis";

/**
 * Upstash Redis client (server-side only)
 */
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/* ----------------------------------
   Seat lock helpers
---------------------------------- */

const seatLockKey = (concertId: string, seatId: string) =>
  `seat-lock:${concertId}:${seatId}`;

/**
 * Check if a seat is locked
 */
export async function getSeatLock(
  concertId: string,
  seatId: string
): Promise<boolean> {
  const value = await redis.get(seatLockKey(concertId, seatId));
  return Boolean(value);
}

/**
 * Lock a seat with TTL
 */
export async function lockSeat(
  concertId: string,
  seatId: string,
  userId: string,
  ttlSeconds = 300
) {
  await redis.set(seatLockKey(concertId, seatId), userId, {
    ex: ttlSeconds,
  });
}

/**
 * Unlock all seats locked by a user
 */
export async function unlockAllUserSeats(userId: string) {
  const keys = await redis.keys("seat-lock:*");
  if (keys.length === 0) return;

  const values = await redis.mget<string[]>(...keys);
  const userKeys = keys.filter((_, i) => values[i] === userId);

  if (userKeys.length > 0) {
    await redis.del(...userKeys);
  }
}

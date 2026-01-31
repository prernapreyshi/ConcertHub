import { createClient, type RedisClientType } from "redis";

/* =======================
   Redis Client Singleton
======================= */

let redisClient: RedisClientType | null = null;

export async function getRedisClient(): Promise<RedisClientType> {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
    });

    // ✅ FIXED: typed error
    redisClient.on("error", (err: Error) =>
      console.error("Redis Client Error:", err)
    );

    await redisClient.connect();
  }

  return redisClient;
}

/* =======================
   Seat Locking Logic
======================= */

const LOCK_TTL = 300; // 5 minutes (seconds)

export async function lockSeat(
  concertId: string,
  seatId: string,
  userId: string
): Promise<boolean> {
  const redis = await getRedisClient();
  const key = `lock:${concertId}:${seatId}`;

  const result = await redis.set(key, userId, {
    NX: true,
    EX: LOCK_TTL,
  });

  return result === "OK";
}

export async function unlockSeat(
  concertId: string,
  seatId: string,
  userId: string
): Promise<boolean> {
  const redis = await getRedisClient();
  const key = `lock:${concertId}:${seatId}`;

  const currentHolder = await redis.get(key);
  if (currentHolder === userId) {
    await redis.del(key);
    return true;
  }
  return false;
}

export async function getSeatLock(
  concertId: string,
  seatId: string
): Promise<string | null> {
  const redis = await getRedisClient();
  const key = `lock:${concertId}:${seatId}`;
  return redis.get(key);
}

export interface LockedSeat {
  seatId: string;
  lockedBy: string;
}

export async function getLockedSeats(
  concertId: string
): Promise<LockedSeat[]> {
  const redis = await getRedisClient();
  const pattern = `lock:${concertId}:*`;
  const keys = await redis.keys(pattern);

  const lockedSeats: LockedSeat[] = [];

  for (const key of keys) {
    const seatId = key.replace(`lock:${concertId}:`, "");
    const lockedBy = await redis.get(key);

    if (lockedBy) {
      lockedSeats.push({ seatId, lockedBy });
    }
  }

  return lockedSeats;
}

export async function extendSeatLock(
  concertId: string,
  seatId: string,
  userId: string
): Promise<boolean> {
  const redis = await getRedisClient();
  const key = `lock:${concertId}:${seatId}`;

  const currentHolder = await redis.get(key);
  if (currentHolder === userId) {
    await redis.expire(key, LOCK_TTL);
    return true;
  }

  return false;
}

export async function unlockAllUserSeats(
  concertId: string,
  userId: string
): Promise<void> {
  const redis = await getRedisClient();
  const pattern = `lock:${concertId}:*`;
  const keys = await redis.keys(pattern);

  for (const key of keys) {
    const lockedBy = await redis.get(key);
    if (lockedBy === userId) {
      await redis.del(key);
    }
  }
}

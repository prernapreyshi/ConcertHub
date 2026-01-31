import { redis } from "@/lib/redis"

const LOCK_TTL = 300 // 5 minutes

export async function lockSeat(
  concertId: string,
  seatId: string,
  userId: string
): Promise<boolean> {
  const key = `lock:${concertId}:${seatId}`

  const result = await redis.set(key, userId, {
    nx: true,
    ex: LOCK_TTL,
  })

  if (result === "OK") {
    await redis.sadd(`locks:${concertId}`, seatId)
    return true
  }

  return false
}

export async function unlockSeat(
  concertId: string,
  seatId: string,
  userId: string
): Promise<boolean> {
  const key = `lock:${concertId}:${seatId}`

  const current = await redis.get<string>(key)
  if (current === userId) {
    await redis.del(key)
    await redis.srem(`locks:${concertId}`, seatId)
    return true
  }

  return false
}

export async function getLockedSeats(concertId: string) {
  const seatIds = await redis.smembers(`locks:${concertId}`)

  const locked: { seatId: string; lockedBy: string | null }[] = []

  for (const seatId of seatIds) {
    const lockedBy = await redis.get<string>(
      `lock:${concertId}:${seatId}`
    )
    locked.push({ seatId, lockedBy })
  }

  return locked
}

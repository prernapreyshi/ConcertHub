export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { getLockedSeats } from "@/lib/seat-lock";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const concertId = searchParams.get("concertId");

    if (!concertId) {
      return NextResponse.json(
        { error: "concertId is required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const user = await getCurrentUser();

    // 1️⃣ Booked seats from MongoDB
    const bookings = await db
      .collection("bookings")
      .find({ concertId, status: "completed" })
      .toArray();

    const bookedSeatIds = bookings.flatMap((b) =>
      b.seats.map((s: { seatId: string }) => s.seatId)
    );

    // 2️⃣ Locked seats from Redis
    let lockedSeats: { seatId: string; lockedBy: string | null }[] = [];
    try {
      lockedSeats = await getLockedSeats(concertId);
    } catch (err) {
      console.error("Redis error:", err);
    }

    // 3️⃣ Build seat status map
    const seatStatus: Record<
      string,
      {
        status: "available" | "locked" | "selected" | "booked";
        lockedBy?: string | null;
      }
    > = {};

    // Booked always wins
    for (const seatId of bookedSeatIds) {
      seatStatus[seatId] = { status: "booked" };
    }

    // Locked seats
    for (const lock of lockedSeats) {
      if (!lock.lockedBy) continue;
      if (seatStatus[lock.seatId]) continue;

      seatStatus[lock.seatId] = {
        status:
          lock.lockedBy === user?.userId ? "selected" : "locked",
        lockedBy: lock.lockedBy,
      };
    }

    return NextResponse.json({
      concertId,
      seatStatus,
      userId: user?.userId || null,
    });
  } catch (error) {
    console.error("Get seats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch seat status" },
      { status: 500 }
    );
  }
}

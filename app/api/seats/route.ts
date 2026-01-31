import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { getLockedSeats } from "@/lib/redis";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const concertId = searchParams.get("concertId") || "concert-1";

    const db = await getDatabase();
    const user = await getCurrentUser();

    // ✅ FIX 1: correct booking status
    const bookings = await db
      .collection("bookings")
      .find({ concertId, status: "completed" })
      .toArray();

    // ✅ FIX 2: correct seat field
    const bookedSeatIds = bookings.flatMap((b) =>
      b.seats.map((s: { seatId: string }) => s.seatId)
    );

    // Redis locks
    let lockedSeats: { seatId: string; lockedBy: string }[] = [];
    try {
      lockedSeats = await getLockedSeats(concertId);
    } catch (error) {
      console.error("Redis error (seats may not show locks):", error);
    }

    const seatStatus: Record<
      string,
      { status: "available" | "locked" | "selected" | "booked"; lockedBy?: string }
    > = {};

    // Booked seats
    for (const seatId of bookedSeatIds) {
      seatStatus[seatId] = { status: "booked" };
    }

    // Locked seats
    for (const lock of lockedSeats) {
      if (!seatStatus[lock.seatId]) {
        seatStatus[lock.seatId] = {
          // ✅ FIX 3: userId instead of id
          status: lock.lockedBy === user?.userId ? "selected" : "locked",
          lockedBy: lock.lockedBy,
        };
      }
    }

    return NextResponse.json({
      concertId,
      seatStatus,
      userId: user?.userId || null,
    });
  } catch (error) {
    console.error("Get seats error:", error);
    return NextResponse.json(
      { error: "Failed to get seat status" },
      { status: 500 }
    );
  }
}

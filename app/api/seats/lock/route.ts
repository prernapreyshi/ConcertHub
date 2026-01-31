import { NextRequest, NextResponse } from "next/server";
import { lockSeat, unlockSeat, getLockedSeats } from "@/lib/seat-lock";
import { getCurrentUser } from "@/lib/auth";

/**
 * POST /api/seats/lock
 * body: { concertId, seatId, action }
 * action: "lock" | "unlock"
 */
export async function POST(request: NextRequest) {
  try {
    // 1️⃣ Auth
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // 2️⃣ Body
    const { concertId, seatId, action } = await request.json();

    if (!concertId || !seatId || !action) {
      return NextResponse.json(
        { error: "concertId, seatId and action are required" },
        { status: 400 }
      );
    }

    let success = false;

    if (action === "lock") {
      success = await lockSeat(concertId, seatId, user.userId);

      if (!success) {
        return NextResponse.json(
          { error: "Seat already locked by another user" },
          { status: 409 }
        );
      }
    } else if (action === "unlock") {
      success = await unlockSeat(concertId, seatId, user.userId);
    } else {
      return NextResponse.json(
        { error: "Invalid action (lock | unlock)" },
        { status: 400 }
      );
    }

    // 3️⃣ Optional: return fresh locked seats
    const lockedSeats = await getLockedSeats(concertId);

    return NextResponse.json({
      success,
      action,
      seatId,
      userId: user.userId,
      lockedSeats,
    });
  } catch (error) {
    console.error("Seat lock error:", error);
    return NextResponse.json(
      { error: "Failed to process seat lock request" },
      { status: 500 }
    );
  }
}

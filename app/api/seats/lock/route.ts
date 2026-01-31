import { NextRequest, NextResponse } from "next/server";
import { lockSeat, unlockSeat, extendSeatLock } from "@/lib/redis";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { concertId, seatId, action } = await request.json();

    if (!concertId || !seatId || !action) {
      return NextResponse.json(
        { error: "concertId, seatId, and action are required" },
        { status: 400 }
      );
    }

    let success = false;

    switch (action) {
      case "lock":
        success = await lockSeat(concertId, seatId, user.id);
        break;
      case "unlock":
        success = await unlockSeat(concertId, seatId, user.id);
        break;
      case "extend":
        success = await extendSeatLock(concertId, seatId, user.id);
        break;
      default:
        return NextResponse.json(
          { error: "Invalid action. Use: lock, unlock, or extend" },
          { status: 400 }
        );
    }

    if (!success && action === "lock") {
      return NextResponse.json(
        { error: "Seat is already locked by another user" },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success,
      seatId,
      action,
      userId: user.id,
    });
  } catch (error) {
    console.error("Seat lock error:", error);
    return NextResponse.json(
      { error: "Failed to process seat lock request" },
      { status: 500 }
    );
  }
}

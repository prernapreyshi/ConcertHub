import { NextRequest, NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";
import { getDatabase } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import { getLockedSeats } from "@/lib/seat-lock";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { concertId, seats, amount } = await request.json();

    if (!concertId || !seats || !amount) {
      return NextResponse.json(
        { error: "concertId, seats, and amount are required" },
        { status: 400 }
      );
    }

    // ✅ Verify seats are locked
    const lockedSeats = await getLockedSeats(concertId);
    const lockedSeatIds = new Set(lockedSeats.map(s => s.seatId));

    for (const seat of seats) {
      if (!lockedSeatIds.has(seat.id)) {
        return NextResponse.json(
          { error: `Seat ${seat.id} is no longer reserved` },
          { status: 409 }
        );
      }
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // paise
      currency: "INR",
      receipt: `concert_${concertId}_${Date.now()}`,
      notes: {
        concertId,
        userId: user.userId, // ✅ FIXED
        seats: JSON.stringify(seats.map((s: { id: string }) => s.id)),
      },
    });

    // Store pending order
    const db = await getDatabase();
    await db.collection("orders").insertOne({
      razorpayOrderId: order.id,
      concertId,
      userId: user.userId, // ✅ FIXED
      userEmail: user.email,
      userName: user.name,
      seats,
      amount,
      status: "pending",
      createdAt: new Date(),
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: "Failed to create payment order" },
      { status: 500 }
    );
  }
}

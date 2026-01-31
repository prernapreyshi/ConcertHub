import { NextRequest, NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";
import { getDatabase } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import { getSeatLock } from "@/lib/redis";

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

    // Verify all seats are still locked by this user
    for (const seat of seats) {
      const lockedBy = await getSeatLock(concertId, seat.id);
      if (lockedBy !== user.id) {
        return NextResponse.json(
          { error: `Seat ${seat.id} is no longer reserved for you` },
          { status: 409 }
        );
      }
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency: "INR",
      receipt: `concert_${concertId}_${Date.now()}`,
      notes: {
        concertId,
        userId: user.id,
        seats: JSON.stringify(seats.map((s: { id: string }) => s.id)),
      },
    });

    // Store pending order in MongoDB
    const db = await getDatabase();
    const ordersCollection = db.collection("orders");
    await ordersCollection.insertOne({
      razorpayOrderId: order.id,
      concertId,
      userId: user.id,
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

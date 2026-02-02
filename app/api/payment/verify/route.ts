export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { getDatabase } from "@/lib/mongodb";
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

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Payment verification details are required" },
        { status: 400 }
      );
    }

    // Verify payment signature
    const isValid = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const ordersCollection = db.collection("orders");
    const bookingsCollection = db.collection("bookings");

    // Get the order
    const order = await ordersCollection.findOne({
      razorpayOrderId: razorpay_order_id,
      userId: user.userId, // ✅ FIXED
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Update order status
    await ordersCollection.updateOne(
      { razorpayOrderId: razorpay_order_id },
      {
        $set: {
          status: "paid",
          razorpayPaymentId: razorpay_payment_id,
          paidAt: new Date(),
        },
      }
    );

    // Create booking
    const bookingId = `BK${Date.now()}${Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase()}`;

    const bookingResult = await bookingsCollection.insertOne({
      bookingId,
      concertId: order.concertId,
      userId: user.userId, // ✅ FIXED
      userEmail: user.email,
      userName: user.name,
      seats: order.seats,
      amount: order.amount,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      status: "confirmed",
      createdAt: new Date(),
    });

   

    return NextResponse.json({
      success: true,
      bookingId,
      booking: {
        id: bookingResult.insertedId.toString(),
        bookingId,
        concertId: order.concertId,
        seats: order.seats,
        amount: order.amount,
        userName: user.name,
        userEmail: user.email,
        status: "confirmed",
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 }
    );
  }
}

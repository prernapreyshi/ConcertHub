import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import { unlockSeat } from "@/lib/seat-lock";

const concertInfo = {
  id: "concert-arijit-001",
  name: "Arijit Singh Live in Concert",
  artist: "Arijit Singh",
  venue: "Jawaharlal Nehru Stadium, New Delhi",
  date: "2026-04-12",
  time: "7:30 PM",
};

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Auth required" }, { status: 401 });
  }

  const { concertId, seats, amount } = await req.json();
  const db = await getDatabase();

  // ✅ DB booking
  const dbBooking = {
    bookingId: `BK${Date.now()}`,
    userId: user.userId,
    concertId,
    seats,
    amount,
    status: "completed",
    createdAt: new Date(),
  };

  await db.collection("bookings").insertOne(dbBooking);

  // unlock seats after payment
  for (const seat of seats) {
    await unlockSeat(concertId, seat.seatId, user.userId);
  }

  // ✅ UI booking format (important)
  const booking = {
    id: dbBooking.bookingId,
    concertId,
    concertName: concertInfo.name,
    artist: concertInfo.artist,
    venue: concertInfo.venue,
    date: concertInfo.date,
    time: concertInfo.time,
    seats: seats.map((s: any) => ({
      id: s.seatId,
      row: s.seatId[0],
      number: parseInt(s.seatId.slice(1)),
      status: "booked",
    })),
    totalAmount: amount,
    paymentStatus: "completed",
    createdAt: dbBooking.createdAt.toISOString(),
    barcode: `TICKET-${dbBooking.bookingId}`,
  };

  return NextResponse.json({ success: true, booking });
}

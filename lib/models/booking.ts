import type { Seat } from "./seat";

export interface Booking {
  _id?: string;
  bookingId: string;

  userId: string;
  concertId: string;

  seats: Seat[];

  amount: number;
  orderId: string;
  paymentId: string;

  status: "completed" | "failed";
  createdAt: Date;
}

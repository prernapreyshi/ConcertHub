import { Seat } from "./seat";

export interface Booking {
  id: string;

  concertId: string;
  concertName: string;
  artist: string;
  venue: string;
  date: string;
  time: string;

  seats: Seat[];
  totalAmount: number;

  paymentStatus: "pending" | "completed" | "failed";

  createdAt: string;
  barcode: string;
}

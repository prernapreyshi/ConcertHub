export type SeatStatus = "available" | "locked" | "booked";

export interface Seat {
  seatId: string;        // A1, A2, B5 etc
  concertId: string;
  status: SeatStatus;
  lockedBy?: string;     // userId
  lockedUntil?: Date;
}

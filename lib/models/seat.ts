export type SeatStatus =
  | "available"
  | "selected"
  | "locked"
  | "booked";


export interface Seat {
  seatId: string;
  concertId: string;
  status: SeatStatus;
  lockedBy?: string | null;
  lockedUntil?: Date | null;
}


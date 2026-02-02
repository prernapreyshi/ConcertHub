"use client";

import type { Seat } from "@/lib/models/seat";
import type { Booking } from "@/lib/models/booking";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";

/* ================= TYPES ================= */

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Concert {
  id: string;
  name: string;
  artist: string;
  date: string;
  time: string;
  venue: string;
  price: number;
  totalSeats: number;
  rows: number;
  seatsPerRow: number;
}

interface BookingContextType {
  user: User | null;
  concert: Concert;
  seats: Seat[];
  selectedSeats: Seat[];
  bookings: Booking[];
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  selectSeat: (seatId: string) => void;
  deselectSeat: (seatId: string) => void;
  processPayment: () => Promise<Booking | null>;
  clearSelection: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

/* ================= DEMO CONCERT ================= */

const demoConcert: Concert = {
  id: "concert-arijit-001",
  name: "Arijit Singh Live in Concert",
  artist: "Arijit Singh",
  date: "2026-04-12",
  time: "7:30 PM",
  venue: "Jawaharlal Nehru Stadium, New Delhi",
  price: 1999,
  totalSeats: 80,
  rows: 8,
  seatsPerRow: 10,
};

/* ================= SEAT GENERATOR ================= */

function generateSeats(concert: Concert): Seat[] {
  const seats: Seat[] = [];
  const rows = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  for (let r = 0; r < concert.rows; r++) {
    for (let n = 1; n <= concert.seatsPerRow; n++) {
      seats.push({
        seatId: `${rows[r]}${n}`,
        concertId: concert.id,
        status: "available",
      });
    }
  }

  return seats;
}

/* ================= PROVIDER ================= */

export function BookingProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [seats, setSeats] = useState<Seat[]>(() => generateSeats(demoConcert));
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  /* ---------- Restore session ---------- */

  useEffect(() => {
  fetch("/api/auth/me", {
    credentials: "include",
  })
    .then(res => res.json())
    .then(data => setUser(data.user))
    .catch(() => setUser(null));
}, []);


  /* ---------- Sync seat status ---------- */

useEffect(() => {
  

  fetch(`/api/seats?concertId=${demoConcert.id}`)
    .then(res => res.json())
    .then(data => {
      if (!data?.seatStatus) return;

      const newSelected: Seat[] = [];

      setSeats(prev =>
        prev.map(seat => {
          const s = data.seatStatus[seat.seatId];
          if (!s) return seat;

          // ✅ If locked by ME → treat as selected
          if (user && s.status === "locked" && s.lockedBy === user.id) {

            const selectedSeat: Seat = {
              ...seat,
              status: "selected",
              lockedBy: user.id,
            };
            newSelected.push(selectedSeat);
            return selectedSeat;
          }

          // locked by other user
          return {
            ...seat,
            status: s.status,
            lockedBy: s.lockedBy,
          };
        })
      );

      // restore cart after refresh
      setSelectedSeats(newSelected);
    })
    .catch(() => {});
}, [user]);


  /* ---------- Auth ---------- */

  const login = useCallback(async (email: string, password: string) => {
  setIsLoading(true);

  const res = await fetch("/api/auth/login", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  setIsLoading(false);
  if (!res.ok) return false;

  // ✅ reload session from cookie
  const me = await fetch("/api/auth/me", {
    credentials: "include",
  }).then(r => r.json());

  setUser(me.user);

  return true;
}, []);


const register = useCallback(async (email: string, password: string, name: string) => {
  setIsLoading(true);

  const res = await fetch("/api/auth/register", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });

  setIsLoading(false);
  if (!res.ok) return false;

  const me = await fetch("/api/auth/me", {
    credentials: "include",
  }).then(r => r.json());

  setUser(me.user);

  return true;
}, []);

  const logout = useCallback(async () => {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  }).catch(() => {});

  setUser(null);
  setSelectedSeats([]);
}, []);


  /* ---------- Seat selection ---------- */

  const selectSeat = useCallback(async (seatId: string) => {
  const seat = seats.find(s => s.seatId === seatId);
  if (!seat) return;

  // 🔁 toggle logic (prevents duplicates)
  const alreadySelected = selectedSeats.some(s => s.seatId === seatId);

  if (alreadySelected) {
    setSelectedSeats(prev => prev.filter(s => s.seatId !== seatId));
    return;
  }

  // ✅ guest mode
if (!user) {
  setSeats(prev =>
    prev.map(s =>
      s.seatId === seatId ? { ...s, status: "selected" } : s
    )
  );

  setSelectedSeats(prev => [...prev, seat]);
  return;
}


  // ✅ logged-in → lock on server
  const res = await fetch("/api/seats/lock", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      concertId: demoConcert.id,
      seatId,
      action: "lock",
    }),
  });

  if (!res.ok) return;

  setSeats(prev =>
    prev.map(s =>
      s.seatId === seatId ? { ...s, status: "locked" } : s
    )
  );

  setSelectedSeats(prev => [...prev, seat]);
}, [user, seats, selectedSeats]);




  const deselectSeat = useCallback(async (seatId: string) => {
    await fetch("/api/seats/lock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        concertId: demoConcert.id,
        seatId,
        action: "unlock",
      }),
    });

    setSeats(prev =>
      prev.map(seat =>
        seat.seatId === seatId ? { ...seat, status: "available" } : seat
      )
    );

    setSelectedSeats(prev =>
      prev.filter(seat => seat.seatId !== seatId)
    );
  }, []);

  /* ---------- Payment ---------- */

  const processPayment = useCallback(async () => {
  if (!user || selectedSeats.length === 0) return null;

  const res = await fetch("/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      concertId: demoConcert.id,
      seats: selectedSeats.map(s => ({ seatId: s.seatId })),
      amount: selectedSeats.length * demoConcert.price,
    }),
  });

  // ❌ Payment failed → unlock seats
  if (!res.ok) {
    await Promise.all(
      selectedSeats.map(s =>
        fetch("/api/seats/lock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            concertId: demoConcert.id,
            seatId: s.seatId,
            action: "unlock",
          }),
        })
      )
    );

    // restore UI
    setSeats(prev =>
      prev.map(seat =>
        selectedSeats.some(s => s.seatId === seat.seatId)
          ? { ...seat, status: "available", lockedBy: null }
          : seat
      )
    );

    setSelectedSeats([]);

    alert("Payment failed. Seats released.");
    return null;
  }

  // ✅ Payment success
  await res.json();

  const normalized: Booking = {
    id: `BK-${Date.now()}`,
    concertId: demoConcert.id,
    concertName: demoConcert.name,
    artist: demoConcert.artist,
    venue: demoConcert.venue,
    date: demoConcert.date,
    time: demoConcert.time,
    seats: selectedSeats,
    totalAmount: selectedSeats.length * demoConcert.price,
    paymentStatus: "completed",
    createdAt: new Date().toISOString(),
    barcode: `TICKET-${Date.now()}`,
  };

  setBookings(prev => [...prev, normalized]);
  setSelectedSeats([]);

  return normalized;
}, [user, selectedSeats]);


const clearSelection = useCallback(() => {
  setSelectedSeats([]);
}, []);


  return (
    <BookingContext.Provider
      value={{
        user,
        concert: demoConcert,
        seats,
        selectedSeats,
        bookings,
        isLoading,
        login,
        logout,
        register,
        selectSeat,
        deselectSeat,
        processPayment,
        clearSelection,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be inside provider");
  return ctx;
}

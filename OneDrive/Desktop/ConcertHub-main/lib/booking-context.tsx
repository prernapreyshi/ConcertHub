"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

export interface User {
  id: string
  email: string
  name: string
}

export interface Concert {
  id: string
  name: string
  artist: string
  date: string
  time: string
  venue: string
  price: number
  totalSeats: number
  rows: number
  seatsPerRow: number
}

export interface Seat {
  id: string
  row: string
  number: number
  status: "available" | "selected" | "locked" | "booked"
  lockedBy?: string
  lockedUntil?: number
}

export interface Booking {
  id: string
  concertId: string
  concertName: string
  artist: string
  venue: string
  date: string
  time: string
  seats: Seat[]
  totalAmount: number
  paymentStatus: "pending" | "completed" | "failed"
  createdAt: string
  barcode: string
}

interface BookingContextType {
  user: User | null
  concert: Concert
  seats: Seat[]
  selectedSeats: Seat[]
  bookings: Booking[]
  isLoading: boolean
  login: (email: string, password: string, name?: string) => Promise<boolean>
  logout: () => void
  register: (email: string, password: string, name: string) => Promise<boolean>
  selectSeat: (seatId: string) => void
  deselectSeat: (seatId: string) => void
  lockSeats: () => Promise<boolean>
  unlockSeats: () => void
  processPayment: () => Promise<Booking | null>
  clearSelection: () => void
}

const BookingContext = createContext<BookingContextType | undefined>(undefined)

// Demo concert data
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
}

// Generate initial seats
function generateSeats(concert: Concert): Seat[] {
  const seats: Seat[] = []
  const rowLabels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  
  for (let row = 0; row < concert.rows; row++) {
    for (let num = 1; num <= concert.seatsPerRow; num++) {
      const seatId = `${rowLabels[row]}${num}`
      // Randomly mark some seats as booked for demo
      const isBooked = Math.random() < 0.15
      seats.push({
        id: seatId,
        row: rowLabels[row],
        number: num,
        status: isBooked ? "booked" : "available",
      })
    }
  }
  return seats
}

// Generate barcode string (Code 128 compatible)
function generateBarcodeData(bookingId: string): string {
  return `TICKET-${bookingId.toUpperCase()}`
}

export function BookingProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [seats, setSeats] = useState<Seat[]>(() => generateSeats(demoConcert))
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Simulated user database
  const [registeredUsers, setRegisteredUsers] = useState<Map<string, { password: string; name: string }>>(
    new Map()
  )

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800))
    
    const userData = registeredUsers.get(email)
    if (userData && userData.password === password) {
      setUser({
        id: `user-${Date.now()}`,
        email,
        name: userData.name,
      })
      setIsLoading(false)
      return true
    }
    
    // For demo purposes, allow any login if user doesn't exist (will register)
    setIsLoading(false)
    return false
  }, [registeredUsers])

  const register = useCallback(async (email: string, password: string, name: string): Promise<boolean> => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 800))
    
    if (registeredUsers.has(email)) {
      setIsLoading(false)
      return false
    }
    
    setRegisteredUsers((prev) => new Map(prev).set(email, { password, name }))
    setUser({
      id: `user-${Date.now()}`,
      email,
      name,
    })
    setIsLoading(false)
    return true
  }, [registeredUsers])

  const logout = useCallback(() => {
    // Unlock any selected seats when logging out
    setSeats((prev) =>
      prev.map((seat) =>
        seat.status === "selected" || (seat.status === "locked" && seat.lockedBy === user?.id)
          ? { ...seat, status: "available", lockedBy: undefined, lockedUntil: undefined }
          : seat
      )
    )
    setSelectedSeats([])
    setUser(null)
  }, [user])

  const selectSeat = useCallback((seatId: string) => {
    setSeats((prev) =>
      prev.map((seat) =>
        seat.id === seatId && seat.status === "available"
          ? { ...seat, status: "selected" }
          : seat
      )
    )
    setSelectedSeats((prev) => {
      const seat = seats.find((s) => s.id === seatId)
      if (seat && seat.status === "available") {
        return [...prev, { ...seat, status: "selected" }]
      }
      return prev
    })
  }, [seats])

  const deselectSeat = useCallback((seatId: string) => {
    setSeats((prev) =>
      prev.map((seat) =>
        seat.id === seatId && seat.status === "selected"
          ? { ...seat, status: "available" }
          : seat
      )
    )
    setSelectedSeats((prev) => prev.filter((seat) => seat.id !== seatId))
  }, [])

  const clearSelection = useCallback(() => {
    setSeats((prev) =>
      prev.map((seat) =>
        seat.status === "selected" ? { ...seat, status: "available" } : seat
      )
    )
    setSelectedSeats([])
  }, [])

  const lockSeats = useCallback(async (): Promise<boolean> => {
    if (!user || selectedSeats.length === 0) return false
    
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    
    const lockExpiry = Date.now() + 5 * 60 * 1000 // 5 minutes
    
    setSeats((prev) =>
      prev.map((seat) =>
        selectedSeats.some((s) => s.id === seat.id)
          ? { ...seat, status: "locked", lockedBy: user.id, lockedUntil: lockExpiry }
          : seat
      )
    )
    
    setIsLoading(false)
    return true
  }, [user, selectedSeats])

  const unlockSeats = useCallback(() => {
    if (!user) return
    
    setSeats((prev) =>
      prev.map((seat) =>
        seat.status === "locked" && seat.lockedBy === user.id
          ? { ...seat, status: "available", lockedBy: undefined, lockedUntil: undefined }
          : seat
      )
    )
    setSelectedSeats([])
  }, [user])

  const processPayment = useCallback(async (): Promise<Booking | null> => {
    if (!user || selectedSeats.length === 0) return null
    
    setIsLoading(true)
    
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))
    
    const bookingId = `BK${Date.now().toString(36).toUpperCase()}`
    
    const booking: Booking = {
      id: bookingId,
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
      barcode: generateBarcodeData(bookingId),
    }
    
    // Mark seats as booked
    setSeats((prev) =>
      prev.map((seat) =>
        selectedSeats.some((s) => s.id === seat.id)
          ? { ...seat, status: "booked", lockedBy: undefined, lockedUntil: undefined }
          : seat
      )
    )
    
    setBookings((prev) => [...prev, booking])
    setSelectedSeats([])
    setIsLoading(false)
    
    return booking
  }, [user, selectedSeats])

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
        lockSeats,
        unlockSeats,
        processPayment,
        clearSelection,
      }}
    >
      {children}
    </BookingContext.Provider>
  )
}

export function useBooking() {
  const context = useContext(BookingContext)
  if (context === undefined) {
    throw new Error("useBooking must be used within a BookingProvider")
  }
  return context
}

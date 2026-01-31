"use client"

import { useEffect, useState } from "react"
import { useBooking } from "@/lib/booking-context"
import { cn } from "@/lib/utils"
import type { Seat } from "@/lib/booking-context"

interface SeatGridProps {
  onSeatClick: (seat: Seat) => void
  disabled?: boolean
}

export function SeatGrid({ onSeatClick, disabled }: SeatGridProps) {
  const { concert, seats } = useBooking()

  // ✅ Prevent hydration mismatch
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // 🚫 Render nothing on SSR
  if (!mounted) {
    return null
  }

  // Group seats by row
  const seatsByRow = seats.reduce(
    (acc, seat) => {
      if (!acc[seat.row]) {
        acc[seat.row] = []
      }
      acc[seat.row].push(seat)
      return acc
    },
    {} as Record<string, Seat[]>
  )

  const rows = Object.keys(seatsByRow).sort()

  const getSeatClasses = (seat: Seat) => {
    const baseClasses =
      "relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-t-lg text-xs font-medium transition-all duration-200"

    switch (seat.status) {
      case "available":
        return cn(
          baseClasses,
          "bg-seat-available text-foreground/70 hover:bg-primary/20 hover:scale-110 hover:shadow-md cursor-pointer"
        )
      case "selected":
        return cn(
          baseClasses,
          "bg-seat-selected text-primary-foreground shadow-lg scale-105 ring-2 ring-primary/50 cursor-pointer"
        )
      case "locked":
        return cn(
          baseClasses,
          "bg-seat-locked text-muted-foreground cursor-not-allowed opacity-60"
        )
      case "booked":
        return cn(
          baseClasses,
          "bg-seat-booked text-muted-foreground/50 cursor-not-allowed"
        )
      default:
        return baseClasses
    }
  }

  const handleSeatClick = (seat: Seat) => {
    if (disabled) return
    if (seat.status === "available" || seat.status === "selected") {
      onSeatClick(seat)
    }
  }

  return (
    <div className="space-y-6">
      {/* Stage */}
      <div className="relative mx-auto w-full max-w-md">
        <div className="h-8 rounded-t-full bg-gradient-to-b from-primary/30 to-primary/10" />
        <div className="absolute inset-x-0 top-1 text-center text-xs font-medium uppercase tracking-widest text-primary">
          Stage
        </div>
      </div>

      {/* Seats Grid */}
      <div className="flex flex-col items-center gap-2 overflow-x-auto py-4">
        {rows.map((row) => (
          <div key={row} className="flex items-center gap-1 sm:gap-2">
            <span className="w-6 text-center text-sm font-semibold text-muted-foreground">
              {row}
            </span>

            <div className="flex gap-1 sm:gap-1.5">
              {seatsByRow[row]
                .sort((a, b) => a.number - b.number)
                .map((seat, index) => (
                  <div key={seat.id} className="flex items-center">
                    {/* Aisle gap */}
                    {index === concert.seatsPerRow / 2 && (
                      <div className="w-4 sm:w-6" />
                    )}

                    <button
                      type="button"
                      className={getSeatClasses(seat)}
                      onClick={() => handleSeatClick(seat)}
                      disabled={
                        disabled ||
                        seat.status === "locked" ||
                        seat.status === "booked"
                      }
                      aria-label={`Seat ${seat.id}, ${seat.status}`}
                    >
                      {seat.number}
                      <div className="absolute -bottom-1 left-1/2 h-1.5 w-5 -translate-x-1/2 rounded-b-sm bg-inherit opacity-70" />
                    </button>
                  </div>
                ))}
            </div>

            <span className="w-6 text-center text-sm font-semibold text-muted-foreground">
              {row}
            </span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-t-md bg-seat-available" />
          <span className="text-sm text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-t-md bg-seat-selected ring-2 ring-primary/50" />
          <span className="text-sm text-muted-foreground">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-t-md bg-seat-locked opacity-60" />
          <span className="text-sm text-muted-foreground">Locked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-t-md bg-seat-booked" />
          <span className="text-sm text-muted-foreground">Booked</span>
        </div>
      </div>
    </div>
  )
}

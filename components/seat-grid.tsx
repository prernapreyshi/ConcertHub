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

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const seatsByRow = seats.reduce(
    (acc, seat) => {
      if (!acc[seat.row]) acc[seat.row] = []
      acc[seat.row].push(seat)
      return acc
    },
    {} as Record<string, Seat[]>
  )

  const rows = Object.keys(seatsByRow).sort()

  const getSeatClasses = (seat: Seat) => {
    const base =
      "relative flex h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 items-center justify-center rounded-t-lg text-[10px] sm:text-xs font-medium transition-all duration-200"

    switch (seat.status) {
      case "available":
        return cn(
          base,
          "bg-seat-available text-foreground/70 hover:bg-primary/20 hover:scale-110 hover:shadow-md cursor-pointer"
        )
      case "selected":
        return cn(
          base,
          "bg-seat-selected text-primary-foreground shadow-lg scale-105 ring-2 ring-primary/50 cursor-pointer"
        )
      case "locked":
        return cn(
          base,
          "bg-seat-locked text-muted-foreground cursor-not-allowed opacity-60"
        )
      case "booked":
        return cn(
          base,
          "bg-seat-booked text-muted-foreground/50 cursor-not-allowed"
        )
      default:
        return base
    }
  }

  const handleSeatClick = (seat: Seat) => {
    if (disabled) return
    if (seat.status === "available" || seat.status === "selected") {
      onSeatClick(seat)
    }
  }

  return (
    <div className="space-y-5">
      {/* Stage */}
      <div className="relative mx-auto w-full max-w-xs sm:max-w-sm md:max-w-md">
        <div className="h-6 sm:h-8 rounded-t-full bg-gradient-to-b from-primary/30 to-primary/10" />
        <div className="absolute inset-x-0 top-1 text-center text-[10px] sm:text-xs font-medium uppercase tracking-widest text-primary">
          Stage
        </div>
      </div>

      {/* Seat Container */}
      <div className="w-full overflow-x-auto">
        <div className="flex min-w-max flex-col items-center gap-1.5 py-3">
          {rows.map((row) => (
            <div key={row} className="flex items-center gap-1 sm:gap-2">
              <span className="w-5 sm:w-6 text-center text-xs sm:text-sm font-semibold text-muted-foreground">
                {row}
              </span>

              <div className="flex gap-1 sm:gap-1.5">
                {seatsByRow[row]
                  .sort((a, b) => a.number - b.number)
                  .map((seat, index) => (
                    <div key={seat.id} className="flex items-center">
                      {index === concert.seatsPerRow / 2 && (
                        <div className="w-3 sm:w-5" />
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
                        <div className="absolute -bottom-1 left-1/2 h-1.5 w-4 -translate-x-1/2 rounded-b-sm bg-inherit opacity-70" />
                      </button>
                    </div>
                  ))}
              </div>

              <span className="w-5 sm:w-6 text-center text-xs sm:text-sm font-semibold text-muted-foreground">
                {row}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5">
        <Legend color="bg-seat-available" label="Available" />
        <Legend color="bg-seat-selected ring-2 ring-primary/50" label="Selected" />
        <Legend color="bg-seat-locked opacity-60" label="Locked" />
        <Legend color="bg-seat-booked" label="Booked" />
      </div>
    </div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`h-4 w-4 sm:h-5 sm:w-5 rounded-t-md ${color}`} />
      <span className="text-xs sm:text-sm text-muted-foreground">
        {label}
      </span>
    </div>
  )
}

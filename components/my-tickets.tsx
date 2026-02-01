"use client"

import { useState } from "react"
import { useBooking } from "@/lib/booking-context"
import { TicketConfirmation } from "./ticket-confirmation"
import { Button } from "@/components/ui/button"

export function MyTickets({ onBack }: { onBack: () => void }) {
  const { bookings } = useBooking()

  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    bookings[bookings.length - 1]?.id || null
  )

  const selectedBooking = bookings.find(
    (b) => b.id === selectedBookingId
  )

  /* ================= EMPTY ================= */

  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-8 space-y-3">
        <p className="text-sm sm:text-base text-muted-foreground">
          No tickets booked yet.
        </p>

        <Button onClick={onBack} className="w-full sm:w-auto">
          Book Tickets
        </Button>
      </div>
    )
  }

  /* ================= MAIN ================= */

  return (
    <div className="space-y-5 sm:space-y-6">

      {/* Ticket selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {bookings.map((booking, index) => (
          <Button
            key={booking.id}
            variant={
              booking.id === selectedBookingId ? "default" : "outline"
            }
            onClick={() => setSelectedBookingId(booking.id)}
            className="shrink-0 text-xs sm:text-sm px-3"
          >
            Ticket {index + 1}
          </Button>
        ))}
      </div>

      {/* Selected ticket */}
      {selectedBooking && (
        <TicketConfirmation
          booking={selectedBooking}
          onBackToSelection={onBack}
        />
      )}
    </div>
  )
}

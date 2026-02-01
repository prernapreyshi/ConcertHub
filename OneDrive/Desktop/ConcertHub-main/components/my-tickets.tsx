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

  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12 px-4">
        <p className="text-muted-foreground">No tickets booked yet.</p>
        <Button onClick={onBack} className="mt-4 w-full max-w-xs">
          Book Tickets
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-2 sm:px-0">
      {/* Ticket selector */}
      <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
        {bookings.map((booking, index) => (
          <Button
            key={booking.id}
            variant={
              booking.id === selectedBookingId ? "default" : "outline"
            }
            onClick={() => setSelectedBookingId(booking.id)}
            className="flex-1 min-w-[110px] sm:flex-none"
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

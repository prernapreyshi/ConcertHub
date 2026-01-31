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
      <div className="text-center">
        <p className="text-muted-foreground">No tickets booked yet.</p>
        <Button onClick={onBack} className="mt-4">
          Book Tickets
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Ticket selector */}
      <div className="flex flex-wrap gap-2">
        {bookings.map((booking, index) => (
          <Button
            key={booking.id}
            variant={booking.id === selectedBookingId ? "default" : "outline"}
            onClick={() => setSelectedBookingId(booking.id)}
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

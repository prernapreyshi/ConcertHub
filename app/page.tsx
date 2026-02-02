"use client";

import { useState, useEffect } from "react"
import { BookingProvider, useBooking } from "@/lib/booking-context"
import type { Booking } from "@/lib/models/booking"
import type { Seat } from "@/lib/models/seat"
import { Header } from "@/components/header"
import { ConcertInfo } from "@/components/concert-info"
import { SeatGrid } from "@/components/seat-grid"
import { SelectionSummary } from "@/components/selection-summary"
import { AuthModal } from "@/components/auth-modal"
import { CheckoutModal } from "@/components/checkout-modal"
import { TicketConfirmation } from "@/components/ticket-confirmation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function BookingApp() {
  const { user, bookings, selectSeat, deselectSeat } = useBooking()

  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)

  const [view, setView] = useState<"booking" | "ticket">("booking")
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null)

  
  useEffect(() => {
    if (user && bookings.length > 0) {
      setActiveBooking(bookings[bookings.length - 1])
      setView("ticket")
    }
  }, [user, bookings])

  useEffect(() => {
    if (!user) {
      setView("booking")
      setActiveBooking(null)
    }
  }, [user])

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === "locked")
 {
      deselectSeat(seat.seatId)
    } else if (seat.status === "available") {
      selectSeat(seat.seatId)
    }
  }

  const handleProceedToCheckout = () => {
    setShowCheckoutModal(true)
  }

 

  const handlePaymentSuccess = (booking: Booking) => {
    setActiveBooking(booking)
    setView("ticket")
    setShowCheckoutModal(false)
  }

  const handleBackToSelection = () => {
    setActiveBooking(null)
    setView("booking")
  }

  const handleMyTickets = () => {
    if (bookings.length > 0) {
      setActiveBooking(bookings[bookings.length - 1])
      setView("ticket")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onMyTickets={handleMyTickets} />

      <main className="container mx-auto px-3 sm:px-4 md:px-6 py-6 md:py-8">
        {view === "ticket" && activeBooking && (
          <TicketConfirmation
            booking={activeBooking}
            onBackToSelection={handleBackToSelection}
          />
        )}

        {view === "booking" && (
          <>
            <div className="mb-6 md:mb-8 text-center">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                Book Your Tickets
              </h1>
              <p className="mt-2 text-sm md:text-base text-muted-foreground">
                Select your seats and enjoy the show
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-3">
              <div className="space-y-4 md:space-y-6 lg:col-span-2">
                <ConcertInfo />

                <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Select Your Seats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SeatGrid
                      onSeatClick={handleSeatClick}
                      disabled={showCheckoutModal}
                    />
                  </CardContent>
                </Card>
              </div>

              <div className="w-full lg:sticky lg:top-24 lg:h-fit">
  <SelectionSummary
    onProceedToCheckout={handleProceedToCheckout}
  />
</div>

            </div>
          </>
        )}
      </main>

      <AuthModal />
      <CheckoutModal
        open={showCheckoutModal}
        onOpenChange={setShowCheckoutModal}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  )
}

export default function Home() {
  return (
    <BookingProvider>
      <BookingApp />
    </BookingProvider>
  )
}

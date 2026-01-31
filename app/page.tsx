"use client"

import { useState, useEffect } from "react"
import {
  BookingProvider,
  useBooking,
  type Booking,
  type Seat,
} from "@/lib/booking-context"
import { Header } from "@/components/header"
import { ConcertInfo } from "@/components/concert-info"
import { SeatGrid } from "@/components/seat-grid"
import { SelectionSummary } from "@/components/selection-summary"
import { AuthModal } from "@/components/auth-modal"
import { CheckoutModal } from "@/components/checkout-modal"
import { TicketConfirmation } from "@/components/ticket-confirmation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function BookingApp() {
  const {
    user,
    bookings,
    selectSeat,
    deselectSeat,
  } = useBooking()

  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)

  // 🔑 NEW STATE
  const [view, setView] = useState<"booking" | "ticket">("booking")
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null)

  /* ✅ AUTO SHOW LAST TICKET AFTER LOGIN */
  useEffect(() => {
    if (user && bookings.length > 0) {
      setActiveBooking(bookings[bookings.length - 1])
      setView("ticket")
    }
  }, [user, bookings])

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === "selected") {
      deselectSeat(seat.id)
    } else if (seat.status === "available") {
      selectSeat(seat.id)
    }
  }

  const handleProceedToCheckout = () => {
    setShowCheckoutModal(true)
  }

  const handleAuthRequired = () => {
    setShowAuthModal(true)
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

  /* ✅ CLICK FROM HEADER → SHOW TICKET */
  const handleMyTickets = () => {
    if (bookings.length > 0) {
      setActiveBooking(bookings[bookings.length - 1])
      setView("ticket")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 🔥 PASS CLICK HANDLER */}
      <Header onMyTickets={handleMyTickets} />

      <main className="container mx-auto px-4 py-8">
        {/* ================= TICKET VIEW ================= */}
        {view === "ticket" && activeBooking && (
          <TicketConfirmation
            booking={activeBooking}
            onBackToSelection={handleBackToSelection}
          />
        )}

        {/* ================= BOOKING VIEW ================= */}
        {view === "booking" && (
          <>
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Book Your Tickets
              </h1>
              <p className="mt-2 text-muted-foreground">
                Select your seats and enjoy the show
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
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

              <div className="lg:sticky lg:top-24 lg:h-fit">
                <SelectionSummary
                  onProceedToCheckout={handleProceedToCheckout}
                  onAuthRequired={handleAuthRequired}
                />
              </div>
            </div>
          </>
        )}
      </main>

      {/* MODALS */}
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
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

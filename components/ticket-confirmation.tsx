"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useBooking, type Booking } from "@/lib/booking-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Barcode } from "@/components/barcode"
import {
  Calendar,
  Clock,
  MapPin,
  Ticket,
  CheckCircle2,
  Download,
  ArrowLeft,
} from "lucide-react"

interface TicketConfirmationProps {
  booking: Booking
  onBackToSelection: () => void
}

export function TicketConfirmation({
  booking,
  onBackToSelection,
}: TicketConfirmationProps) {
  const { user } = useBooking()
  const router = useRouter()

  /* 🔐 HARD GUARD: block Guest users */
  useEffect(() => {
    if (!user) {
      router.replace("/") // redirect immediately on logout
    }
  }, [user, router])

  /* ⛔ Stop rendering completely if logged out */
  if (!user) return null

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 print:max-w-none">
      {/* Success Banner */}
      <div className="flex items-center gap-4 rounded-xl bg-green-50 p-6 print:hidden">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-green-800">
            Booking Confirmed!
          </h2>
          <p className="text-green-700">
            Your tickets have been booked successfully. Check your email for
            confirmation.
          </p>
        </div>
      </div>

      {/* Ticket Card */}
      <Card className="overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm print:border print:border-foreground/20">
        {/* Header */}
        <div className="bg-primary p-6 text-primary-foreground">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                <span className="text-sm font-medium opacity-90">
                  E-TICKET
                </span>
              </div>
              <h3 className="mt-2 text-2xl font-bold">
                {booking.concertName}
              </h3>
              <p className="opacity-90">{booking.artist}</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-75">Booking ID</p>
              <p className="font-mono text-lg font-bold">{booking.id}</p>
            </div>
          </div>
        </div>

        <CardContent className="p-6">
          {/* Event Details */}
          <div className="grid gap-4 sm:grid-cols-3">
            <InfoItem
              icon={<Calendar className="h-5 w-5 text-primary" />}
              label="Date"
              value={formatDate(booking.date)}
            />
            <InfoItem
              icon={<Clock className="h-5 w-5 text-primary" />}
              label="Time"
              value={booking.time}
            />
            <InfoItem
              icon={<MapPin className="h-5 w-5 text-primary" />}
              label="Venue"
              value={booking.venue}
            />
          </div>

          <Separator className="my-6" />

          {/* Seats */}
          <div className="rounded-lg bg-secondary/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  Seats
                </p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {booking.seats.map((seat) => (
                    <span
                      key={seat.id}
                      className="rounded-md bg-primary/10 px-3 py-1 text-sm font-semibold text-primary"
                    >
                      {seat.id}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  Total
                </p>
                <p className="text-2xl font-bold text-primary">
                  ₹{booking.totalAmount.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* User Info */}
          <div className="mb-6 rounded-lg border border-border/50 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Ticket Holder
            </p>
            <p className="mt-1 font-semibold">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>

          {/* Barcode */}
          <div className="flex flex-col items-center rounded-lg border border-dashed border-border p-6">
            <Barcode value={booking.barcode} width={280} height={80} />
            <p className="mt-3 font-mono text-sm text-muted-foreground">
              {booking.barcode}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Present this barcode at the venue entrance
            </p>
          </div>
        </CardContent>

        <div className="border-t border-dashed border-border bg-secondary/30 p-4">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              Booked on{" "}
              {new Date(booking.createdAt).toLocaleDateString()}
            </span>
            <span>
              Payment Status: {booking.paymentStatus.toUpperCase()}
            </span>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-4 print:hidden">
        <Button variant="outline" onClick={onBackToSelection} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Book More Tickets
        </Button>
        <Button onClick={handlePrint} className="gap-2">
          <Download className="h-4 w-4" />
          Print Ticket
        </Button>
      </div>
    </div>
  )
}

/* Small helper component */
function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  )
}

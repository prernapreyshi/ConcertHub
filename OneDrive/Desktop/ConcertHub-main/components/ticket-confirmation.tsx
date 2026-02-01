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

  useEffect(() => {
    if (!user) router.replace("/")
  }, [user, router])

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

  const handlePrint = () => window.print()

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-2 sm:px-0 print:max-w-none">

      {/* Success banner */}
      <div className="flex flex-col sm:flex-row items-center gap-4 rounded-xl bg-green-50 p-4 sm:p-6 print:hidden text-center sm:text-left">
        <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-7 w-7 sm:h-8 sm:w-8 text-green-600" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-green-800">
            Booking Confirmed!
          </h2>
          <p className="text-sm sm:text-base text-green-700">
            Your tickets have been booked successfully.
          </p>
        </div>
      </div>

      {/* Ticket card */}
      <Card className="overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm print:border print:border-foreground/20">

        {/* Header */}
        <div className="bg-primary p-4 sm:p-6 text-primary-foreground">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                <span className="text-sm font-medium opacity-90">
                  E-TICKET
                </span>
              </div>
              <h3 className="mt-2 text-xl sm:text-2xl font-bold">
                {booking.concertName}
              </h3>
              <p className="opacity-90 text-sm sm:text-base">
                {booking.artist}
              </p>
            </div>

            <div className="sm:text-right">
              <p className="text-xs opacity-75">Booking ID</p>
              <p className="font-mono text-base sm:text-lg font-bold break-all">
                {booking.id}
              </p>
            </div>
          </div>
        </div>

        <CardContent className="p-4 sm:p-6">

          {/* Event details */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            <InfoItem icon={<Calendar className="h-5 w-5 text-primary" />} label="Date" value={formatDate(booking.date)} />
            <InfoItem icon={<Clock className="h-5 w-5 text-primary" />} label="Time" value={booking.time} />
            <InfoItem icon={<MapPin className="h-5 w-5 text-primary" />} label="Venue" value={booking.venue} />
          </div>

          <Separator className="my-6" />

          {/* Seats */}
          <div className="rounded-lg bg-secondary/50 p-4 flex flex-col sm:flex-row sm:justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
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

            <div className="sm:text-right">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Total
              </p>
              <p className="text-xl sm:text-2xl font-bold text-primary">
                ₹{booking.totalAmount.toFixed(2)}
              </p>
            </div>
          </div>

          <Separator className="my-6" />

          {/* User info */}
          <div className="mb-6 rounded-lg border border-border/50 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Ticket Holder
            </p>
            <p className="mt-1 font-semibold">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>

          {/* Barcode */}
          <div className="flex flex-col items-center rounded-lg border border-dashed border-border p-4 sm:p-6 text-center">
            <Barcode value={booking.barcode} />
            <p className="mt-3 font-mono text-sm text-muted-foreground break-all">
              {booking.barcode}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Present this barcode at the venue entrance
            </p>
          </div>

        </CardContent>

        <div className="border-t border-dashed border-border bg-secondary/30 p-4 text-xs text-muted-foreground flex flex-col sm:flex-row sm:justify-between gap-1">
          <span>Booked on {new Date(booking.createdAt).toLocaleDateString()}</span>
          <span>Payment Status: {booking.paymentStatus.toUpperCase()}</span>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 print:hidden">
        <Button variant="outline" onClick={onBackToSelection} className="gap-2 w-full">
          <ArrowLeft className="h-4 w-4" />
          Book More Tickets
        </Button>

        <Button onClick={handlePrint} className="gap-2 w-full">
          <Download className="h-4 w-4" />
          Print Ticket
        </Button>
      </div>
    </div>
  )
}

/* Helper */
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
        <p className="font-medium text-sm sm:text-base">{value}</p>
      </div>
    </div>
  )
}

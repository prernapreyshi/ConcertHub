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
    <div className="mx-auto max-w-2xl space-y-5 sm:space-y-6 print:max-w-none">

      {/* Success Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-xl bg-green-50 p-4 sm:p-6 print:hidden">
        <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-green-100 shrink-0">
          <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
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

      {/* Ticket Card */}
      <Card className="overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm print:border print:border-foreground/20">

        {/* Header */}
        <div className="bg-primary p-4 sm:p-6 text-primary-foreground">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                <span className="text-xs sm:text-sm font-medium opacity-90">
                  E-TICKET
                </span>
              </div>

              <h3 className="mt-1 sm:mt-2 text-lg sm:text-2xl font-bold break-words">
                {booking.concertName}
              </h3>

              <p className="opacity-90 text-sm sm:text-base">
                {booking.artist}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-xs opacity-75">Booking ID</p>
              <p className="font-mono text-sm sm:text-lg font-bold break-all">
                {booking.id}
              </p>
            </div>
          </div>
        </div>

        <CardContent className="p-4 sm:p-6">

          {/* Event Details */}
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-3">
            <InfoItem icon={<Calendar />} label="Date" value={formatDate(booking.date)} />
            <InfoItem icon={<Clock />} label="Time" value={booking.time} />
            <InfoItem icon={<MapPin />} label="Venue" value={booking.venue} />
          </div>

          <Separator className="my-5 sm:my-6" />

          {/* Seats */}
          <div className="rounded-lg bg-secondary/50 p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Seats
                </p>

                <div className="mt-1 flex flex-wrap gap-1.5 sm:gap-2">
                  {booking.seats.map((seat) => (
                    <span
                      key={seat.id}
                      className="rounded-md bg-primary/10 px-2.5 py-1 text-xs sm:text-sm font-semibold text-primary"
                    >
                      {seat.id}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-left sm:text-right">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Total
                </p>
                <p className="text-lg sm:text-2xl font-bold text-primary">
                  ₹{booking.totalAmount.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <Separator className="my-5 sm:my-6" />

          {/* User */}
          <div className="mb-5 sm:mb-6 rounded-lg border border-border/50 p-3 sm:p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Ticket Holder
            </p>
            <p className="mt-1 font-semibold break-words">{user.name}</p>
            <p className="text-sm text-muted-foreground break-all">
              {user.email}
            </p>
          </div>

          {/* Barcode */}
          <div className="flex flex-col items-center rounded-lg border border-dashed border-border p-4 sm:p-6">
            <Barcode value={booking.barcode} width={240} height={70} />
            <p className="mt-2 font-mono text-xs sm:text-sm text-muted-foreground break-all text-center">
              {booking.barcode}
            </p>
            <p className="mt-1 text-xs text-muted-foreground text-center">
              Present this barcode at the venue entrance
            </p>
          </div>
        </CardContent>

        <div className="border-t border-dashed border-border bg-secondary/30 p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-xs text-muted-foreground">
            <span>
              Booked on {new Date(booking.createdAt).toLocaleDateString()}
            </span>
            <span>
              Payment Status: {booking.paymentStatus.toUpperCase()}
            </span>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 print:hidden">
        <Button variant="outline" onClick={onBackToSelection} className="gap-2 w-full sm:w-auto">
          <ArrowLeft className="h-4 w-4" />
          Book More Tickets
        </Button>

        <Button onClick={handlePrint} className="gap-2 w-full sm:w-auto">
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
      <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="text-sm sm:text-base font-medium break-words">
          {value}
        </p>
      </div>
    </div>
  )
}

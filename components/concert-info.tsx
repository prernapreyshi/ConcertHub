"use client"

import { useBooking } from "@/lib/booking-context"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Clock, MapPin, Music2 } from "lucide-react"

export function ConcertInfo() {
  const { concert } = useBooking()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <Card className="overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
      <div className="h-2 bg-primary" />

      <CardContent className="p-4 sm:p-6">

        {/* Top Section */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

          <div className="space-y-1">
            <h2 className="text-lg sm:text-2xl font-bold tracking-tight break-words">
              {concert.name}
            </h2>

            <div className="flex items-center gap-2 text-sm sm:text-base text-muted-foreground">
              <Music2 className="h-4 w-4" />
              <span className="font-medium">{concert.artist}</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex w-fit items-center rounded-full bg-primary/10 px-3 sm:px-4 py-1.5 sm:py-2">
            <span className="text-lg sm:text-2xl font-bold text-primary">
              ₹{concert.price}
            </span>
            <span className="ml-1 text-xs sm:text-sm text-muted-foreground">
              /seat
            </span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="mt-4 sm:mt-6 grid gap-3 sm:gap-4 sm:grid-cols-3">

          <InfoCard
            icon={<Calendar className="icon" />}
            label="Date"
            value={formatDate(concert.date)}
          />

          <InfoCard
            icon={<Clock className="icon" />}
            label="Time"
            value={concert.time}
          />

          <InfoCard
            icon={<MapPin className="icon" />}
            label="Venue"
            value={concert.venue}
          />
        </div>
      </CardContent>
    </Card>
  )
}

/* ================= INFO CARD ================= */

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-2.5 sm:p-3">

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

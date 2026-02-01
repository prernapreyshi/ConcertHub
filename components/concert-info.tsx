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
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-balance">{concert.name}</h2>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Music2 className="h-4 w-4" />
              <span className="font-medium">{concert.artist}</span>
            </div>
          </div>
          <div className="flex h-fit items-center rounded-full bg-primary/10 px-4 py-2">
            <span className="text-2xl font-bold text-primary">₹{concert.price}</span>
            <span className="ml-1 text-sm text-muted-foreground">/seat</span>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Date</p>
              <p className="font-medium">{formatDate(concert.date)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Time</p>
              <p className="font-medium">{concert.time}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Venue</p>
              <p className="font-medium">{concert.venue}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

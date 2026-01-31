"use client"

import { useBooking } from "@/lib/booking-context"
import { Button } from "@/components/ui/button"
import { User, LogOut, Ticket } from "lucide-react"

interface HeaderProps {
  onMyTickets?: () => void
}

export function Header({ onMyTickets }: HeaderProps) {
  const { user, logout, bookings } = useBooking()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Ticket className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold tracking-tight">ConcertHub</span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              {/* ✅ CLICKABLE USER + BOOKINGS */}
              <button
                onClick={onMyTickets}
                className="hidden items-center gap-2 sm:flex text-left hover:opacity-80"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent">
                  <User className="h-4 w-4 text-accent-foreground" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium leading-none">
                    {user.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {bookings.length} booking{bookings.length !== 1 && "s"}
                  </span>
                </div>
              </button>

              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="gap-2 bg-transparent"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Guest</span>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

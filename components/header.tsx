"use client"

import { useBooking } from "@/lib/booking-context"
import { Button } from "@/components/ui/button"
import { User, LogOut, Ticket } from "lucide-react"
import { openAuthModal } from "@/components/auth-modal"

interface HeaderProps {
  onMyTickets?: () => void
}

export function Header({ onMyTickets }: HeaderProps) {
  const booking = useBooking()

const user = booking?.user
const logout = booking?.logout ?? (() => {})
const bookings = booking?.bookings ?? []


  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4">

        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-primary">
            <Ticket className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
          </div>

          <span className="text-base sm:text-xl font-semibold tracking-tight">
            ConcertHub
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {user ? (
            <>
              <button
                onClick={onMyTickets}
                className="hidden sm:flex items-center gap-2 text-left hover:opacity-80"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent">
                  <User className="h-4 w-4 text-accent-foreground" />
                </div>

                <div className="flex flex-col">
                  <span className="text-sm font-medium leading-none">
                    {user.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {bookings.length} booking
                    {bookings.length !== 1 && "s"}
                  </span>
                </div>
              </button>

              <button
                onClick={onMyTickets}
                className="sm:hidden flex h-9 w-9 items-center justify-center rounded-full bg-accent"
              >
                <User className="h-4 w-4 text-accent-foreground" />
              </button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => logout?.()}
                className="gap-2 bg-transparent px-2 sm:px-3"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={openAuthModal}
              className="gap-2 px-3"
            >
              <User className="h-4 w-4" />
              Login / Signup
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

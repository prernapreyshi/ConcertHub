"use client"

import { useBooking } from "@/lib/booking-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, ShoppingCart, Loader2 } from "lucide-react"

interface SelectionSummaryProps {
  onProceedToCheckout: () => void
  onAuthRequired: () => void
}

export function SelectionSummary({ onProceedToCheckout, onAuthRequired }: SelectionSummaryProps) {
  const { user, concert, selectedSeats, deselectSeat, clearSelection, isLoading } = useBooking()

  const totalAmount = selectedSeats.length * concert.price

  const handleProceed = () => {
    if (!user) {
      onAuthRequired()
      return
    }
    onProceedToCheckout()
  }

  if (selectedSeats.length === 0) {
    return (
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
            <ShoppingCart className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold">No seats selected</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Click on available seats to select them
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Your Selection</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSelection}
            className="h-8 text-xs text-muted-foreground hover:text-destructive"
          >
            Clear all
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selected Seats */}
        <div className="flex flex-wrap gap-2">
          {selectedSeats.map((seat) => (
            <Badge
              key={seat.id}
              variant="secondary"
              className="gap-1 bg-primary/10 pl-3 pr-1 text-primary hover:bg-primary/20"
            >
              Seat {seat.id}
              <button
                type="button"
                onClick={() => deselectSeat(seat.id)}
                className="ml-1 rounded-full p-0.5 hover:bg-primary/20"
                aria-label={`Remove seat ${seat.id}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>

        {/* Price Breakdown */}
        <div className="space-y-2 border-t border-border/50 pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {selectedSeats.length} {selectedSeats.length === 1 ? "seat" : "seats"} x ₹{concert.price}
            </span>
            <span>₹{totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Service fee</span>
            <span>₹0.00</span>
          </div>
          <div className="flex items-center justify-between border-t border-border/50 pt-2 font-semibold">
            <span>Total</span>
            <span className="text-lg text-primary">₹{totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Checkout Button */}
        <Button
          className="w-full"
          size="lg"
          onClick={handleProceed}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : user ? (
            "Proceed to Checkout"
          ) : (
            "Sign in to Continue"
          )}
        </Button>

        {!user && (
          <p className="text-center text-xs text-muted-foreground">
            You need to sign in to complete your booking
          </p>
        )}
      </CardContent>
    </Card>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useBooking } from "@/lib/booking-context"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Clock, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import type { Booking } from "@/lib/models/booking"

interface CheckoutModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPaymentSuccess: (booking: Booking) => void
}

export function CheckoutModal({
  open,
  onOpenChange,
  onPaymentSuccess,
}: CheckoutModalProps) {
  const {
    concert,
    selectedSeats,
    processPayment,
    clearSelection,
    isLoading,
  } = useBooking()

  const [step, setStep] = useState<
    "confirm" | "processing" | "success" | "error"
  >("confirm")

  const [timeLeft, setTimeLeft] = useState(300)
  const [errorMessage, setErrorMessage] = useState("")

  const totalAmount = selectedSeats.length * concert.price

  /* ================= RESET WHEN CLOSED ================= */

  useEffect(() => {
    if (!open) {
      setStep("confirm")
      setTimeLeft(300)
      setErrorMessage("")
    }
  }, [open])

  /* ================= TIMER ================= */

  useEffect(() => {
    if (!open || step !== "confirm") return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)

          // release selection if timeout
          clearSelection()
          onOpenChange(false)

          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [open, step, onOpenChange, clearSelection])

  /* ================= HELPERS ================= */

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  /* ================= PAYMENT ================= */

  const handlePayment = async () => {
    setStep("processing")

    try {
      await new Promise(r => setTimeout(r, 1200))

      const booking = await processPayment()

      if (booking) {
        setStep("success")

        setTimeout(() => {
          onPaymentSuccess(booking)
          onOpenChange(false)
        }, 1200)
      } else {
        setStep("error")
        setErrorMessage("Payment failed. Please try again.")
      }
    } catch {
      setStep("error")
      setErrorMessage("Unexpected error occurred.")
    }
  }

  const handleCancel = () => {
    clearSelection()
    onOpenChange(false)
  }

  const handleRetry = () => {
    setStep("confirm")
    setErrorMessage("")
  }

  /* ================= UI ================= */

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="w-[95vw] max-w-md rounded-xl p-4 sm:p-6">

        {/* CONFIRM */}
        {step === "confirm" && (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">
                Checkout
              </DialogTitle>

              <DialogDescription className="text-sm">
                Complete your booking for {concert.name}
              </DialogDescription>
            </DialogHeader>

            {/* Timer */}
            <div className="flex items-center gap-3 rounded-lg bg-accent/50 p-3">
              <Clock className="h-5 w-5 text-primary" />
              <p className="text-lg sm:text-xl font-bold">
                {formatTime(timeLeft)}
              </p>
            </div>

            {/* Concert */}
            <div className="rounded-lg border p-3 sm:p-4">
              <p className="font-medium">{concert.name}</p>
              <p className="text-sm text-muted-foreground">
                {concert.artist}
              </p>
              <p className="mt-2 text-sm font-semibold">
                Seats: {selectedSeats.map(s => s.seatId).join(", ")}
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="w-full"
              >
                Cancel
              </Button>

              <Button
                onClick={handlePayment}
                disabled={isLoading}
                className="w-full"
              >
                Pay ₹{totalAmount.toFixed(2)}
              </Button>
            </div>
          </div>
        )}

        {/* PROCESSING */}
        {step === "processing" && (
          <div className="flex flex-col items-center gap-3 py-6">
            <Loader2 className="h-12 w-12 animate-spin" />
            <p className="text-sm text-muted-foreground">
              Processing payment…
            </p>
          </div>
        )}

        {/* SUCCESS */}
        {step === "success" && (
          <div className="flex flex-col items-center gap-3 py-6">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
            <p className="font-medium">Payment successful!</p>
          </div>
        )}

        {/* ERROR */}
        {step === "error" && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <p className="text-sm text-muted-foreground">
              {errorMessage}
            </p>

            <Button onClick={handleRetry}>
              Try Again
            </Button>
          </div>
        )}

      </DialogContent>
    </Dialog>
  )
}

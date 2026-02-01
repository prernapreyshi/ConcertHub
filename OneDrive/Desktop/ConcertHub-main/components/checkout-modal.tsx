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
import { Loader2, Clock, CheckCircle2, AlertCircle } from "lucide-react"
import type { Booking } from "@/lib/booking-context"

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
    lockSeats,
    unlockSeats,
    processPayment,
    isLoading,
  } = useBooking()

  if (!concert) return null

  const [step, setStep] = useState<
    "confirm" | "processing" | "success" | "error"
  >("confirm")
  const [timeLeft, setTimeLeft] = useState(300)
  const [errorMessage, setErrorMessage] = useState("")

  const totalAmount = selectedSeats.length * concert.price

  const handleDialogChange = (isOpen: boolean) => {
    if (!isOpen) unlockSeats()
    onOpenChange(isOpen)
  }

  useEffect(() => {
    if (open && step === "confirm") lockSeats()
  }, [open, step, lockSeats])

  useEffect(() => {
    if (!open || step !== "confirm") return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          unlockSeats()
          onOpenChange(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [open, step, unlockSeats, onOpenChange])

  useEffect(() => {
    if (!open) {
      setStep("confirm")
      setTimeLeft(300)
      setErrorMessage("")
    }
  }, [open])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handlePayment = async () => {
    setStep("processing")

    try {
      await new Promise((r) => setTimeout(r, 1500))
      const booking = await processPayment()

      if (booking) {
        setStep("success")
        setTimeout(() => {
          onPaymentSuccess(booking)
          onOpenChange(false)
        }, 1500)
      } else {
        setStep("error")
        setErrorMessage("Payment failed.")
      }
    } catch {
      setStep("error")
      setErrorMessage("Unexpected error occurred.")
    }
  }

  const handleCancel = () => {
    unlockSeats()
    onOpenChange(false)
  }

  const handleRetry = () => {
    setStep("confirm")
    setErrorMessage("")
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      {/* ✅ Responsive modal container */}
      <DialogContent className="w-[95vw] max-w-lg rounded-xl p-6 space-y-6">

        {step === "confirm" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl sm:text-2xl">
                Checkout
              </DialogTitle>
              <DialogDescription>
                Complete your booking for {concert.name}
              </DialogDescription>
            </DialogHeader>

            {/* Timer */}
            <div className="flex items-center gap-3 rounded-lg bg-accent/50 p-3">
              <Clock className="h-5 w-5 text-primary" />
              <p className="text-lg font-bold">{formatTime(timeLeft)}</p>
            </div>

            {/* Concert info */}
            <div className="rounded-lg border p-4">
              <p className="font-medium">{concert.name}</p>
              <p className="text-sm text-muted-foreground">
                {concert.artist}
              </p>
            </div>

            {/* Buttons stack on mobile */}
            <div className="flex flex-col gap-3 sm:flex-row">
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
          </>
        )}

        {step === "processing" && (
          <div className="flex flex-col items-center gap-4 py-6">
            <Loader2 className="h-14 w-14 animate-spin" />
            <p className="text-muted-foreground">Processing payment…</p>
          </div>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center gap-4 py-6">
            <CheckCircle2 className="h-14 w-14 text-green-600" />
            <p className="font-medium">Payment successful!</p>
          </div>
        )}

        {step === "error" && (
          <div className="flex flex-col items-center gap-4 py-6">
            <AlertCircle className="h-14 w-14 text-destructive" />
            <p className="text-center text-sm">{errorMessage}</p>
            <Button onClick={handleRetry} className="w-full">
              Try Again
            </Button>
          </div>
        )}

      </DialogContent>
    </Dialog>
  )
}

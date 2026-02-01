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
import { Separator } from "@/components/ui/separator"
import {
  Loader2,
  Clock,
  CreditCard,
  Shield,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
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
    user,
    concert,
    selectedSeats,
    lockSeats,
    unlockSeats,
    processPayment,
    isLoading,
  } = useBooking()

  // ✅ CRITICAL GUARD (FIXES THE CRASH)
  if (!concert) {
    return null
  }

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
          setTimeout(() => {
  unlockSeats()
}, 0)

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
        setErrorMessage("Payment processing failed.")
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
      <DialogContent className="sm:max-w-[500px]">
        {step === "confirm" && (
          <>
            <DialogHeader>
              <DialogTitle>Checkout</DialogTitle>
              <DialogDescription>
                Complete your booking for {concert.name}
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center gap-3 rounded-lg bg-accent/50 p-3">
              <Clock className="h-5 w-5 text-primary" />
              <p className="text-xl font-bold">
                {formatTime(timeLeft)}
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <p className="font-medium">{concert.name}</p>
              <p className="text-sm text-muted-foreground">
                {concert.artist}
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handlePayment} disabled={isLoading}>
                Pay ₹{totalAmount.toFixed(2)}
              </Button>
            </div>
          </>
        )}

        {step === "processing" && (
          <Loader2 className="mx-auto h-16 w-16 animate-spin" />
        )}

        {step === "success" && (
          <CheckCircle2 className="mx-auto h-14 w-14 text-green-600" />
        )}

        {step === "error" && (
          <>
            <AlertCircle className="mx-auto h-14 w-14 text-destructive" />
            <Button onClick={handleRetry}>Try Again</Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

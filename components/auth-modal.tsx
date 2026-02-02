"use client"

import React, { useState, useEffect } from "react"
import { useBooking } from "@/lib/booking-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Mail, Lock, User } from "lucide-react"

/* ================= GLOBAL OPEN FUNCTION ================= */

export const openAuthModal = () => {
  window.dispatchEvent(new Event("open-auth"))
}

/* ================= MODAL ================= */

export function AuthModal() {
  const { login, register, isLoading } = useBooking()

  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"login" | "register">("login")
  const [error, setError] = useState<string | null>(null)

  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  const [registerName, setRegisterName] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("")

  /* ✅ listen for global open event */

  useEffect(() => {
    const handler = () => setOpen(true)
    window.addEventListener("open-auth", handler)
    return () => window.removeEventListener("open-auth", handler)
  }, [])

  const resetForms = () => {
    setLoginEmail("")
    setLoginPassword("")
    setRegisterName("")
    setRegisterEmail("")
    setRegisterPassword("")
    setRegisterConfirmPassword("")
    setError(null)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!loginEmail || !loginPassword) {
      setError("Please fill in all fields")
      return
    }

    const success = await login(loginEmail, loginPassword)

    if (success) {
      setOpen(false)
      resetForms()
    } else {
      setError("Invalid email or password. Please register first.")
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!registerName || !registerEmail || !registerPassword) {
      setError("Please fill in all fields")
      return
    }

    if (registerPassword !== registerConfirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (registerPassword.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    const success = await register(
      registerEmail,
      registerPassword,
      registerName
    )

    if (success) {
      setOpen(false)
      resetForms()
    } else {
      setError("Email already registered. Please login.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto rounded-xl p-4 sm:p-6">

        <DialogHeader>
          <DialogTitle className="text-lg sm:text-2xl font-semibold">
            Welcome to ConcertHub
          </DialogTitle>

          <DialogDescription className="text-sm">
            Sign in or create an account to book tickets
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => {
            setActiveTab(v as "login" | "register")
            setError(null)
          }}
          className="mt-4"
        >
          <TabsList className="grid w-full grid-cols-2 h-10">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          {/* LOGIN */}

          <TabsContent value="login" className="mt-5">
            <form onSubmit={handleLogin} className="space-y-4">

              <Field
                label="Email"
                icon={<Mail className="icon" />}
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={loginEmail}
                onChange={setLoginEmail}
                disabled={isLoading}
              />

              <Field
                label="Password"
                icon={<Lock className="icon" />}
                id="login-password"
                type="password"
                placeholder="Enter your password"
                value={loginPassword}
                onChange={setLoginPassword}
                disabled={isLoading}
              />

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : "Sign In"}
              </Button>
            </form>
          </TabsContent>

          {/* REGISTER */}

          <TabsContent value="register" className="mt-5">
            <form onSubmit={handleRegister} className="space-y-4">

              <Field label="Full Name" icon={<User />} id="name" type="text"
                placeholder="John Doe" value={registerName}
                onChange={setRegisterName} disabled={isLoading} />

              <Field label="Email" icon={<Mail />} id="email" type="email"
                placeholder="you@example.com" value={registerEmail}
                onChange={setRegisterEmail} disabled={isLoading} />

              <Field label="Password" icon={<Lock />} id="pass" type="password"
                placeholder="Create password" value={registerPassword}
                onChange={setRegisterPassword} disabled={isLoading} />

              <Field label="Confirm Password" icon={<Lock />} id="confirm" type="password"
                placeholder="Confirm password" value={registerConfirmPassword}
                onChange={setRegisterConfirmPassword} disabled={isLoading} />

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

/* REUSABLE FIELD */

function Field({ label, icon, id, type, placeholder, value, onChange, disabled }: any) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>

      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </div>

        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          className="pl-10"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import { KeyRound, AlertCircle } from "lucide-react"

type ChangePasswordDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const resetForm = () => {
    setFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
    setError("")
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm()
    }
    onOpenChange(open)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate current password (dummy: admin123)
    if (formData.currentPassword !== "admin123") {
      setError("Current password is incorrect")
      return
    }

    // Validate new password match
    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match")
      return
    }

    // Validate new password length
    if (formData.newPassword.length < 6) {
      setError("New password must be at least 6 characters")
      return
    }

    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))
    
    toast.success("Password changed successfully")
    setIsLoading(false)
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="rounded-2xl border-border/70 sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100">
            <KeyRound className="h-7 w-7 text-primary" />
          </div>
          <DialogTitle className="text-center">Change Password</DialogTitle>
          <DialogDescription className="text-center">
            Enter your current password and choose a new one
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-sm font-medium">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                placeholder="Enter current password"
                required
                className="lpi-input h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-sm font-medium">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                placeholder="Enter new password"
                required
                className="lpi-input h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
                required
                className="lpi-input h-11"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="rounded-xl bg-primary shadow-lg shadow-blue-700/20 hover:bg-primary/90"
            >
              {isLoading && <Spinner className="mr-2" />}
              Change Password
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Spinner } from "@/components/ui/spinner"
import { AlertTriangle } from "lucide-react"
import type { AdminUser } from "@/lib/users-data"

type DeleteUserDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: AdminUser | null
  onConfirm: () => void | Promise<void>
}

export function DeleteUserDialog({ open, onOpenChange, user, onConfirm }: DeleteUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } catch {
      // Parent shows the error toast; keep the dialog open.
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md rounded-2xl">
        <AlertDialogHeader>
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10">
            <AlertTriangle className="h-7 w-7 text-destructive" />
          </div>
          <AlertDialogTitle className="text-center">Delete User</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Are you sure you want to delete <span className="font-semibold text-foreground">{user?.name}</span>?
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:justify-center">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
            className="rounded-xl"
          >
            {isLoading && <Spinner className="mr-2" />}
            Delete User
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

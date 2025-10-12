
"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { Alert, AlertDescription, AlertTitle } from "./alert"
import { CheckCircle, Info, XCircle } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  const getIcon = (variant?: 'default' | 'destructive' | 'success') => {
    switch (variant) {
      case 'destructive':
        return <XCircle className="h-5 w-5" />;
      case 'success':
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  }

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast key={id} {...props} variant={variant} className="p-0 border-0 bg-transparent shadow-none">
            <Alert variant={variant} className="w-full">
               {getIcon(variant)}
              <AlertTitle>{title}</AlertTitle>
              {description && <AlertDescription>{description}</AlertDescription>}
            </Alert>
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}

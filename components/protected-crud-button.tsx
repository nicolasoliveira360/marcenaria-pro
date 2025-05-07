"use client"

import React from "react"
import { Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCrudGuard } from "@/contexts/crud-guard-provider"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"
import { getPremiumButtonText } from "@/lib/premium"

interface ProtectedCrudButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClickAction: () => void
  fallbackText?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  icon?: React.ReactNode
  children: React.ReactNode
  showTooltip?: boolean
}

export function ProtectedCrudButton({
  onClickAction,
  fallbackText,
  variant = "default",
  size = "default",
  icon,
  children,
  className,
  showTooltip = true,
  ...props
}: ProtectedCrudButtonProps) {
  const { executeCrudOperation, canPerformCrud } = useCrudGuard()

  const handleClick = () => {
    executeCrudOperation(onClickAction)
  }

  const buttonContent = canPerformCrud ? (
    <>
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </>
  ) : (
    <>
      <Lock className="mr-2 h-4 w-4" />
      {fallbackText || getPremiumButtonText(children?.toString() || "")}
    </>
  )

  if (!canPerformCrud && showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={variant}
              size={size}
              onClick={handleClick}
              disabled={!canPerformCrud}
              className={cn(
                !canPerformCrud && "opacity-70 cursor-not-allowed",
                className
              )}
              {...props}
            >
              {buttonContent}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Recurso disponível apenas para planos pagos</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={!canPerformCrud}
      className={cn(
        !canPerformCrud && "opacity-70 cursor-not-allowed",
        className
      )}
      {...props}
    >
      {buttonContent}
    </Button>
  )
} 
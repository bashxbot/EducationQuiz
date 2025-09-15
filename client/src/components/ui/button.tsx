
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden uppercase tracking-wide font-heading",
  {
    variants: {
      variant: {
        default: "neon-button",
        destructive:
          "bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] hover:scale-105",
        outline:
          "border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] hover:scale-105",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-[0_0_15px_rgba(26,26,46,0.5)] hover:scale-105",
        ghost: "hover:bg-accent/10 hover:text-accent hover:shadow-[0_0_15px_rgba(255,0,128,0.2)] hover:scale-105",
        link: "text-primary underline-offset-4 hover:underline hover:shadow-[0_0_10px_rgba(0,255,136,0.3)]",
        accent: "bg-gradient-to-r from-accent to-pink-500 text-white hover:shadow-[0_0_20px_rgba(255,0,128,0.5)] hover:scale-105",
        cyberpunk: "bg-gradient-to-r from-blue-500 to-cyan-400 text-white hover:shadow-[0_0_20px_rgba(0,212,255,0.5)] hover:scale-105",
      },
      size: {
        default: "h-11 px-6 py-3",
        sm: "h-9 rounded-md px-4",
        lg: "h-13 rounded-lg px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

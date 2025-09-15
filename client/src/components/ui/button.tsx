
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 font-display tracking-wide",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-purple-500 via-purple-600 to-blue-600 text-white shadow-2xl hover:shadow-purple-500/25 hover:scale-105 active:scale-95 relative overflow-hidden group",
        destructive: "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-2xl hover:shadow-red-500/25 hover:scale-105 active:scale-95",
        outline: "border-2 border-white/20 bg-white/10 backdrop-blur-xl text-white hover:bg-white/20 hover:border-white/40 hover:scale-105 active:scale-95 shadow-lg",
        secondary: "bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-lg hover:shadow-slate-500/25 hover:scale-105 active:scale-95",
        ghost: "text-white hover:bg-white/10 hover:scale-105 active:scale-95 rounded-full",
        link: "text-purple-400 underline-offset-4 hover:underline hover:text-purple-300 transition-colors",
        glass: "bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 hover:border-white/40 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95",
        neon: "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-2xl hover:shadow-purple-500/50 hover:scale-105 active:scale-95 relative overflow-hidden group border-0",
        success: "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-2xl hover:shadow-green-500/25 hover:scale-105 active:scale-95",
        warning: "bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-2xl hover:shadow-yellow-500/25 hover:scale-105 active:scale-95",
        info: "bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-2xl hover:shadow-blue-500/25 hover:scale-105 active:scale-95",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 rounded-xl px-4 text-xs",
        lg: "h-14 rounded-2xl px-8 text-base",
        xl: "h-16 rounded-3xl px-10 text-lg",
        icon: "h-12 w-12 rounded-full",
        "icon-sm": "h-10 w-10 rounded-full",
        "icon-lg": "h-14 w-14 rounded-full",
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

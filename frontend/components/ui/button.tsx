import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
          variant === "primary" && "bg-accent text-accent-foreground hover:opacity-90",
          variant === "secondary" && "border border-border bg-card hover:bg-muted",
          variant === "ghost" && "hover:bg-muted",
          variant === "danger" && "bg-red-600 text-white hover:bg-red-700",
          size === "sm" && "px-3 py-1.5 text-sm",
          size === "md" && "px-5 py-2.5 text-sm",
          size === "lg" && "px-7 py-3.5 text-base",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

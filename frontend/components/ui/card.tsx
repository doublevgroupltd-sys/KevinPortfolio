import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div className={cn("rounded-xl2 border border-border bg-card p-6", className)} {...props}>
      {children}
    </div>
  );
}

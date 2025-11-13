import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "critical" | "info" | "outline";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
        {
          "bg-gray-100 text-gray-800": variant === "default",
          "bg-success-100 text-success-800": variant === "success",
          "bg-warning-100 text-warning-800": variant === "warning",
          "bg-critical-100 text-critical-800": variant === "critical",
          "bg-primary-100 text-primary-800": variant === "info",
          "border border-gray-300 text-gray-700": variant === "outline",
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };

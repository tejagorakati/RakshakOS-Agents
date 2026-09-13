import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2.5 py-0.5 font-sans text-xs font-semibold tracking-wide transition-colors border",
  {
    variants: {
      variant: {
        default:
          "border-slate-300 bg-slate-100 text-slate-800",
        critical:
          "border-rose-200 bg-rose-50 text-rose-700",
        warning:
          "border-amber-200 bg-amber-50 text-amber-800",
        success:
          "border-emerald-200 bg-emerald-50 text-emerald-800",
        info:
          "border-sky-200 bg-sky-50 text-sky-800",
        outline:
          "border-slate-300 bg-white text-slate-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

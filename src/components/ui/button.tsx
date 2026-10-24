import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Same API as the shadcn/ui Button, so `npx shadcn add button` can replace it later.
const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-neutral-950 text-white hover:bg-neutral-800 disabled:bg-neutral-400",
        outline: "border border-neutral-300 bg-transparent text-neutral-900 hover:bg-neutral-100",
        ghost: "text-neutral-900 hover:bg-neutral-100",
      },
      size: {
        default: "h-10 px-4 text-sm",
        sm: "h-7 px-2.5 text-xs",
        lg: "h-12 px-6 text-sm",
        icon: "size-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

function Button({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { Button, buttonVariants };

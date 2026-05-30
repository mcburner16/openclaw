import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          // text-base = 16px — prevents iOS Safari from auto-zooming on focus
"flex min-h-[100px] w-full rounded-md border border-[#2a2a2a] bg-[#1e1e1e] px-3 py-3 text-base text-white shadow-sm placeholder:text-gray-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-600 focus-visible:border-red-600 disabled:cursor-not-allowed disabled:opacity-50 resize-none",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };

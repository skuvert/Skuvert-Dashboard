import { HTMLAttributes } from "react";

export function Pill({ className = "", ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${className}`}
      {...props}
    />
  );
}

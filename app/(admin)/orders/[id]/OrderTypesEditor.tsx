"use client";

import { useState, useTransition } from "react";
import { updateOrderTypes } from "@/lib/actions/orders";
import { ORDER_TYPES } from "@/lib/order-types";

export function OrderTypesEditor({ orderId, initial }: { orderId: string; initial: string[] }) {
  const [types, setTypes] = useState<string[]>(initial);
  const [pending, startTransition] = useTransition();

  function toggle(id: string) {
    const next = types.includes(id) ? types.filter((t) => t !== id) : [...types, id];
    setTypes(next);
    startTransition(() => updateOrderTypes(orderId, next));
  }

  return (
    <div className="flex flex-wrap gap-2">
      {ORDER_TYPES.map((type) => {
        const active = types.includes(type.id);
        return (
          <button
            key={type.id}
            type="button"
            disabled={pending}
            onClick={() => toggle(type.id)}
            className={`rounded-full border-2 px-4 py-2 text-sm font-semibold transition-colors ${
              active ? "border-accent bg-accent/10 text-accent" : "border-border bg-white text-ink"
            }`}
          >
            {type.emoji} {type.label}
          </button>
        );
      })}
    </div>
  );
}

"use client";

import { useTransition } from "react";
import { deleteOrder } from "@/lib/actions/orders";

export function DeleteOrderButton({ orderId }: { orderId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm("Auftrag endgültig löschen? Das kann nicht rückgängig gemacht werden.")) {
          startTransition(() => deleteOrder(orderId));
        }
      }}
      className="text-sm font-semibold text-red-600 hover:underline disabled:opacity-50"
    >
      {pending ? "Löscht…" : "Auftrag löschen"}
    </button>
  );
}

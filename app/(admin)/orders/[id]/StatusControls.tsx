"use client";

import { useTransition } from "react";
import { updateInternalStatus } from "@/lib/actions/orders";
import {
  INTERNAL_STATUS_ORDER,
  INTERNAL_STATUS_LABEL,
  CUSTOMER_STATUS_LABEL,
  INTERNAL_TO_CUSTOMER_STATUS,
} from "@/lib/status";
import type { InternalStatus } from "@prisma/client";
import { labelClasses } from "@/components/ui/field";

export function StatusControls({
  orderId,
  internalStatus,
}: {
  orderId: string;
  internalStatus: InternalStatus;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div>
      <label className={labelClasses}>Status</label>
      <select
        defaultValue={internalStatus}
        disabled={pending}
        onChange={(e) =>
          startTransition(() => updateInternalStatus(orderId, e.target.value as InternalStatus))
        }
        className="w-full rounded-xl border-2 border-border bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-accent"
      >
        {INTERNAL_STATUS_ORDER.map((s) => (
          <option key={s} value={s}>
            {INTERNAL_STATUS_LABEL[s]}
          </option>
        ))}
      </select>
      <p className="mt-2 text-xs text-muted">
        Kunde sieht: {CUSTOMER_STATUS_LABEL[INTERNAL_TO_CUSTOMER_STATUS[internalStatus]]}
      </p>
    </div>
  );
}

"use client";

import { useTransition } from "react";
import { updateInternalStatus, updateCustomerStatus } from "@/lib/actions/orders";
import {
  INTERNAL_STATUS_ORDER,
  INTERNAL_STATUS_LABEL,
  CUSTOMER_STATUS_ORDER,
  CUSTOMER_STATUS_LABEL,
} from "@/lib/status";
import type { InternalStatus, CustomerStatus } from "@prisma/client";
import { labelClasses } from "@/components/ui/field";

export function StatusControls({
  orderId,
  internalStatus,
  customerStatus,
}: {
  orderId: string;
  internalStatus: InternalStatus;
  customerStatus: CustomerStatus;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label className={labelClasses}>Interner Status</label>
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
      </div>
      <div>
        <label className={labelClasses}>Kunden-Status (öffentlich sichtbar)</label>
        <select
          defaultValue={customerStatus}
          disabled={pending}
          onChange={(e) =>
            startTransition(() => updateCustomerStatus(orderId, e.target.value as CustomerStatus))
          }
          className="w-full rounded-xl border-2 border-border bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-accent"
        >
          {CUSTOMER_STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {CUSTOMER_STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

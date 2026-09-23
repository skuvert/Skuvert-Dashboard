import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CUSTOMER_STATUS_ORDER, CUSTOMER_STATUS_LABEL } from "@/lib/status";

export const dynamic = "force-dynamic";

export default async function TrackingPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const order = await prisma.order.findUnique({ where: { trackingToken: token } });
  if (!order) notFound();

  const cancelled = order.internalStatus === "STORNIERT";
  const currentIndex = CUSTOMER_STATUS_ORDER.indexOf(order.customerStatus);
  const firstName = order.customerName.trim().split(/\s+/)[0] || order.customerName;

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Skuvert" width={44} height={44} />
          <p className="text-xs font-bold uppercase tracking-widest text-accent">
            Skuvert, Custom 3D Service
          </p>
          <h1 className="text-xl font-extrabold text-ink">Hoi {firstName} 👋</h1>
          <p className="text-sm text-muted">Auftrag {order.orderNumber}</p>
        </div>

        {order.customerNote?.trim() && (
          <p className="mb-6 whitespace-pre-line rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 text-center text-sm font-semibold text-ink">
            {order.customerNote.trim()}
          </p>
        )}

        {cancelled ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-center text-sm font-semibold text-red-600">
            Dieser Auftrag wurde storniert. Bei Fragen melde dich gerne bei uns.
          </p>
        ) : (
          <ol>
            {CUSTOMER_STATUS_ORDER.map((status, i) => {
              const done = i < currentIndex;
              const current = i === currentIndex;
              const isLast = i === CUSTOMER_STATUS_ORDER.length - 1;
              return (
                <li key={status} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                        done || current ? "bg-accent text-white" : "bg-border text-muted"
                      }`}
                    >
                      {done ? "✓" : i + 1}
                    </span>
                    {!isLast && (
                      <span className={`min-h-[24px] w-0.5 flex-1 ${done ? "bg-accent" : "bg-border"}`} />
                    )}
                  </div>
                  <div className={isLast ? "pb-1" : "pb-7"}>
                    <p
                      className={`text-sm font-semibold ${
                        current ? "text-accent" : done ? "text-ink" : "text-muted"
                      }`}
                    >
                      {CUSTOMER_STATUS_LABEL[status]}
                    </p>
                    {current && <p className="text-xs text-muted">Aktueller Stand</p>}
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        <p className="mt-4 text-center text-xs text-muted">
          Fragen zu deiner Bestellung? Melde dich einfach bei Skuvert.
        </p>
      </div>
    </div>
  );
}

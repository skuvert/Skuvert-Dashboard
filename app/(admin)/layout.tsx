import Link from "next/link";
import { AdminNav } from "@/components/AdminNav";
import { logout } from "@/lib/actions/auth";
import { buttonClasses } from "@/components/ui/Button";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header
        id="admin-nav"
        className="sticky top-0 z-10 border-b border-border bg-white/90 backdrop-blur"
      >
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Skuvert" width={28} height={28} />
            <span className="text-sm font-extrabold tracking-wide text-ink">SKUVERT</span>
          </Link>
          <AdminNav />
          <form action={logout}>
            <button type="submit" className={buttonClasses("ghost")}>
              Abmelden
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}

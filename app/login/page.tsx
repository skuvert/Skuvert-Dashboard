import { Card } from "@/components/ui/Card";
import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <Card className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-2 mb-6 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Skuvert" width={40} height={40} className="mb-1" />
          <p className="text-xs font-bold uppercase tracking-widest text-accent">
            Skuvert Dashboard
          </p>
          <h1 className="text-xl font-extrabold text-ink">Anmelden</h1>
        </div>
        <LoginForm next={next ?? "/"} />
      </Card>
    </div>
  );
}

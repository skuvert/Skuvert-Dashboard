"use client";

import { useActionState } from "react";
import { login } from "./actions";
import { inputClasses, labelClasses } from "@/components/ui/field";
import { Button } from "@/components/ui/Button";

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(login, {});

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="password" className={labelClasses}>
          Passwort
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoFocus
          required
          className={`${inputClasses} w-full`}
        />
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Anmelden…" : "Anmelden"}
      </Button>
    </form>
  );
}

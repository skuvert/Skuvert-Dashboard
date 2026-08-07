"use client";

import { useState } from "react";
import { Button, ButtonVariant } from "@/components/ui/Button";

export function CopyButton({
  text,
  label = "Kopieren",
  variant = "secondary",
}: {
  text: string;
  label?: string;
  variant?: ButtonVariant;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <Button
      type="button"
      variant={variant}
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? "Kopiert!" : label}
    </Button>
  );
}

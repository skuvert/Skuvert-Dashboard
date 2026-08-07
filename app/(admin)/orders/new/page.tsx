import { Card } from "@/components/ui/Card";
import { NewOrderForm } from "./NewOrderForm";

export default function NewOrderPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-extrabold text-ink">Neue Anfrage erfassen</h1>
      <Card>
        <NewOrderForm />
      </Card>
    </div>
  );
}

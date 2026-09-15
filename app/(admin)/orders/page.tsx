import { redirect } from "next/navigation";

// /orders hat keine eigene Seite — die Auftragsliste ist die Übersicht auf "/".
export default function OrdersIndex() {
  redirect("/");
}

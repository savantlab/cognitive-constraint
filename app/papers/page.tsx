import { redirect } from "next/navigation";

export default function PapersPage() {
  // Temporarily redirect to home - no papers published yet
  redirect("/");
}

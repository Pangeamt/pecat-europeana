import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}

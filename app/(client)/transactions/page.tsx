import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { TransactionForms } from "./TransactionForms";

export default async function TransactionsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const accounts = await prisma.bankAccount.findMany({
    where: { userId: session.user.id, isBlocked: false },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <Topbar title="Opérations bancaires" />
      <div className="flex-1 p-8">
        <h1
          className="text-2xl font-bold mb-2"
          style={{ fontFamily: "'Cormorant Garant', serif", color: "#0f1f4b" }}
        >
          Opérations bancaires
        </h1>
        <p className="text-sm mb-8" style={{ color: "#6b7280" }}>
          Effectuez des dépôts, retraits ou virements sur vos comptes
        </p>
        <TransactionForms accounts={accounts} />
      </div>
    </div>
  );
}

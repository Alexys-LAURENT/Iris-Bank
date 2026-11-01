import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import { formatIBAN } from "@/lib/iban";
import { ACCOUNT_TYPE_LABELS, TRANSACTION_TYPE_LABELS } from "@/types";
import { Topbar } from "@/components/layout/Topbar";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight, Plus } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const user = session.user as typeof session.user & {
    firstname?: string;
    lastname?: string;
    isAdmin?: boolean;
  };

  const bankAccounts = await prisma.bankAccount.findMany({
    where: { userId: user.id },
    include: {
      sentTransactions: { orderBy: { createdAt: "desc" }, take: 5 },
      receivedTransactions: { orderBy: { createdAt: "desc" }, take: 5 },
    },
    orderBy: { createdAt: "asc" },
  });

  const totalBalance = bankAccounts.reduce((sum: number, a: { balance: number }) => sum + a.balance, 0);

  // Last 5 transactions across all accounts
  const recentTransactions = await prisma.transaction.findMany({
    where: {
      OR: [
        { fromAccount: { userId: user.id } },
        { toAccount: { userId: user.id } },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      fromAccount: true,
      toAccount: true,
    },
  });

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <Topbar title="Tableau de bord" />

      <div className="flex-1 p-8 space-y-8">
        {/* Welcome + total */}
        <div className="flex items-start justify-between">
          <div>
            <h1
              className="text-3xl font-bold"
              style={{ fontFamily: "'Cormorant Garant', serif", color: "#0f1f4b" }}
            >
              Bonjour, {user.firstname ?? user.name?.split(" ")[0]} 👋
            </h1>
            <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
              Bienvenue sur votre espace personnel IrisBank
            </p>
          </div>
          <div
            className="text-right px-6 py-4 rounded-xl"
            style={{ background: "linear-gradient(135deg, #0f1f4b, #1e3a8a)", color: "white" }}
          >
            <p className="text-xs tracking-widest uppercase opacity-70">Patrimoine total</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(totalBalance)}</p>
          </div>
        </div>

        {/* Accounts grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold" style={{ color: "#0f1f4b" }}>
              Mes comptes
            </h2>
            <Link
              href="/accounts/new"
              className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              style={{ background: "#eef2ff", color: "#1e3a8a" }}
            >
              <Plus size={14} />
              Nouveau compte
            </Link>
          </div>

          {bankAccounts.length === 0 ? (
            <div
              className="text-center py-12 rounded-xl border-2 border-dashed"
              style={{ borderColor: "#e5e7eb", color: "#9ca3af" }}
            >
              <p className="text-sm">Aucun compte bancaire. Créez votre premier compte.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {bankAccounts.map((account: typeof bankAccounts[number]) => (
                <Link
                  key={account.id}
                  href={`/accounts/${account.id}`}
                  className="block p-6 rounded-xl border transition-all hover:shadow-md"
                  style={{
                    background: "white",
                    borderColor: account.isBlocked ? "#fca5a5" : "#f0f0f0",
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#c9a84c" }}>
                        {ACCOUNT_TYPE_LABELS[account.type as keyof typeof ACCOUNT_TYPE_LABELS]}
                      </p>
                      <p className="text-xs mt-1 font-mono" style={{ color: "#9ca3af" }}>
                        {formatIBAN(account.iban)}
                      </p>
                    </div>
                    {account.isBlocked && (
                      <Badge variant="destructive" className="text-xs">Bloqué</Badge>
                    )}
                  </div>
                  <p className="text-2xl font-bold" style={{ color: "#0f1f4b" }}>
                    {formatCurrency(account.balance)}
                  </p>
                  <p className="text-xs mt-2" style={{ color: "#9ca3af" }}>
                    Ouvert le {formatDate(account.createdAt)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Recent transactions */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold" style={{ color: "#0f1f4b" }}>
              Dernières opérations
            </h2>
            <Link href="/history" className="text-sm font-medium" style={{ color: "#1e3a8a" }}>
              Voir tout →
            </Link>
          </div>

          <div className="rounded-xl border overflow-hidden" style={{ background: "white", borderColor: "#f0f0f0" }}>
            {recentTransactions.length === 0 ? (
              <p className="text-center py-8 text-sm" style={{ color: "#9ca3af" }}>
                Aucune opération récente
              </p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
                    {["Type", "Description", "Compte", "Date", "Montant"].map((h) => (
                      <th
                        key={h}
                        className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide"
                        style={{ color: "#9ca3af" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((tx: typeof recentTransactions[number]) => {
                    const isCredit = tx.toAccount?.userId === user.id && tx.type !== "WITHDRAWAL";
                    return (
                      <tr key={tx.id} className="border-t hover:bg-gray-50 transition-colors" style={{ borderColor: "#f9f9f9" }}>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${isCredit ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                            {isCredit ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}
                            {TRANSACTION_TYPE_LABELS[tx.type as keyof typeof TRANSACTION_TYPE_LABELS]}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm" style={{ color: "#374151" }}>
                          {tx.description ?? "—"}
                        </td>
                        <td className="px-5 py-4 text-xs font-mono" style={{ color: "#9ca3af" }}>
                          {(isCredit ? tx.toAccount?.iban : tx.fromAccount?.iban)?.slice(-8) ?? "—"}
                        </td>
                        <td className="px-5 py-4 text-sm" style={{ color: "#9ca3af" }}>
                          {formatDate(tx.createdAt)}
                        </td>
                        <td className={`px-5 py-4 text-sm font-semibold ${isCredit ? "text-green-600" : "text-red-600"}`}>
                          {isCredit ? "+" : "-"}{formatCurrency(tx.amount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

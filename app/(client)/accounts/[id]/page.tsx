import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { formatIBAN } from "@/lib/iban";
import { ACCOUNT_TYPE_LABELS, TRANSACTION_TYPE_LABELS } from "@/types";
import { Topbar } from "@/components/layout/Topbar";
import { Badge } from "@/components/ui/badge";
import { DeleteAccountButton } from "./DeleteAccountButton";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AccountDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const account = await prisma.bankAccount.findFirst({
    where: { id, userId: session.user.id },
    include: {
      sentTransactions: {
        include: { toAccount: true },
        orderBy: { createdAt: "desc" },
      },
      receivedTransactions: {
        include: { fromAccount: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!account) notFound();

  // Merge and sort all transactions
  const allTransactions = [
    ...account.sentTransactions.map((tx: typeof account.sentTransactions[number]) => ({ ...tx, isDebit: true })),
    ...account.receivedTransactions.map((tx: typeof account.receivedTransactions[number]) => ({ ...tx, isDebit: false })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <Topbar title={ACCOUNT_TYPE_LABELS[account.type as keyof typeof ACCOUNT_TYPE_LABELS]} />

      <div className="flex-1 p-8 space-y-6">
        {/* Account card */}
        <div
          className="rounded-2xl p-8 text-white relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0f1f4b 0%, #1e40af 100%)" }}
        >
          <svg className="absolute right-0 top-0 opacity-10 h-full" viewBox="0 0 300 200">
            {[0, 30, 60, 90, 120].map((r, i) => (
              <ellipse key={i} cx="150" cy="100" rx="130" ry="50" fill="none" stroke="white" strokeWidth="1" transform={`rotate(${r} 150 100)`} />
            ))}
          </svg>

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-8">
              <div>
                <p className="text-xs tracking-widest uppercase opacity-70">
                  {ACCOUNT_TYPE_LABELS[account.type as keyof typeof ACCOUNT_TYPE_LABELS]}
                </p>
                {account.isBlocked && (
                  <Badge variant="destructive" className="mt-1">Compte bloqué</Badge>
                )}
              </div>
              <span className="text-3xl">🌸</span>
            </div>
            <p className="text-3xl font-bold mb-6">{formatCurrency(account.balance)}</p>
            <p className="text-sm font-mono tracking-widest opacity-80">{formatIBAN(account.iban)}</p>
            <p className="text-xs opacity-50 mt-1">Ouvert le {formatDate(account.createdAt)}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 flex-wrap">
          <Link
            href="/transactions"
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #0f1f4b, #1e3a8a)" }}
          >
            Faire une opération
          </Link>
          {!account.isBlocked && account.balance === 0 && (
            <DeleteAccountButton accountId={account.id} />
          )}
        </div>

        {/* Transaction history */}
        <section>
          <h2 className="text-lg font-semibold mb-4" style={{ color: "#0f1f4b" }}>
            Historique des transactions
          </h2>

          <div className="rounded-xl border overflow-hidden bg-white" style={{ borderColor: "#f0f0f0" }}>
            {allTransactions.length === 0 ? (
              <p className="text-center py-10 text-sm" style={{ color: "#9ca3af" }}>
                Aucune transaction sur ce compte
              </p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
                    {["Type", "Description", "Date", "Montant"].map((h) => (
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
                  {allTransactions.map((tx) => (
                    <tr key={tx.id} className="border-t hover:bg-gray-50" style={{ borderColor: "#f9f9f9" }}>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${!tx.isDebit ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                          {!tx.isDebit ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}
                          {TRANSACTION_TYPE_LABELS[tx.type as keyof typeof TRANSACTION_TYPE_LABELS]}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm" style={{ color: "#374151" }}>
                        {tx.description ?? "—"}
                      </td>
                      <td className="px-5 py-4 text-sm" style={{ color: "#9ca3af" }}>
                        {formatDateTime(tx.createdAt)}
                      </td>
                      <td className={`px-5 py-4 text-sm font-semibold ${!tx.isDebit ? "text-green-600" : "text-red-600"}`}>
                        {!tx.isDebit ? "+" : "-"}{formatCurrency(tx.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

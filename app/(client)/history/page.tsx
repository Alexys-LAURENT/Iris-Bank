import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { TRANSACTION_TYPE_LABELS } from "@/types";
import { Topbar } from "@/components/layout/Topbar";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default async function HistoryPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const user = session.user as typeof session.user & { isAdmin?: boolean };

  const transactions = await prisma.transaction.findMany({
    where: {
      OR: [
        { fromAccount: { userId: user.id } },
        { toAccount: { userId: user.id } },
      ],
    },
    orderBy: { createdAt: "desc" },
    include: {
      fromAccount: true,
      toAccount: true,
    },
  });

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <Topbar title="Historique" />

      <div className="flex-1 p-8">
        <div className="mb-6">
          <h1
            className="text-3xl font-bold"
            style={{ fontFamily: "'Cormorant Garant', serif", color: "#0f1f4b" }}
          >
            Historique des opérations
          </h1>
          <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
            {transactions.length} opération{transactions.length !== 1 ? "s" : ""} au total
          </p>
        </div>

        <div className="rounded-xl border overflow-hidden" style={{ background: "white", borderColor: "#f0f0f0" }}>
          {transactions.length === 0 ? (
            <p className="text-center py-12 text-sm" style={{ color: "#9ca3af" }}>
              Aucune opération enregistrée
            </p>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
                  {["Type", "Description", "Compte", "Contrepartie", "Date", "Montant"].map((h) => (
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
                {transactions.map((tx) => {
                  const isCredit = tx.toAccount?.userId === user.id && tx.type !== "WITHDRAWAL";
                  const myAccount = isCredit ? tx.toAccount : tx.fromAccount;
                  const counterpart = isCredit ? tx.fromAccount : tx.toAccount;

                  return (
                    <tr
                      key={tx.id}
                      className="border-t hover:bg-gray-50 transition-colors"
                      style={{ borderColor: "#f9f9f9" }}
                    >
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                            isCredit ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
                          }`}
                        >
                          {isCredit ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}
                          {TRANSACTION_TYPE_LABELS[tx.type as keyof typeof TRANSACTION_TYPE_LABELS]}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm" style={{ color: "#374151" }}>
                        {tx.description ?? "—"}
                      </td>
                      <td className="px-5 py-4 text-xs font-mono" style={{ color: "#9ca3af" }}>
                        {myAccount?.iban.slice(-8) ?? "—"}
                      </td>
                      <td className="px-5 py-4 text-xs font-mono" style={{ color: "#9ca3af" }}>
                        {counterpart ? counterpart.iban.slice(-8) : "—"}
                      </td>
                      <td className="px-5 py-4 text-sm" style={{ color: "#9ca3af" }}>
                        {formatDateTime(tx.createdAt)}
                      </td>
                      <td
                        className={`px-5 py-4 text-sm font-semibold ${
                          isCredit ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {isCredit ? "+" : "-"}{formatCurrency(tx.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

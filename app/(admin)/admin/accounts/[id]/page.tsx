import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { formatIBAN } from "@/lib/iban";
import { ACCOUNT_TYPE_LABELS, TRANSACTION_TYPE_LABELS } from "@/types";
import { Badge } from "@/components/ui/badge";
import { BlockAccountButton } from "./BlockAccountButton";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminAccountDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const user = session.user as typeof session.user & { isAdmin?: boolean };
  if (!user.isAdmin) redirect("/dashboard");

  const account = await prisma.bankAccount.findUnique({
    where: { id },
    include: {
      user: true,
      sentTransactions: { include: { toAccount: { include: { user: true } } }, orderBy: { createdAt: "desc" } },
      receivedTransactions: { include: { fromAccount: { include: { user: true } } }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!account) notFound();

  const allTransactions = [
    ...account.sentTransactions.map((tx: typeof account.sentTransactions[number]) => ({ ...tx, isDebit: true })),
    ...account.receivedTransactions.map((tx: typeof account.receivedTransactions[number]) => ({ ...tx, isDebit: false })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="h-16 border-b flex items-center px-8" style={{ background: "white", borderColor: "#f0f0f0" }}>
        <a href="/admin/accounts" className="text-sm mr-3" style={{ color: "#9ca3af" }}>← Comptes</a>
        <h2 className="text-lg font-semibold" style={{ color: "#1a0533", fontFamily: "'Cormorant Garant', serif" }}>
          {ACCOUNT_TYPE_LABELS[account.type as keyof typeof ACCOUNT_TYPE_LABELS]}
        </h2>
      </div>

      <div className="p-8 space-y-6">
        {/* Account info */}
        <div className="bg-white rounded-xl border p-6 grid grid-cols-2 gap-6" style={{ borderColor: "#f0f0f0" }}>
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#7c3aed" }}>
              Informations du compte
            </p>
            {[
              { label: "Type", value: ACCOUNT_TYPE_LABELS[account.type as keyof typeof ACCOUNT_TYPE_LABELS] },
              { label: "IBAN", value: formatIBAN(account.iban) },
              { label: "Solde", value: formatCurrency(account.balance) },
              { label: "Statut", value: account.isBlocked ? "Bloqué" : "Actif" },
              { label: "Ouvert le", value: formatDate(account.createdAt) },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs" style={{ color: "#9ca3af" }}>{label}</p>
                <p className="text-sm font-medium" style={{ color: "#1a0533" }}>{value}</p>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#7c3aed" }}>
              Titulaire
            </p>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                style={{ background: "linear-gradient(135deg, #1a0533, #2d1b54)" }}
              >
                {account.user.firstname?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: "#1a0533" }}>
                  {account.user.firstname} {account.user.lastname}
                </p>
                <p className="text-xs" style={{ color: "#9ca3af" }}>{account.user.email}</p>
              </div>
            </div>
            <a
              href={`/admin/clients/${account.user.id}`}
              className="text-xs font-medium px-3 py-1.5 rounded-lg inline-block"
              style={{ background: "#f3e8ff", color: "#7c3aed" }}
            >
              Voir le client →
            </a>
          </div>
        </div>

        {/* Block/Unblock */}
        <div className="bg-white rounded-xl border p-6" style={{ borderColor: "#f0f0f0" }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#7c3aed" }}>
            Actions administrateur
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm" style={{ color: "#374151" }}>Statut actuel :</span>
              {account.isBlocked ? (
                <Badge variant="destructive">Compte bloqué</Badge>
              ) : (
                <Badge variant="success">Compte actif</Badge>
              )}
            </div>
            <BlockAccountButton accountId={account.id} isBlocked={account.isBlocked} />
          </div>
        </div>

        {/* Transaction history */}
        <section>
          <h2 className="text-lg font-semibold mb-4" style={{ color: "#1a0533" }}>
            Historique des transactions
          </h2>
          <div className="rounded-xl border overflow-hidden bg-white" style={{ borderColor: "#f0f0f0" }}>
            {allTransactions.length === 0 ? (
              <p className="text-center py-10 text-sm" style={{ color: "#9ca3af" }}>
                Aucune transaction
              </p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
                    {["Type", "Description", "Contrepartie", "Date", "Montant"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "#9ca3af" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allTransactions.map((tx) => {
                    const counterpart = tx.isDebit
                      ? ("toAccount" in tx ? (tx as { toAccount?: { user?: { firstname?: string; lastname?: string } } }).toAccount?.user : null)
                      : ("fromAccount" in tx ? (tx as { fromAccount?: { user?: { firstname?: string; lastname?: string } } }).fromAccount?.user : null);
                    return (
                      <tr key={tx.id} className="border-t hover:bg-gray-50" style={{ borderColor: "#f9f9f9" }}>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${!tx.isDebit ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                            {!tx.isDebit ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}
                            {TRANSACTION_TYPE_LABELS[tx.type as keyof typeof TRANSACTION_TYPE_LABELS]}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm" style={{ color: "#374151" }}>{tx.description ?? "—"}</td>
                        <td className="px-5 py-4 text-sm" style={{ color: "#6b7280" }}>
                          {counterpart ? `${counterpart.firstname} ${counterpart.lastname}` : "—"}
                        </td>
                        <td className="px-5 py-4 text-sm" style={{ color: "#9ca3af" }}>{formatDateTime(tx.createdAt)}</td>
                        <td className={`px-5 py-4 text-sm font-semibold ${!tx.isDebit ? "text-green-600" : "text-red-600"}`}>
                          {!tx.isDebit ? "+" : "-"}{formatCurrency(tx.amount)}
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

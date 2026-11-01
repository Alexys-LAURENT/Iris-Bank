import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import { formatIBAN } from "@/lib/iban";
import { ACCOUNT_TYPE_LABELS } from "@/types";
import { Badge } from "@/components/ui/badge";

export default async function AdminAccountsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const user = session.user as typeof session.user & { isAdmin?: boolean };
  if (!user.isAdmin) redirect("/dashboard");

  const accounts = await prisma.bankAccount.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="h-16 border-b flex items-center px-8" style={{ background: "white", borderColor: "#f0f0f0" }}>
        <h2 className="text-lg font-semibold" style={{ color: "#1a0533", fontFamily: "'Cormorant Garant', serif" }}>
          Gestion des comptes
        </h2>
      </div>

      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Cormorant Garant', serif", color: "#1a0533" }}>
            Tous les comptes
          </h1>
          <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
            {accounts.length} compte{accounts.length > 1 ? "s" : ""} au total
          </p>
        </div>

        <div className="rounded-xl border overflow-hidden bg-white" style={{ borderColor: "#f0f0f0" }}>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
                {["Client", "Type", "IBAN", "Solde", "Statut", "Créé le", "Action"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "#9ca3af" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {accounts.map((account: typeof accounts[number]) => (
                <tr key={account.id} className="border-t hover:bg-gray-50" style={{ borderColor: "#f9f9f9" }}>
                  <td className="px-5 py-4 text-sm font-medium" style={{ color: "#1a0533" }}>
                    {account.user.firstname} {account.user.lastname}
                  </td>
                  <td className="px-5 py-4 text-sm" style={{ color: "#6b7280" }}>
                    {ACCOUNT_TYPE_LABELS[account.type as keyof typeof ACCOUNT_TYPE_LABELS]}
                  </td>
                  <td className="px-5 py-4 text-xs font-mono" style={{ color: "#9ca3af" }}>
                    {formatIBAN(account.iban).slice(-12)}
                  </td>
                  <td className="px-5 py-4 text-sm font-medium" style={{ color: "#1a0533" }}>
                    {formatCurrency(account.balance)}
                  </td>
                  <td className="px-5 py-4">
                    {account.isBlocked ? (
                      <Badge variant="destructive">Bloqué</Badge>
                    ) : (
                      <Badge variant="success">Actif</Badge>
                    )}
                  </td>
                  <td className="px-5 py-4 text-sm" style={{ color: "#6b7280" }}>
                    {formatDate(account.createdAt)}
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/accounts/${account.id}`}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg"
                      style={{ background: "#f3e8ff", color: "#7c3aed" }}
                    >
                      Gérer →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

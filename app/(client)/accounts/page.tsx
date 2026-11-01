import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import { formatIBAN } from "@/lib/iban";
import { ACCOUNT_TYPE_LABELS } from "@/types";
import { Topbar } from "@/components/layout/Topbar";
import { Badge } from "@/components/ui/badge";
import { Plus, ArrowRight } from "lucide-react";

export default async function AccountsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const accounts = await prisma.bankAccount.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <Topbar title="Mes comptes" />

      <div className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#0f1f4b", fontFamily: "'Cormorant Garant', serif" }}>
              Mes comptes bancaires
            </h1>
            <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
              {accounts.length} compte{accounts.length > 1 ? "s" : ""} actif{accounts.length > 1 ? "s" : ""}
            </p>
          </div>
          <Link
            href="/accounts/new"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #0f1f4b, #1e3a8a)" }}
          >
            <Plus size={16} />
            Ouvrir un compte
          </Link>
        </div>

        {accounts.length === 0 ? (
          <div
            className="text-center py-20 rounded-xl border-2 border-dashed"
            style={{ borderColor: "#e5e7eb" }}
          >
            <p className="text-4xl mb-4">🏦</p>
            <p className="font-medium" style={{ color: "#374151" }}>Aucun compte bancaire</p>
            <p className="text-sm mt-1 mb-6" style={{ color: "#9ca3af" }}>
              Ouvrez votre premier compte pour commencer
            </p>
            <Link
              href="/accounts/new"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #0f1f4b, #1e3a8a)" }}
            >
              <Plus size={16} />
              Ouvrir un compte
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {accounts.map((account) => (
              <Link
                key={account.id}
                href={`/accounts/${account.id}`}
                className="flex items-center justify-between p-6 rounded-xl border bg-white transition-all hover:shadow-md group"
                style={{ borderColor: account.isBlocked ? "#fca5a5" : "#f0f0f0" }}
              >
                <div className="flex items-center gap-6">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                    style={{ background: "#eef2ff" }}
                  >
                    {account.type === "COURANT" ? "💳" : account.type === "LIVRET_A" ? "🏦" : "🏠"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold" style={{ color: "#0f1f4b" }}>
                        {ACCOUNT_TYPE_LABELS[account.type as keyof typeof ACCOUNT_TYPE_LABELS]}
                      </p>
                      {account.isBlocked && <Badge variant="destructive">Bloqué</Badge>}
                    </div>
                    <p className="text-xs font-mono mt-0.5" style={{ color: "#9ca3af" }}>
                      {formatIBAN(account.iban)}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>
                      Ouvert le {formatDate(account.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wide" style={{ color: "#9ca3af" }}>Solde</p>
                    <p className="text-xl font-bold" style={{ color: "#0f1f4b" }}>
                      {formatCurrency(account.balance)}
                    </p>
                  </div>
                  <ArrowRight
                    size={18}
                    className="opacity-30 group-hover:opacity-100 transition-opacity"
                    style={{ color: "#1e3a8a" }}
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

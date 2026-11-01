import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";
import { formatIBAN } from "@/lib/iban";
import { ACCOUNT_TYPE_LABELS } from "@/types";
import { Badge } from "@/components/ui/badge";
import { AdminClientActions } from "./AdminClientActions";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminClientDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const user = session.user as typeof session.user & { isAdmin?: boolean };
  if (!user.isAdmin) redirect("/dashboard");

  const client = await prisma.user.findFirst({
    where: { id, isAdmin: false },
    include: {
      bankAccounts: {
        include: {
          sentTransactions: { orderBy: { createdAt: "desc" }, take: 10 },
          receivedTransactions: { orderBy: { createdAt: "desc" }, take: 10 },
        },
      },
    },
  });

  if (!client) notFound();

  const totalBalance = client.bankAccounts.reduce((s: number, a: { balance: number }) => s + a.balance, 0);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="h-16 border-b flex items-center px-8" style={{ background: "white", borderColor: "#f0f0f0" }}>
        <a href="/admin/clients" className="text-sm mr-3" style={{ color: "#9ca3af" }}>← Clients</a>
        <h2 className="text-lg font-semibold" style={{ color: "#1a0533", fontFamily: "'Cormorant Garant', serif" }}>
          {client.firstname} {client.lastname}
        </h2>
      </div>

      <div className="p-8 space-y-6">
        {/* Client info card */}
        <div className="bg-white rounded-xl border p-6 grid grid-cols-2 gap-6" style={{ borderColor: "#f0f0f0" }}>
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#7c3aed" }}>
              Informations personnelles
            </p>
            {[
              { label: "Nom complet", value: `${client.firstname} ${client.lastname}` },
              { label: "Email", value: client.email },
              { label: "Téléphone", value: client.phone ?? "—" },
              { label: "Adresse", value: client.address ?? "—" },
              { label: "Date de naissance", value: client.birthdate ? formatDate(client.birthdate) : "—" },
              { label: "Inscrit le", value: formatDate(client.createdAt) },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs" style={{ color: "#9ca3af" }}>{label}</p>
                <p className="text-sm font-medium" style={{ color: "#1a0533" }}>{value}</p>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#7c3aed" }}>
              Résumé financier
            </p>
            <div className="p-4 rounded-lg" style={{ background: "#f3e8ff" }}>
              <p className="text-xs" style={{ color: "#7c3aed" }}>Patrimoine total</p>
              <p className="text-2xl font-bold" style={{ color: "#1a0533" }}>{formatCurrency(totalBalance)}</p>
            </div>
            <p className="text-sm" style={{ color: "#6b7280" }}>
              {client.bankAccounts.length} compte{client.bankAccounts.length > 1 ? "s" : ""} bancaire{client.bankAccounts.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Admin actions */}
        <AdminClientActions clientId={client.id} client={{ firstname: client.firstname ?? "", lastname: client.lastname ?? "", phone: client.phone ?? "", address: client.address ?? "" }} />

        {/* Accounts */}
        <section>
          <h2 className="text-lg font-semibold mb-4" style={{ color: "#1a0533" }}>Comptes bancaires</h2>
          <div className="space-y-3">
            {client.bankAccounts.map((account: typeof client.bankAccounts[number]) => (
              <div key={account.id} className="bg-white rounded-xl border p-5" style={{ borderColor: "#f0f0f0" }}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold" style={{ color: "#1a0533" }}>
                        {ACCOUNT_TYPE_LABELS[account.type as keyof typeof ACCOUNT_TYPE_LABELS]}
                      </p>
                      {account.isBlocked ? (
                        <Badge variant="destructive">Bloqué</Badge>
                      ) : (
                        <Badge variant="success">Actif</Badge>
                      )}
                    </div>
                    <p className="text-xs font-mono" style={{ color: "#9ca3af" }}>{formatIBAN(account.iban)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold" style={{ color: "#1a0533" }}>{formatCurrency(account.balance)}</p>
                    <a
                      href={`/admin/accounts/${account.id}`}
                      className="text-xs" style={{ color: "#7c3aed" }}
                    >
                      Gérer →
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

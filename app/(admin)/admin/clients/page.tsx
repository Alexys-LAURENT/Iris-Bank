import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDate, formatCurrency } from "@/lib/utils";

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function AdminClientsPage({ searchParams }: Props) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const user = session.user as typeof session.user & { isAdmin?: boolean };
  if (!user.isAdmin) redirect("/dashboard");

  const { q } = await searchParams;

  const clients = await prisma.user.findMany({
    where: {
      isAdmin: false,
      ...(q
        ? {
            OR: [
              { email: { contains: q } },
              { firstname: { contains: q } },
              { lastname: { contains: q } },
            ],
          }
        : {}),
    },
    include: { bankAccounts: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="h-16 border-b flex items-center px-8" style={{ background: "white", borderColor: "#f0f0f0" }}>
        <h2 className="text-lg font-semibold" style={{ color: "#1a0533", fontFamily: "'Cormorant Garant', serif" }}>
          Gestion des clients
        </h2>
      </div>

      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: "'Cormorant Garant', serif", color: "#1a0533" }}>
              Clients
            </h1>
            <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
              {clients.length} client{clients.length > 1 ? "s" : ""} enregistré{clients.length > 1 ? "s" : ""}
            </p>
          </div>
          {/* Search */}
          <form className="flex gap-2">
            <input
              name="q"
              defaultValue={q}
              placeholder="Rechercher par nom ou email…"
              className="px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2"
              style={{ borderColor: "#e5e7eb", width: "280px", background: "white" }}
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-sm font-medium text-white"
              style={{ background: "linear-gradient(135deg, #1a0533, #2d1b54)" }}
            >
              Rechercher
            </button>
          </form>
        </div>

        <div className="rounded-xl border overflow-hidden bg-white" style={{ borderColor: "#f0f0f0" }}>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
                {["Client", "Email", "Comptes", "Solde total", "Inscrit le", "Action"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "#9ca3af" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-sm" style={{ color: "#9ca3af" }}>
                    Aucun client trouvé
                  </td>
                </tr>
              ) : (
                clients.map((client: typeof clients[number]) => {
                  const totalBalance = client.bankAccounts.reduce((s: number, a: { balance: number }) => s + a.balance, 0);
                  return (
                    <tr key={client.id} className="border-t hover:bg-gray-50" style={{ borderColor: "#f9f9f9" }}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                            style={{ background: "linear-gradient(135deg, #1a0533, #2d1b54)" }}
                          >
                            {client.firstname?.[0]?.toUpperCase() ?? "?"}
                          </div>
                          <span className="text-sm font-medium" style={{ color: "#1a0533" }}>
                            {client.firstname} {client.lastname}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm" style={{ color: "#6b7280" }}>{client.email}</td>
                      <td className="px-5 py-4 text-sm" style={{ color: "#6b7280" }}>{client.bankAccounts.length}</td>
                      <td className="px-5 py-4 text-sm font-medium" style={{ color: "#1a0533" }}>
                        {formatCurrency(totalBalance)}
                      </td>
                      <td className="px-5 py-4 text-sm" style={{ color: "#6b7280" }}>
                        {formatDate(client.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/clients/${client.id}`}
                          className="text-xs font-medium px-3 py-1.5 rounded-lg"
                          style={{ background: "#f3e8ff", color: "#7c3aed" }}
                        >
                          Gérer →
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { formatCurrency } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const user = session.user as typeof session.user & { isAdmin?: boolean };
  if (!user.isAdmin) redirect("/dashboard");

  const [totalUsers, totalAccounts, depositAgg, recentUsers] = await Promise.all([
    prisma.user.count({ where: { isAdmin: false } }),
    prisma.bankAccount.count(),
    prisma.transaction.aggregate({ where: { type: "DEPOSIT" }, _sum: { amount: true } }),
    prisma.user.findMany({
      where: { isAdmin: false },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { bankAccounts: true },
    }),
  ]);

  const stats = [
    { label: "Clients enregistrés", value: String(totalUsers), icon: "👥", color: "#eef2ff" },
    { label: "Comptes bancaires", value: String(totalAccounts), icon: "💳", color: "#f0fdf4" },
    { label: "Total des dépôts", value: formatCurrency(depositAgg._sum.amount ?? 0), icon: "📈", color: "#fff7ed" },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div
        className="h-16 border-b flex items-center px-8"
        style={{ background: "white", borderColor: "#f0f0f0" }}
      >
        <h2
          className="text-lg font-semibold"
          style={{ color: "#1a0533", fontFamily: "'Cormorant Garant', serif" }}
        >
          Tableau de bord
        </h2>
      </div>

      <div className="p-8 space-y-8">
        <div>
          <h1
            className="text-3xl font-bold mb-1"
            style={{ fontFamily: "'Cormorant Garant', serif", color: "#1a0533" }}
          >
            Vue d&apos;ensemble
          </h1>
          <p className="text-sm" style={{ color: "#6b7280" }}>
            Statistiques globales de la plateforme IrisBank
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {stats.map(({ label, value, icon, color }) => (
            <div
              key={label}
              className="p-6 rounded-xl border bg-white"
              style={{ borderColor: "#f0f0f0" }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-4"
                style={{ background: color }}
              >
                {icon}
              </div>
              <p className="text-3xl font-bold" style={{ color: "#1a0533" }}>{value}</p>
              <p className="text-sm mt-1" style={{ color: "#6b7280" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Recent clients */}
        <section>
          <h2 className="text-lg font-semibold mb-4" style={{ color: "#1a0533" }}>
            Derniers clients inscrits
          </h2>
          <div className="rounded-xl border overflow-hidden bg-white" style={{ borderColor: "#f0f0f0" }}>
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
                  {["Client", "Email", "Comptes", "Action"].map((h) => (
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
                {recentUsers.map((u: typeof recentUsers[number]) => (
                  <tr key={u.id} className="border-t hover:bg-gray-50" style={{ borderColor: "#f9f9f9" }}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                          style={{ background: "linear-gradient(135deg, #1a0533, #2d1b54)" }}
                        >
                          {u.firstname?.[0]?.toUpperCase() ?? u.name?.[0]?.toUpperCase() ?? "?"}
                        </div>
                        <span className="text-sm font-medium" style={{ color: "#1a0533" }}>
                          {u.firstname} {u.lastname}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm" style={{ color: "#6b7280" }}>{u.email}</td>
                    <td className="px-5 py-4 text-sm" style={{ color: "#6b7280" }}>{u.bankAccounts.length}</td>
                    <td className="px-5 py-4">
                      <a
                        href={`/admin/clients/${u.id}`}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                        style={{ background: "#f3e8ff", color: "#7c3aed" }}
                      >
                        Voir →
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

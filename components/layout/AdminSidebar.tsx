"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { LayoutDashboard, Users, CreditCard, LogOut, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/clients", label: "Clients", icon: Users },
  { href: "/admin/accounts", label: "Comptes", icon: CreditCard },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside
      className="w-64 flex flex-col h-full"
      style={{
        background: "linear-gradient(180deg, #1a0533 0%, #2d1b54 100%)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div className="px-6 py-7 border-b border-white/10">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <span className="text-3xl">🌸</span>
          <div>
            <span
              className="text-lg font-bold text-white tracking-widest block"
              style={{ fontFamily: "'Cormorant Garant', serif", letterSpacing: "0.12em" }}
            >
              IRISBANK
            </span>
            <span className="flex items-center gap-1 text-xs text-purple-300">
              <ShieldCheck size={10} />
              Administration
            </span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-white/15 text-white"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition-all"
        >
          <LogOut size={18} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import {
  LayoutDashboard,
  CreditCard,
  ArrowLeftRight,
  History,
  User,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/accounts", label: "Mes comptes", icon: CreditCard },
  { href: "/transactions", label: "Opérations", icon: ArrowLeftRight },
  { href: "/history", label: "Historique", icon: History },
  { href: "/profile", label: "Mon profil", icon: User },
];

export function ClientSidebar() {
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
        background: "linear-gradient(180deg, #0f1f4b 0%, #1e3a8a 100%)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Logo */}
      <div className="px-6 py-7 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center gap-3">
          <span className="text-3xl">🌸</span>
          <span
            className="text-lg font-bold text-white tracking-widest"
            style={{ fontFamily: "'Cormorant Garant', serif", letterSpacing: "0.12em" }}
          >
            IRISBANK
          </span>
        </Link>
      </div>

      {/* Navigation */}
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

      {/* Logout */}
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

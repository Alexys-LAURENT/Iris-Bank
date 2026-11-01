import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function Topbar({ title }: { title?: string }) {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;

  return (
    <header
      className="h-16 border-b flex items-center justify-between px-8"
      style={{ background: "white", borderColor: "#f0f0f0" }}
    >
      <h2 className="text-lg font-semibold" style={{ color: "#0f1f4b", fontFamily: "'Cormorant Garant', serif" }}>
        {title ?? "Tableau de bord"}
      </h2>
      {user && (
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #0f1f4b, #1e3a8a)" }}
          >
            {(user as { firstname?: string; name?: string }).firstname?.[0]?.toUpperCase() ??
              user.name?.[0]?.toUpperCase() ??
              "U"}
          </div>
          <span className="text-sm font-medium" style={{ color: "#374151" }}>
            {(user as { firstname?: string; lastname?: string }).firstname}{" "}
            {(user as { firstname?: string; lastname?: string }).lastname ?? ""}
          </span>
        </div>
      )}
    </header>
  );
}

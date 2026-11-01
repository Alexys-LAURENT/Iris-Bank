"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAccount } from "@/server_actions/accounts/createAccount";
import { AccountType, ACCOUNT_TYPE_LABELS } from "@/types";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle } from "lucide-react";

const accountTypes: { type: AccountType; emoji: string; desc: string }[] = [
  { type: "COURANT", emoji: "💳", desc: "Pour vos dépenses quotidiennes et virements" },
  { type: "LIVRET_A", emoji: "🏦", desc: "Épargne défiscalisée, disponible à tout moment" },
  { type: "PEL", emoji: "🏠", desc: "Préparez votre projet immobilier sur le long terme" },
];

export default function NewAccountPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<AccountType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!selected) return;
    setLoading(true);
    setError(null);
    const result = await createAccount({ type: selected });
    setLoading(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    router.push(`/accounts/${result.data.id}`);
    router.refresh();
  };

  return (
    <div className="min-h-screen p-8" style={{ fontFamily: "'DM Sans', sans-serif", background: "#f8f7f4" }}>
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.back()}
          className="text-sm mb-6 flex items-center gap-1 transition-colors"
          style={{ color: "#9ca3af" }}
        >
          ← Retour
        </button>

        <h1
          className="text-3xl font-bold mb-2"
          style={{ fontFamily: "'Cormorant Garant', serif", color: "#0f1f4b" }}
        >
          Ouvrir un compte
        </h1>
        <p className="text-sm mb-8" style={{ color: "#6b7280" }}>
          Choisissez le type de compte qui correspond à vos besoins
        </p>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-lg text-sm bg-red-50 border border-red-200 text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-3 mb-8">
          {accountTypes.map(({ type, emoji, desc }) => {
            const isSelected = selected === type;
            return (
              <button
                key={type}
                onClick={() => setSelected(type)}
                className="w-full flex items-center gap-5 p-5 rounded-xl border text-left transition-all"
                style={{
                  background: isSelected ? "#eef2ff" : "white",
                  borderColor: isSelected ? "#1e3a8a" : "#f0f0f0",
                  borderWidth: isSelected ? "2px" : "1px",
                }}
              >
                <span className="text-3xl">{emoji}</span>
                <div className="flex-1">
                  <p className="font-semibold" style={{ color: "#0f1f4b" }}>
                    {ACCOUNT_TYPE_LABELS[type]}
                  </p>
                  <p className="text-sm mt-0.5" style={{ color: "#6b7280" }}>
                    {desc}
                  </p>
                </div>
                {isSelected && <CheckCircle size={20} style={{ color: "#1e3a8a" }} />}
              </button>
            );
          })}
        </div>

        <Button
          onClick={handleCreate}
          disabled={!selected || loading}
          className="w-full h-12 text-sm font-semibold"
          style={{
            background: !selected || loading ? "#d1d5db" : "linear-gradient(135deg, #0f1f4b, #1e3a8a)",
            border: "none",
            borderRadius: "0.5rem",
            color: "white",
          }}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              Ouverture en cours…
            </span>
          ) : (
            "Ouvrir le compte"
          )}
        </Button>
      </div>
    </div>
  );
}

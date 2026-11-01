"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteAccount } from "@/server_actions/accounts/deleteAccount";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";

export function DeleteAccountButton({ accountId }: { accountId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);

  const handleDelete = async () => {
    if (!confirm) {
      setConfirm(true);
      return;
    }
    setLoading(true);
    const result = await deleteAccount(accountId);
    setLoading(false);
    if (!result.success) {
      setError(result.error);
      setConfirm(false);
      return;
    }
    router.push("/accounts");
    router.refresh();
  };

  return (
    <div className="flex items-center gap-3">
      {error && <p className="text-xs text-red-500">{error}</p>}
      <Button
        onClick={handleDelete}
        disabled={loading}
        variant="outline"
        className="flex items-center gap-2 text-sm border-red-200 text-red-600 hover:bg-red-50"
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Trash2 size={14} />
        )}
        {confirm ? "Confirmer la suppression" : "Supprimer le compte"}
      </Button>
      {confirm && (
        <button
          onClick={() => setConfirm(false)}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          Annuler
        </button>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setAccountBlocked } from "@/server_actions/admin/blockAccount";
import { Button } from "@/components/ui/button";
import { Loader2, Lock, Unlock } from "lucide-react";

export function BlockAccountButton({
  accountId,
  isBlocked,
}: {
  accountId: string;
  isBlocked: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggle = async () => {
    setLoading(true);
    setError(null);
    const result = await setAccountBlocked(accountId, !isBlocked);
    setLoading(false);
    if (!result.success) { setError(result.error); return; }
    router.refresh();
  };

  return (
    <div className="flex items-center gap-3">
      <Button
        onClick={handleToggle}
        disabled={loading}
        variant={isBlocked ? "outline" : "destructive"}
        className="flex items-center gap-2 text-sm h-9"
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : isBlocked ? (
          <Unlock size={14} />
        ) : (
          <Lock size={14} />
        )}
        {isBlocked ? "Débloquer le compte" : "Bloquer le compte"}
      </Button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

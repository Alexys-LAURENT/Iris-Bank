"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { deposit } from "@/server_actions/transactions/deposit";
import { withdraw } from "@/server_actions/transactions/withdraw";
import { transfer } from "@/server_actions/transactions/transfer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ACCOUNT_TYPE_LABELS, AccountType } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Loader2, CheckCircle } from "lucide-react";

interface Account {
  id: string;
  iban: string;
  type: string;
  balance: number;
}

const amountSchema = z.object({
  accountId: z.string().min(1, "Sélectionnez un compte"),
  amount: z.number().positive("Le montant doit être positif"),
  description: z.string().optional(),
});

const transferSchema = z.object({
  fromAccountId: z.string().min(1, "Sélectionnez un compte"),
  toType: z.enum(["internal", "iban"]),
  toAccountId: z.string().optional(),
  toIban: z.string().optional(),
  amount: z.number().positive("Le montant doit être positif"),
  description: z.string().optional(),
});

type AmountForm = z.infer<typeof amountSchema>;
type TransferForm = z.infer<typeof transferSchema>;

type Tab = "deposit" | "withdraw" | "transfer";

function SuccessBanner({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm mb-4">
      <CheckCircle size={16} />
      {message}
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm mb-4">
      {message}
    </div>
  );
}

function AccountSelect({
  accounts,
  value,
  onChange,
  label,
}: {
  accounts: Account[];
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <Label style={{ color: "#374151" }}>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger style={{ background: "white" }}>
          <SelectValue placeholder="Choisir un compte" />
        </SelectTrigger>
        <SelectContent>
          {accounts.map((acc) => (
            <SelectItem key={acc.id} value={acc.id}>
              {ACCOUNT_TYPE_LABELS[acc.type as AccountType]} — {formatCurrency(acc.balance)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function TransactionForms({ accounts }: { accounts: Account[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("deposit");
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const depositForm = useForm<AmountForm>({ resolver: zodResolver(amountSchema) });
  const withdrawForm = useForm<AmountForm>({ resolver: zodResolver(amountSchema) });
  const transferForm = useForm<TransferForm>({ resolver: zodResolver(transferSchema), defaultValues: { toType: "internal" } });

  const toType = transferForm.watch("toType");

  const reset = () => { setSuccess(null); setError(null); };

  const onDeposit = async (data: AmountForm) => {
    reset();
    const result = await deposit({ accountId: data.accountId, amount: data.amount, description: data.description });
    if (!result.success) { setError(result.error); return; }
    setSuccess(`Dépôt de ${formatCurrency(data.amount)} effectué avec succès`);
    depositForm.reset();
    router.refresh();
  };

  const onWithdraw = async (data: AmountForm) => {
    reset();
    const result = await withdraw({ accountId: data.accountId, amount: data.amount, description: data.description });
    if (!result.success) { setError(result.error); return; }
    setSuccess(`Retrait de ${formatCurrency(data.amount)} effectué avec succès`);
    withdrawForm.reset();
    router.refresh();
  };

  const onTransfer = async (data: TransferForm) => {
    reset();
    const result = await transfer({
      fromAccountId: data.fromAccountId,
      toAccountId: data.toType === "internal" ? data.toAccountId : undefined,
      toIban: data.toType === "iban" ? data.toIban : undefined,
      amount: data.amount,
      description: data.description,
    });
    if (!result.success) { setError(result.error); return; }
    setSuccess(`Virement de ${formatCurrency(data.amount)} effectué avec succès`);
    transferForm.reset();
    router.refresh();
  };

  const inputStyle = { background: "white", borderColor: "#e5e7eb", borderRadius: "0.5rem" };
  const tabs: { key: Tab; label: string }[] = [
    { key: "deposit", label: "💰 Dépôt" },
    { key: "withdraw", label: "💸 Retrait" },
    { key: "transfer", label: "↔️ Virement" },
  ];

  if (accounts.length === 0) {
    return (
      <div className="text-center py-12 rounded-xl border-2 border-dashed" style={{ borderColor: "#e5e7eb" }}>
        <p className="text-sm" style={{ color: "#9ca3af" }}>
          Aucun compte disponible. Créez un compte d&apos;abord.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      {/* Tab switcher */}
      <div
        className="flex rounded-xl p-1 mb-6"
        style={{ background: "#f0f0f0" }}
      >
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => { setTab(key); reset(); }}
            className="flex-1 py-2.5 text-sm font-medium rounded-lg transition-all"
            style={{
              background: tab === key ? "white" : "transparent",
              color: tab === key ? "#0f1f4b" : "#9ca3af",
              boxShadow: tab === key ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border p-6 space-y-5" style={{ borderColor: "#f0f0f0" }}>
        {success && <SuccessBanner message={success} />}
        {error && <ErrorBanner message={error} />}

        {/* Dépôt */}
        {tab === "deposit" && (
          <form onSubmit={depositForm.handleSubmit(onDeposit)} className="space-y-4">
            <AccountSelect
              accounts={accounts}
              value={depositForm.watch("accountId") ?? ""}
              onChange={(v) => depositForm.setValue("accountId", v)}
              label="Compte bénéficiaire"
            />
            {depositForm.formState.errors.accountId && <p className="text-xs text-red-500">{depositForm.formState.errors.accountId.message}</p>}

            <div className="space-y-2">
              <Label style={{ color: "#374151" }}>Montant (€)</Label>
              <Input type="number" step="0.01" placeholder="0,00" {...depositForm.register("amount", { valueAsNumber: true })} style={inputStyle} />
              {depositForm.formState.errors.amount && <p className="text-xs text-red-500">{depositForm.formState.errors.amount.message}</p>}
            </div>

            <div className="space-y-2">
              <Label style={{ color: "#374151" }}>Libellé (optionnel)</Label>
              <Input placeholder="Motif du dépôt" {...depositForm.register("description")} style={inputStyle} />
            </div>

            <Button type="submit" disabled={depositForm.formState.isSubmitting} className="w-full h-11" style={{ background: "linear-gradient(135deg, #0f1f4b, #1e3a8a)", border: "none", color: "white", borderRadius: "0.5rem" }}>
              {depositForm.formState.isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Effectuer le dépôt"}
            </Button>
          </form>
        )}

        {/* Retrait */}
        {tab === "withdraw" && (
          <form onSubmit={withdrawForm.handleSubmit(onWithdraw)} className="space-y-4">
            <AccountSelect
              accounts={accounts}
              value={withdrawForm.watch("accountId") ?? ""}
              onChange={(v) => withdrawForm.setValue("accountId", v)}
              label="Compte à débiter"
            />
            {withdrawForm.formState.errors.accountId && <p className="text-xs text-red-500">{withdrawForm.formState.errors.accountId.message}</p>}

            <div className="space-y-2">
              <Label style={{ color: "#374151" }}>Montant (€)</Label>
              <Input type="number" step="0.01" placeholder="0,00" {...withdrawForm.register("amount", { valueAsNumber: true })} style={inputStyle} />
              {withdrawForm.formState.errors.amount && <p className="text-xs text-red-500">{withdrawForm.formState.errors.amount.message}</p>}
            </div>

            <div className="space-y-2">
              <Label style={{ color: "#374151" }}>Libellé (optionnel)</Label>
              <Input placeholder="Motif du retrait" {...withdrawForm.register("description")} style={inputStyle} />
            </div>

            <Button type="submit" disabled={withdrawForm.formState.isSubmitting} className="w-full h-11" style={{ background: "linear-gradient(135deg, #0f1f4b, #1e3a8a)", border: "none", color: "white", borderRadius: "0.5rem" }}>
              {withdrawForm.formState.isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Effectuer le retrait"}
            </Button>
          </form>
        )}

        {/* Virement */}
        {tab === "transfer" && (
          <form onSubmit={transferForm.handleSubmit(onTransfer)} className="space-y-4">
            <AccountSelect
              accounts={accounts}
              value={transferForm.watch("fromAccountId") ?? ""}
              onChange={(v) => transferForm.setValue("fromAccountId", v)}
              label="Compte à débiter"
            />

            <div className="space-y-2">
              <Label style={{ color: "#374151" }}>Type de virement</Label>
              <div className="flex gap-2">
                {[{ v: "internal", label: "Entre mes comptes" }, { v: "iban", label: "Vers un IBAN" }].map(({ v, label }) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => transferForm.setValue("toType", v as "internal" | "iban")}
                    className="flex-1 py-2 text-sm rounded-lg border transition-all"
                    style={{
                      background: toType === v ? "#eef2ff" : "white",
                      borderColor: toType === v ? "#1e3a8a" : "#e5e7eb",
                      color: toType === v ? "#1e3a8a" : "#6b7280",
                      fontWeight: toType === v ? 600 : 400,
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {toType === "internal" ? (
              <AccountSelect
                accounts={accounts.filter((a) => a.id !== transferForm.watch("fromAccountId"))}
                value={transferForm.watch("toAccountId") ?? ""}
                onChange={(v) => transferForm.setValue("toAccountId", v)}
                label="Compte bénéficiaire"
              />
            ) : (
              <div className="space-y-2">
                <Label style={{ color: "#374151" }}>IBAN bénéficiaire</Label>
                <Input placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX" {...transferForm.register("toIban")} style={inputStyle} />
              </div>
            )}

            <div className="space-y-2">
              <Label style={{ color: "#374151" }}>Montant (€)</Label>
              <Input type="number" step="0.01" placeholder="0,00" {...transferForm.register("amount", { valueAsNumber: true })} style={inputStyle} />
              {transferForm.formState.errors.amount && <p className="text-xs text-red-500">{transferForm.formState.errors.amount.message}</p>}
            </div>

            <div className="space-y-2">
              <Label style={{ color: "#374151" }}>Libellé (optionnel)</Label>
              <Input placeholder="Motif du virement" {...transferForm.register("description")} style={inputStyle} />
            </div>

            <Button type="submit" disabled={transferForm.formState.isSubmitting} className="w-full h-11" style={{ background: "linear-gradient(135deg, #0f1f4b, #1e3a8a)", border: "none", color: "white", borderRadius: "0.5rem" }}>
              {transferForm.formState.isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Effectuer le virement"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

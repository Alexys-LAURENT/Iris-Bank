export type AccountType = "COURANT" | "LIVRET_A" | "PEL";
export type TransactionType = "DEPOSIT" | "WITHDRAWAL" | "TRANSFER";

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  COURANT: "Compte Courant",
  LIVRET_A: "Livret A",
  PEL: "Plan Épargne Logement",
};

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  DEPOSIT: "Dépôt",
  WITHDRAWAL: "Retrait",
  TRANSFER: "Virement",
};

export type ActionResponse<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

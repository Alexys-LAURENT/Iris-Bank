"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ActionResponse } from "@/types";
import { headers } from "next/headers";

interface TransferInput {
  fromAccountId: string;
  // Either toAccountId (internal) or toIban (external)
  toAccountId?: string;
  toIban?: string;
  amount: number;
  description?: string;
}

export async function transfer(input: TransferInput): Promise<ActionResponse> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { success: false, error: "Non authentifié" };
  if (input.amount <= 0) return { success: false, error: "Le montant doit être positif" };
  if (!input.toAccountId && !input.toIban) {
    return { success: false, error: "Destinataire requis" };
  }

  const fromAccount = await prisma.bankAccount.findFirst({
    where: { id: input.fromAccountId, userId: session.user.id },
  });

  if (!fromAccount) return { success: false, error: "Compte source introuvable" };
  if (fromAccount.isBlocked) return { success: false, error: "Compte source bloqué" };
  if (fromAccount.balance < input.amount) return { success: false, error: "Solde insuffisant" };

  // Resolve destination account
  let toAccount: { id: string; isBlocked: boolean } | null = null;

  if (input.toAccountId) {
    toAccount = await prisma.bankAccount.findUnique({
      where: { id: input.toAccountId },
      select: { id: true, isBlocked: true },
    });
  } else if (input.toIban) {
    const cleanIban = input.toIban.replace(/\s/g, "").toUpperCase();
    toAccount = await prisma.bankAccount.findUnique({
      where: { iban: cleanIban },
      select: { id: true, isBlocked: true },
    });
  }

  if (!toAccount) return { success: false, error: "Compte destinataire introuvable" };
  if (toAccount.isBlocked) return { success: false, error: "Compte destinataire bloqué" };
  if (toAccount.id === fromAccount.id) {
    return { success: false, error: "Impossible de virer vers le même compte" };
  }

  await prisma.$transaction([
    prisma.bankAccount.update({
      where: { id: fromAccount.id },
      data: { balance: { decrement: input.amount } },
    }),
    prisma.bankAccount.update({
      where: { id: toAccount.id },
      data: { balance: { increment: input.amount } },
    }),
    prisma.transaction.create({
      data: {
        fromAccountId: fromAccount.id,
        toAccountId: toAccount.id,
        amount: input.amount,
        type: "TRANSFER",
        description: input.description ?? "Virement",
      },
    }),
  ]);

  return { success: true, data: undefined };
}

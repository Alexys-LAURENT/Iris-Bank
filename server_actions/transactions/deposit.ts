"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ActionResponse } from "@/types";
import { headers } from "next/headers";

interface DepositInput {
  accountId: string;
  amount: number;
  description?: string;
}

export async function deposit(input: DepositInput): Promise<ActionResponse> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { success: false, error: "Non authentifié" };
  if (input.amount <= 0) return { success: false, error: "Le montant doit être positif" };

  const account = await prisma.bankAccount.findFirst({
    where: { id: input.accountId, userId: session.user.id },
  });

  if (!account) return { success: false, error: "Compte introuvable" };
  if (account.isBlocked) return { success: false, error: "Ce compte est bloqué" };

  await prisma.$transaction([
    prisma.bankAccount.update({
      where: { id: input.accountId },
      data: { balance: { increment: input.amount } },
    }),
    prisma.transaction.create({
      data: {
        toAccountId: input.accountId,
        amount: input.amount,
        type: "DEPOSIT",
        description: input.description ?? "Dépôt",
      },
    }),
  ]);

  return { success: true, data: undefined };
}

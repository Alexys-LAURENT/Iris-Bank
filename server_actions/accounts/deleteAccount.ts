"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ActionResponse } from "@/types";
import { headers } from "next/headers";

export async function deleteAccount(accountId: string): Promise<ActionResponse> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { success: false, error: "Non authentifié" };

  try {
    const account = await prisma.bankAccount.findFirst({
      where: { id: accountId, userId: session.user.id },
    });

    if (!account) return { success: false, error: "Compte introuvable" };
    if (account.balance !== 0) {
      return { success: false, error: "Le solde doit être à 0 pour supprimer le compte" };
    }
    if (account.isBlocked) {
      return { success: false, error: "Ce compte est bloqué" };
    }

    await prisma.bankAccount.delete({ where: { id: accountId } });
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Impossible de supprimer le compte" };
  }
}

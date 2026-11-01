"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ActionResponse } from "@/types";
import { headers } from "next/headers";

export async function setAccountBlocked(
  accountId: string,
  blocked: boolean
): Promise<ActionResponse> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { success: false, error: "Non authentifié" };
  const user = session.user as typeof session.user & { isAdmin?: boolean };
  if (!user.isAdmin) return { success: false, error: "Accès refusé" };

  try {
    await prisma.bankAccount.update({
      where: { id: accountId },
      data: { isBlocked: blocked },
    });
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Impossible de modifier le statut du compte" };
  }
}

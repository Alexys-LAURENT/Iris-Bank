"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ActionResponse } from "@/types";
import { headers } from "next/headers";

export async function deleteClient(userId: string): Promise<ActionResponse> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { success: false, error: "Non authentifié" };
  const user = session.user as typeof session.user & { isAdmin?: boolean };
  if (!user.isAdmin) return { success: false, error: "Accès refusé" };
  if (userId === user.id) return { success: false, error: "Impossible de supprimer son propre compte" };

  try {
    await prisma.user.delete({ where: { id: userId } });
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Impossible de supprimer le client" };
  }
}

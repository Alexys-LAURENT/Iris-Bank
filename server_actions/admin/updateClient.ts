"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ActionResponse } from "@/types";
import { headers } from "next/headers";

interface UpdateClientInput {
  userId: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  address?: string;
}

export async function updateClient(input: UpdateClientInput): Promise<ActionResponse> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { success: false, error: "Non authentifié" };
  const user = session.user as typeof session.user & { isAdmin?: boolean };
  if (!user.isAdmin) return { success: false, error: "Accès refusé" };

  try {
    await prisma.user.update({
      where: { id: input.userId },
      data: {
        firstname: input.firstname,
        lastname: input.lastname,
        phone: input.phone,
        address: input.address,
        ...(input.firstname && input.lastname
          ? { name: `${input.firstname} ${input.lastname}` }
          : {}),
      },
    });
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Impossible de mettre à jour le client" };
  }
}

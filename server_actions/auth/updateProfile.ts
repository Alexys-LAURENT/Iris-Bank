"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ActionResponse } from "@/types";
import { headers } from "next/headers";

interface UpdateProfileInput {
  firstname?: string;
  lastname?: string;
  phone?: string;
  address?: string;
  birthdate?: string;
}

export async function updateProfile(input: UpdateProfileInput): Promise<ActionResponse> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { success: false, error: "Non authentifié" };

  try {
    const name = input.firstname && input.lastname
      ? `${input.firstname} ${input.lastname}`
      : undefined;

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(input.firstname !== undefined && { firstname: input.firstname }),
        ...(input.lastname !== undefined && { lastname: input.lastname }),
        ...(name !== undefined && { name }),
        ...(input.phone !== undefined && { phone: input.phone }),
        ...(input.address !== undefined && { address: input.address }),
        ...(input.birthdate !== undefined && {
          birthdate: input.birthdate ? new Date(input.birthdate) : null,
        }),
      },
    });

    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Impossible de mettre à jour le profil" };
  }
}

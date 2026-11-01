"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function getClients(search?: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return [];

  const user = session.user as typeof session.user & { isAdmin?: boolean };
  if (!user.isAdmin) return [];

  return prisma.user.findMany({
    where: {
      isAdmin: false,
      ...(search
        ? {
            OR: [
              { email: { contains: search } },
              { firstname: { contains: search } },
              { lastname: { contains: search } },
            ],
          }
        : {}),
    },
    include: { bankAccounts: true },
    orderBy: { createdAt: "desc" },
  });
}

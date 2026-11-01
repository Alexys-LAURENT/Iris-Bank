"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function getAccountById(accountId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  return prisma.bankAccount.findFirst({
    where: { id: accountId, userId: session.user.id },
    include: {
      sentTransactions: { orderBy: { createdAt: "desc" }, take: 50 },
      receivedTransactions: { orderBy: { createdAt: "desc" }, take: 50 },
    },
  });
}

"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function getAdminStats() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const user = session.user as typeof session.user & { isAdmin?: boolean };
  if (!user.isAdmin) return null;

  const [totalUsers, totalAccounts, depositAgg] = await Promise.all([
    prisma.user.count({ where: { isAdmin: false } }),
    prisma.bankAccount.count(),
    prisma.transaction.aggregate({
      where: { type: "DEPOSIT" },
      _sum: { amount: true },
    }),
  ]);

  return {
    totalUsers,
    totalAccounts,
    totalDeposits: depositAgg._sum.amount ?? 0,
  };
}

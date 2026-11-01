"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateIBAN } from "@/lib/iban";
import { ActionResponse, AccountType } from "@/types";
import { headers } from "next/headers";

interface CreateAccountInput {
  type: AccountType;
}

export async function createAccount(
  input: CreateAccountInput
): Promise<ActionResponse<{ id: string; iban: string }>> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { success: false, error: "Non authentifié" };

  try {
    // Generate a unique IBAN
    let iban: string;
    let attempts = 0;
    do {
      iban = generateIBAN();
      const existing = await prisma.bankAccount.findUnique({
        where: { iban: iban.replace(/\s/g, "") },
      });
      if (!existing) break;
      attempts++;
    } while (attempts < 10);

    const cleanIban = iban.replace(/\s/g, "");

    const account = await prisma.bankAccount.create({
      data: {
        userId: session.user.id,
        iban: cleanIban,
        type: input.type,
        balance: 0,
      },
    });

    return { success: true, data: { id: account.id, iban: cleanIban } };
  } catch {
    return { success: false, error: "Impossible de créer le compte" };
  }
}

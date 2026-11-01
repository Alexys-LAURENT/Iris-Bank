"use server";

import { auth } from "@/lib/auth";
import { ActionResponse } from "@/types";
import { headers } from "next/headers";

export async function logout(): Promise<ActionResponse> {
  try {
    await auth.api.signOut({ headers: await headers() });
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Erreur lors de la déconnexion" };
  }
}

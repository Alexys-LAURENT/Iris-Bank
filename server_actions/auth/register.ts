"use server";

import { auth } from "@/lib/auth";
import { ActionResponse } from "@/types";
import { cookies } from "next/headers";

interface RegisterInput {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  birthdate?: string;
}

async function forwardCookies(response: Response) {
  const cookieStore = await cookies();
  for (const setCookie of response.headers.getSetCookie()) {
    const [nameVal, ...attrs] = setCookie.split("; ");
    const eqIdx = nameVal.indexOf("=");
    const name = nameVal.slice(0, eqIdx);
    const value = nameVal.slice(eqIdx + 1);
    const options: Parameters<typeof cookieStore.set>[2] = {};
    for (const attr of attrs) {
      const lower = attr.toLowerCase();
      if (lower.startsWith("path=")) options.path = attr.slice(5);
      else if (lower.startsWith("max-age=")) options.maxAge = parseInt(attr.slice(8));
      else if (lower === "httponly") options.httpOnly = true;
      else if (lower === "secure") options.secure = true;
      else if (lower.startsWith("samesite="))
        options.sameSite = attr.slice(9).toLowerCase() as "strict" | "lax" | "none";
    }
    cookieStore.set(name, value, options);
  }
}

export async function register(input: RegisterInput): Promise<ActionResponse<{ userId: string }>> {
  try {
    const response = await auth.api.signUpEmail({
      body: {
        name: `${input.firstname} ${input.lastname}`,
        email: input.email,
        password: input.password,
        firstname: input.firstname,
        lastname: input.lastname,
        phone: input.phone,
        address: input.address,
        birthdate: input.birthdate ? new Date(input.birthdate) : undefined,
      },
      asResponse: true,
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      const msg: string = (body as { message?: string }).message ?? "";
      if (msg.toLowerCase().includes("already")) return { success: false, error: "Cet email est déjà utilisé" };
      return { success: false, error: "Échec de l'inscription" };
    }

    const data = await response.json() as { user?: { id: string } };
    if (!data.user) return { success: false, error: "Échec de l'inscription" };

    await forwardCookies(response);
    return { success: true, data: { userId: data.user.id } };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    if (message.includes("already")) return { success: false, error: "Cet email est déjà utilisé" };
    return { success: false, error: message };
  }
}

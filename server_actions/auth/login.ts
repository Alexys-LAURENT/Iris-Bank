"use server";

import { auth } from "@/lib/auth";
import { ActionResponse } from "@/types";
import { cookies } from "next/headers";

interface LoginInput {
  email: string;
  password: string;
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

export async function login(input: LoginInput): Promise<ActionResponse> {
  try {
    const response = await auth.api.signInEmail({
      body: { email: input.email, password: input.password },
      asResponse: true,
    });

    if (!response.ok) {
      return { success: false, error: "Email ou mot de passe incorrect" };
    }

    await forwardCookies(response);
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Email ou mot de passe incorrect" };
  }
}

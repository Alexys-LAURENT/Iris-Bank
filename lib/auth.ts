import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "sqlite",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,      // refresh if older than 1 day
  },
  user: {
    additionalFields: {
      firstname: { type: "string", required: false, defaultValue: "" },
      lastname: { type: "string", required: false, defaultValue: "" },
      phone: { type: "string", required: false },
      address: { type: "string", required: false },
      birthdate: { type: "date", required: false },
      isAdmin: { type: "boolean", required: false, defaultValue: false },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;

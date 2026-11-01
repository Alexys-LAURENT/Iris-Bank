/**
 * Seed using Bun's native SQLite (bun:sqlite) + direct SQL.
 * Avoids all adapter BigInt/segfault issues.
 */
import { Database } from "bun:sqlite";
import { generateIBAN } from "../lib/iban";

const db = new Database("./prisma/dev.db");

// ── helpers ──────────────────────────────────────────────────────────────────

function generateId(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 24);
}

async function hashPassword(password: string): Promise<string> {
  const { hashPassword: hp } = await import(
    "better-auth/crypto"
  );
  return hp(password);
}

function now(): string {
  return new Date().toISOString();
}

// ── seed ─────────────────────────────────────────────────────────────────────

async function createUser(opts: {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  isAdmin?: boolean;
}): Promise<string> {
  const id = generateId();
  const hashed = await hashPassword(opts.password);
  const ts = now();

  db.run(
    `INSERT INTO User (id, name, firstname, lastname, email, emailVerified, isAdmin, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)`,
    [
      id,
      `${opts.firstname} ${opts.lastname}`,
      opts.firstname,
      opts.lastname,
      opts.email,
      opts.isAdmin ? 1 : 0,
      ts,
      ts,
    ]
  );

  db.run(
    `INSERT INTO Account (id, userId, accountId, providerId, password, createdAt, updatedAt)
     VALUES (?, ?, ?, 'credential', ?, ?, ?)`,
    [generateId(), id, opts.email, hashed, ts, ts]
  );

  return id;
}

async function main() {
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  const clientPassword = process.env.SEED_CLIENT_PASSWORD;
  if (!adminPassword || !clientPassword) throw new Error("Set SEED_ADMIN_PASSWORD and SEED_CLIENT_PASSWORD before seeding");
  console.log("🌱 Seeding IrisBank database…");

  // Clean existing data
  db.run("DELETE FROM [Transaction]");
  db.run("DELETE FROM BankAccount");
  db.run("DELETE FROM Session");
  db.run("DELETE FROM Account");
  db.run("DELETE FROM Verification");
  db.run("DELETE FROM User");

  // Admin
  await createUser({
    firstname: "Admin",
    lastname: "IrisBank",
    email: "admin@irisbank.fr",
    password: adminPassword,
    isAdmin: true,
  });
  console.log("Demo accounts created; passwords are supplied only through local configuration.");

  // Test clients
  const clients = [
    { firstname: "Marie", lastname: "Dubois", email: "marie.dubois@exemple.fr" },
    { firstname: "Pierre", lastname: "Martin", email: "pierre.martin@exemple.fr" },
    { firstname: "Sophie", lastname: "Bernard", email: "sophie.bernard@exemple.fr" },
  ];

  for (const client of clients) {
    const userId = await createUser({
      ...client,
      password: clientPassword,
    });

    const accountTypes = ["COURANT", "LIVRET_A"] as const;
    for (const type of accountTypes) {
      const iban = generateIBAN().replace(/\s/g, "");
      const balance = Math.floor(Math.random() * 5000) + 500;
      const accountId = generateId();
      const ts = now();

      db.run(
        `INSERT INTO BankAccount (id, userId, iban, type, balance, isBlocked, createdAt)
         VALUES (?, ?, ?, ?, ?, 0, ?)`,
        [accountId, userId, iban, type, balance, ts]
      );

      db.run(
        `INSERT INTO [Transaction] (id, toAccountId, amount, type, description, createdAt)
         VALUES (?, ?, ?, 'DEPOSIT', 'Dépôt initial', ?)`,
        [generateId(), accountId, balance, ts]
      );

      db.run(
        `INSERT INTO [Transaction] (id, fromAccountId, amount, type, description, createdAt)
         VALUES (?, ?, 50, 'WITHDRAWAL', 'Retrait DAB', ?)`,
        [generateId(), accountId, ts]
      );

      db.run(`UPDATE BankAccount SET balance = ? WHERE id = ?`, [balance - 50, accountId]);
    }

  console.log("Demo accounts created; passwords are supplied only through local configuration.");
  }

  console.log("\n🎉 Seed terminé !\n");
  console.log("Comptes disponibles :");
  console.log("Demo accounts created; passwords are supplied only through local configuration.");
  console.log("Demo accounts created; passwords are supplied only through local configuration.");
  console.log("Demo accounts created; passwords are supplied only through local configuration.");
  console.log("Demo accounts created; passwords are supplied only through local configuration.");

  db.close();
}

main().catch((e) => {
  console.error(e);
  db.close();
  process.exit(1);
});

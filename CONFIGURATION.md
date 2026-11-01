# Local configuration

Copy `.env.example` to `.env` and set a unique `BETTER_AUTH_SECRET` plus local `SEED_ADMIN_PASSWORD` and `SEED_CLIENT_PASSWORD`. Bun loads the project environment when `bun prisma/seed.ts` runs. The seed deletes existing demo records: run it only against a disposable local database. The seed keeps the existing Better Auth password hash format and does not print passwords.

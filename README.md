> **Republication du projet.** Première activité Git conservée : **2026-03-28**. Ce projet a été republié le **2 novembre 2026**, après retrait des identifiants suivis, revue des données de démonstration et création d’un nouvel historique Git. La date de ce dépôt ne représente pas le début du projet.

# IrisBank

Application bancaire fictive développée dans le cadre d'un projet de Master 2. Elle simule un espace client et un back-office administrateur pour la gestion de comptes et de transactions.

---

## Stack technique

| Outil | Version | Rôle |
|---|---|---|
| **Next.js** | 16.2.1 | Framework fullstack (App Router, Server Components, Server Actions) |
| **TypeScript** | 5 | Typage strict sur l'ensemble du projet |
| **Tailwind CSS** | 4 | Styles utilitaires |
| **shadcn/UI** | — | Composants accessibles (Radix UI) |
| **Prisma** | 7 | ORM + migrations |
| **SQLite** | — | Base de données locale (fichier `prisma/dev.db`) |
| **better-auth** | 1.5.6 | Authentification (sessions, hash de mot de passe) |
| **react-hook-form + zod** | — | Validation des formulaires côté client |
| **Bun** | — | Runtime pour le seed (`bun prisma/seed.ts`) |

---

## Prérequis

- **Node.js** ≥ 20
- **Bun** ≥ 1.0 (utilisé uniquement pour le script de seed)
- Aucune base de données externe requise (SQLite fichier local)

---

## Installation

```bash
# 1. Installer les dépendances
npm install

# 2. Créer le fichier d'environnement
cp .env.example .env
# Puis éditez .env (voir section Variables d'environnement)

# 3. Créer la base de données et appliquer les migrations
npx prisma migrate dev

# 4. Peupler la base avec les données de test
npm run seed
```

---

## Variables d'environnement

Fichier `.env` à la racine du projet :

```env
DATABASE_URL="file:./prisma/dev.db"
BETTER_AUTH_SECRET=
BETTER_AUTH_URL="http://localhost:3000"
```

---

## Lancer l'application

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

---

## Comptes de test (après `npm run seed`)

| Rôle | Email | Mot de passe |
|---|---|---|
| Administrateur | `admin@irisbank.fr` | `[configured locally]` |
| Client | `marie.dubois@exemple.fr` | `[configured locally]` |
| Client | `pierre.martin@exemple.fr` | `[configured locally]` |
| Client | `sophie.bernard@exemple.fr` | `[configured locally]` |

---

## Fonctionnement général

### Authentification

Gérée par **better-auth**. Les pages de login et d'inscription appellent directement `signIn.email()` et `signUp.email()` du client better-auth depuis les Client Components — le navigateur reçoit ainsi le cookie de session automatiquement via le handler `/api/auth/[...all]`. La déconnexion utilise `signOut()` du même client.

> **Pourquoi pas des Server Actions pour l'auth ?**
> Les Server Actions ne peuvent pas forwarder les headers `Set-Cookie` de better-auth vers le navigateur de façon fiable. La solution correcte est d'appeler les méthodes du client auth directement depuis le navigateur.

### Protection des routes

- **`proxy.ts`** (équivalent du `middleware.ts` de Next.js 14/15, renommé en Next.js 16) : redirige les utilisateurs connectés hors de `/login` et `/register`.
- **Layout `(client)`** : vérifie la session serveur avec `auth.api.getSession()`, redirige vers `/login` si absente, vers `/admin/dashboard` si l'utilisateur est admin.
- **Layout `(admin)`** : vérifie la session et le champ `isAdmin`, redirige sinon.

### Opérations bancaires

Toutes les mutations (dépôt, retrait, virement, création de compte, blocage…) passent par des **Server Actions** dans `server_actions/`. Les pages utilisent des **Server Components** pour lire les données — aucun state client pour les lectures.

Les virements vérifient que le compte source n'est pas bloqué et que le solde est suffisant avant de persister la transaction.

---

## Architecture des dossiers

```
IrisBank/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (client)/                     # Espace client (URLs sans préfixe)
│   │   ├── layout.tsx                # Garde session + redirection admin
│   │   ├── dashboard/page.tsx
│   │   ├── accounts/
│   │   │   ├── page.tsx              # Liste des comptes
│   │   │   ├── new/page.tsx          # Ouvrir un nouveau compte
│   │   │   └── [id]/page.tsx         # Détail + historique
│   │   ├── transactions/page.tsx     # Dépôt / Retrait / Virement
│   │   ├── history/page.tsx          # Historique complet des opérations
│   │   └── profile/page.tsx
│   ├── (admin)/                      # Espace admin (URLs sous /admin/*)
│   │   ├── layout.tsx                # Garde session + isAdmin
│   │   └── admin/
│   │       ├── dashboard/page.tsx    # Stats globales
│   │       ├── clients/
│   │       │   ├── page.tsx          # Liste + recherche
│   │       │   └── [id]/page.tsx     # Détail client + modification
│   │       └── accounts/
│   │           ├── page.tsx          # Tous les comptes
│   │           └── [id]/page.tsx     # Détail + blocage/déblocage
│   └── api/
│       └── auth/[...all]/route.ts    # Handler better-auth
│
├── server_actions/                   # Une action métier = un fichier
│   ├── auth/         login.ts, register.ts, logout.ts
│   ├── accounts/     createAccount.ts, deleteAccount.ts, getAccountById.ts
│   ├── transactions/ deposit.ts, withdraw.ts, transfer.ts
│   └── admin/        getClients.ts, updateClient.ts, deleteClient.ts,
│                     blockAccount.ts, unblockAccount.ts, getStats.ts
│
├── components/
│   ├── ui/           Composants shadcn/UI (Button, Input, Label…)
│   └── layout/       ClientSidebar.tsx (Tableau de bord, Mes comptes, Opérations, Historique, Mon profil), AdminSidebar.tsx, Topbar.tsx
│
├── lib/
│   ├── auth.ts        Configuration better-auth (Prisma adapter)
│   ├── auth-client.ts Client better-auth (signIn, signOut, useSession…)
│   ├── prisma.ts      Singleton PrismaClient
│   └── iban.ts        Générateur d'IBAN FR valide (algo Luhn)
│
├── types/index.ts     Types partagés (ActionResponse<T>…)
│
├── prisma/
│   ├── schema.prisma  Schéma complet (User, BankAccount, Transaction…)
│   └── seed.ts        Script de seed (admin + 3 clients + comptes + transactions)
│
└── proxy.ts           Middleware Next.js 16 (remplace middleware.ts)
```

### Modèles de données

| Modèle | Description |
|---|---|
| `User` | Client ou admin (`isAdmin: boolean`), avec prénom, nom, téléphone, adresse, date de naissance |
| `BankAccount` | Compte bancaire (`COURANT`, `LIVRET_A`, `PEL`), solde, `isBlocked`, IBAN unique |
| `Transaction` | Dépôt, retrait ou virement (`DEPOSIT`, `WITHDRAWAL`, `TRANSFER`), avec comptes source/destination |
| `Session` | Session better-auth (token, expiration, IP) |
| `Account` | Compte OAuth better-auth (mot de passe hashé stocké ici) |
| `Verification` | Tokens de vérification better-auth |

---

## Choses importantes à savoir

### Next.js 16 — différences vs 14/15

- Le middleware s'appelle **`proxy.ts`** et exporte une fonction **`proxy`** (et non `middleware.ts` / `middleware`).
- L'API reste identique (`NextRequest`, `NextResponse`, `config.matcher`).

### Collision de route groups

Les route groups `(admin)` et `(client)` ne génèrent pas de segment d'URL. Pour éviter que `/accounts` (client) et `/accounts` (admin) entrent en conflit, toutes les pages admin sont placées sous `app/(admin)/admin/`, ce qui produit les URLs `/admin/dashboard`, `/admin/clients`, etc.

### Seed

Le script `prisma/seed.ts` utilise `bun:sqlite` directement (sans passer par le client Prisma) pour des raisons de compatibilité avec Bun. Il importe `hashPassword` depuis `better-auth/dist/crypto/password.mjs` pour hasher les mots de passe de la même façon que le ferait better-auth en production.

---

## Commandes utiles

```bash
# Développement
npm run dev                    # Démarre le serveur (Turbopack)

# Base de données
npx prisma migrate dev         # Crée/applique les migrations
npx prisma migrate reset       # Reset complet de la DB (supprime tout)
npx prisma studio              # Interface graphique pour explorer la DB
npm run seed                   # Insère les données de test (bun)

# Build & production
npm run build
npm start

# Qualité de code
npm run lint
```

## Historique du projet et contributions

État de l’ancien dépôt relevé le 2 novembre 2026 : **2 commits** sur la branche locale de référence, **0 étoile(s)** et **0 fork(s)**. Ces compteurs décrivent l’ancien dépôt, pas le nouvel historique.

Contributeurs GitHub de l’ancien dépôt : [Alexys-LAURENT](https://github.com/Alexys-LAURENT). Leur travail est conservé dans le code republié ; le nouvel historique ne reproduit pas leurs anciens commits.

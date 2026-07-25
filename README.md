# GoldVault Platform

GoldVault is a full-stack gold and cryptocurrency investment platform built
with React, Vite, Express, tRPC, Drizzle ORM, and MySQL.

## Requirements

- Node.js 24 LTS
- pnpm 10
- MySQL 8-compatible database

## Local setup

1. Copy `.env.example` to `.env` and configure the required values.
2. Install dependencies:

   ```bash
   pnpm install --frozen-lockfile
   ```

3. Apply the existing database migrations:

   ```bash
   pnpm exec drizzle-kit migrate
   ```

4. Start the development server:

   ```bash
   pnpm dev
   ```

## Verification

```bash
pnpm check
pnpm test
pnpm build
```

## Production

Build the client and server with `pnpm build`, then run `pnpm start` on Linux.
Use a single application process unless the in-process financial schedulers are
moved to a dedicated worker.

Do not commit `.env` files or private credentials. Deploy as a test environment
and use test funds until the platform has completed independent security,
custody, and regulatory reviews.

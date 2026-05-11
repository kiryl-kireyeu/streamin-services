# Streaming Service Transactions Dashboard

Test assignment project for a Senior Front-end Engineer role. The application will provide a transactions management dashboard for a streaming service subscriber.

The target user should be able to review payment history, download mock invoices, and retry failed payments in bulk.

## Project Plan

`PLAN.md` is the source of truth for the implementation scope, architecture, staged workflow, and acceptance criteria.

Implementation is intentionally staged. After each stage, the agent must stop, report verification results, and wait for user approval before continuing.

## Stack

- Next.js 16 with App Router
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui components
- pnpm
- Vitest and React Testing Library will be added during Stage 3

## Architecture

The project uses a feature-first structure:

- `src/app/` - Next.js routes and app shell
- `src/features/transactions/` - transaction feature domain code
- `src/features/transactions/components/` - dashboard UI components
- `src/features/transactions/hooks/` - stateful dashboard logic
- `src/features/transactions/lib/` - mock API and utilities
- `src/features/transactions/types.ts` - transaction domain types
- `src/components/ui/` - shadcn/ui components
- `src/lib/` - shared utilities

## Development

Install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

Open `http://localhost:3000`.

## Verification

Run linting:

```bash
pnpm lint
```

Run a production build:

```bash
pnpm build
```

Testing will be configured during Stage 3. After that stage, use:

```bash
pnpm test
```

## Notes

- The project does not use a real backend.
- Transaction data and payment retry APIs will be simulated.
- Invoice download will generate a dummy browser download.
- Browser-based behavior should be verified manually after UI stages.

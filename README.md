# Streaming Service Transactions Dashboard

Test assignment project for a Senior Front-end Engineer role. The application provides a transactions management dashboard for a streaming service subscriber.

Users can review payment history, download mock PDF invoices, and retry failed payments in bulk while each row keeps an independent loading state.

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
- Vitest
- React Testing Library
- jsdom

## Features

- Responsive transactions dashboard.
- Transaction ID, amount, date and time, status, and invoice action columns.
- Failed transactions can be selected for retry.
- Non-failed transactions are not selectable.
- `Retry Selected` is disabled until at least one failed transaction is selected.
- Selected failed transactions retry concurrently with independent row states.
- Retry simulation resolves after a random delay between 1 and 4 seconds.
- Retry outcome is simulated as 80% success and 20% failure.
- Invoice generation shows a row-level 2-second loading state.
- Invoice download creates a valid dummy PDF file.
- Toast notifications confirm invoice downloads.
- Server Component page with a small Client Component boundary for interactive dashboard behavior.
- Suspense fallback for streamed dashboard content.

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

Run tests:

```bash
pnpm test
```

Run a production build:

```bash
pnpm build
```

Before final delivery, verify the dashboard in a browser:

- the page loads without console errors;
- desktop and mobile layouts are usable;
- invoice download produces an openable PDF;
- bulk retry rows resolve independently.

## Documentation MCP

Project MCP servers are configured in `.mcp.json`:

- `next-devtools` for current Next.js guidance.
- `context7` for current framework and library documentation.
- `shadcn` for shadcn/ui registry and component guidance.

## Notes

- The project does not use a real backend.
- Transaction data and payment retry APIs are simulated.
- Invoice download generates a dummy PDF browser download.
- `PLAN.md` is the source of truth for implementation scope and staged workflow.

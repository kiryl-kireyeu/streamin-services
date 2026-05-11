# Transactions Management Dashboard Implementation Plan

## Summary
Build a production-quality test assignment project from scratch in this repository using **Next.js, React, TypeScript, Tailwind CSS, shadcn/ui, Vitest, and React Testing Library**.

The application will implement a transactions management dashboard where users can review payment history, download mock invoices, and retry failed payments in bulk with independent concurrent row states.

`PLAN.md` is the source of truth for implementation scope. It may only be changed after explicit user approval.

## Documentation MCP Setup
The repository should provide MCP access for current framework documentation before implementation starts.

Configured project MCP servers:

- **next-devtools**
  - Purpose: Next.js App Router guidance, runtime diagnostics, project structure, client/server component boundaries, metadata, build behavior, and testing compatibility.
  - Source: official Next.js MCP guidance recommends `next-devtools-mcp@latest` for Next.js 16+ projects.
- **context7**
  - Purpose: current library documentation lookup for Tailwind CSS, Next.js, Vitest, React Testing Library, and related packages.
  - Preferred documentation IDs:
    - Next.js: `/vercel/next.js` or `/websites/nextjs`
    - Tailwind CSS: `/tailwindlabs/tailwindcss.com`
    - shadcn/ui: `/shadcn-ui/ui`
- **shadcn**
  - Purpose: browse, search, and install shadcn/ui registry components through the shadcn MCP server.

The agent must use these documentation resources when framework-specific uncertainty exists. If an MCP server is unavailable, the agent may use internet access to verify official documentation and must mention the fallback in its report.

## Implementation Stages
The implementation must be done stage by stage. After completing each stage, the agent must stop, report what was completed, list verification results, and wait for user approval before moving to the next stage.

### Stage 1: Project Bootstrap
- Initialize a new Next.js App Router project with TypeScript, Tailwind, ESLint, and `pnpm`.
- Add shadcn/ui configuration.
- Install only the shadcn/ui components required for the task.
- Initialize git only if the directory is still not a repository.
- Verify with `pnpm lint` or the closest available initial check.

### Stage 2: Documentation and Agent Rules
- Create or update `PLAN.md` only with explicit user approval.
- Create `AGENTS.md`.
- Create `CLAUDE.md`.
- Create `README.md` with setup, development, test, and build instructions.

`AGENTS.md` must include:

- A direct reference to `PLAN.md`, instructing agents to read it before making changes.
- The project architecture.
- Agents may work only inside the current repository directory.
- Agents may modify files inside the current repository directory.
- Agents must not modify data outside the repository.
- Agents may use internet access, when available, to search for current information and validate assumptions.
- Agents must use the configured documentation MCP resources for Next.js, Tailwind CSS, and shadcn/ui when framework-specific uncertainty exists.
- Agents must write production-quality code ready for real use.
- Agents must keep code clean, typed, maintainable, and aligned with the plan.
- Agents must consider UI performance.
- Agents may modify `PLAN.md` only after explicit user approval.

### Stage 3: Testing Environment
- Install and configure Vitest, React Testing Library, `@testing-library/jest-dom`, and jsdom.
- Add `vitest.config.ts` and a test setup file.
- Add scripts:
  - `test`
  - `test:watch`
  - keep `lint`
  - keep `build`
- Add one smoke test to verify the test environment works.

### Stage 4: Scalable Architecture and Mock Domain
Use a feature-first structure:

- `src/app/` for Next.js routes and app shell.
- `src/features/transactions/` for transaction domain code.
- `src/features/transactions/components/` for dashboard UI.
- `src/features/transactions/hooks/` for stateful dashboard logic.
- `src/features/transactions/lib/` for mock API and utilities.
- `src/features/transactions/types.ts` for domain types.
- `src/components/ui/` for shadcn/ui components.
- `src/lib/` for shared utilities.

Implement:

- `TransactionStatus = "Success" | "Failed" | "Pending"`
- `Transaction`
- `RetryPaymentResult`
- Mock transaction data with several failed transactions.
- `getTransactions()`
- `generateInvoice(transaction)`
- `retryPayment(transactionId)`

Before closing this stage, create a subagent dedicated to tests:

- Unit tests for pure functions and mock API behavior.
- 1-5 focused tests total for this stage.
- Use fake timers where delay behavior is tested.

### Stage 5: Dashboard UI
Build the responsive dashboard using Tailwind and shadcn/ui.

Use shadcn components such as:

- `Button`
- `Checkbox`
- `Table`
- `Badge`
- toast/notification component

The UI must display:

- transaction ID
- amount
- date and time
- status
- invoice action

Behavior:

- Failed rows show selectable checkboxes.
- Non-failed rows are not selectable for retry.
- `Retry Selected` is disabled when no failed rows are selected.
- The layout must work on desktop and mobile widths.
- The design must be restrained, practical, and dashboard-like.

Before closing this stage, create a subagent dedicated to tests:

- RTL tests for rendering and selection behavior.
- 1-5 focused tests total for this stage.

### Stage 6: Invoice Download Flow
Implement per-row invoice download behavior:

- Clicking `Download Invoice` starts a 2-second generating state for that row only.
- After 2 seconds, trigger browser download of a dummy invoice file.
- Show a notification when the dummy invoice has been downloaded.
- Other rows remain interactive while one invoice is generating.

Before closing this stage, create a subagent dedicated to tests:

- RTL tests for generating state and completion notification.
- Unit tests for any pure invoice helper.
- 1-5 focused tests total for this stage.

### Stage 7: Concurrent Bulk Retry Flow
Implement failed payment retry behavior:

- Users can select multiple failed rows.
- Clicking `Retry Selected` starts retries for selected rows concurrently.
- Each row has an independent loading state.
- Each mock API call resolves after a random delay between 1 and 4 seconds.
- Each retry has an 80% success / 20% failure outcome.
- Successful retry changes the row to `Success`.
- Failed retry leaves the row as `Failed`.
- Completed rows are removed from selection.
- The table remains interactive while row-level operations run.

Before closing this stage, create a subagent dedicated to tests:

- RTL tests for selected rows entering loading state.
- Tests for independent row completion.
- Tests for success and failure outcomes.
- 1-5 focused tests total for this stage.

### Stage 8: Final Polish and Verification
- Review code organization, naming, accessibility, and UI states.
- Check interface performance and avoid unnecessary broad rerenders where practical.
- Ensure no unused dependencies or dead code remain.
- Run final verification:
  - `pnpm lint`
  - `pnpm test`
  - `pnpm build`
- Manually verify in browser:
  - page loads without console errors;
  - layout works on desktop and mobile;
  - invoice download triggers a dummy file;
  - concurrent retry rows resolve independently.

## Subagent Testing Rule
Whenever the main agent implements a functional area or reusable component, it must create a subagent responsible for tests.

Testing expectations:

- Pure functions: unit tests.
- React components and user flows: React Testing Library tests.
- Coverage target for this test assignment: **1-5 focused tests per stage or feature**, not exhaustive coverage.
- Tests must cover the highest-risk behavior rather than implementation details.

## Public Interfaces
- `TransactionStatus`
- `Transaction`
- `RetryPaymentResult`
- `getTransactions()`
- `generateInvoice(transaction)`
- `retryPayment(transactionId)`
- A focused dashboard hook, for example `useTransactionsDashboard`, to keep state behavior testable outside the page component.

## Assumptions
- Package manager: `pnpm`.
- Styling: Tailwind CSS plus shadcn/ui.
- Test runner: Vitest.
- Component testing: React Testing Library with jsdom.
- The project starts from the currently empty directory.
- Real backend, authentication, persistence, and server API routes are out of scope.
- Browser download uses a generated Blob with a dummy invoice filename.
- The agent must pause after each implementation stage and wait for user approval before continuing.
- `PLAN.md` can only be changed after explicit user approval.

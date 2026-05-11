<!-- BEGIN:nextjs-agent-rules -->
# Next.js Version-Specific Rules

This project uses Next.js 16, which may differ from older training-data assumptions. Before writing framework-specific code, check the relevant local documentation in `node_modules/next/dist/docs/` or the configured Next.js MCP resources. Follow deprecation notices.
<!-- END:nextjs-agent-rules -->

# Agent Instructions

## Source of Truth
Read `PLAN.md` before making any changes. The plan defines the project scope, stack, architecture, implementation stages, testing expectations, and approval gates.

Do not modify `PLAN.md` unless the user explicitly approves the change.

## Working Directory Rules
- Work only inside the current repository directory.
- You may modify files inside the current repository directory.
- You must not modify data outside the repository.
- Do not rely on files, services, or state outside this repository unless the user explicitly asks for it.

## Documentation and Internet Access
- You may use internet access, when available, to search for current information and validate assumptions.
- Use the configured MCP documentation resources when framework-specific uncertainty exists:
  - `next-devtools` for Next.js App Router and runtime guidance.
  - `context7` for current documentation, especially:
    - Next.js: `/vercel/next.js` or `/websites/nextjs`
    - Tailwind CSS: `/tailwindlabs/tailwindcss.com`
    - shadcn/ui: `/shadcn-ui/ui`
  - `shadcn` for shadcn/ui registry lookup and component installation guidance.
- If MCP access is unavailable, use official documentation from the internet and mention the fallback in your report.

## Architecture
Use the feature-first architecture defined in `PLAN.md`:

- `src/app/` for Next.js routes and app shell.
- `src/features/transactions/` for transaction domain code.
- `src/features/transactions/components/` for dashboard UI.
- `src/features/transactions/hooks/` for stateful dashboard logic.
- `src/features/transactions/lib/` for mock API and utilities.
- `src/features/transactions/types.ts` for domain types.
- `src/components/ui/` for shadcn/ui components.
- `src/lib/` for shared utilities.

Keep business logic testable outside page components.

## Implementation Discipline
- Follow the implementation stages in `PLAN.md`.
- After each implementation stage, stop and wait for user approval before moving to the next stage.
- After each stage, report:
  - completed work;
  - files changed;
  - checks/tests run;
  - known issues or risks;
  - next stage preview;
  - explicit note that the agent is waiting for approval.
- When implementing functionality or reusable components, create a subagent dedicated to tests:
  - unit tests for pure functions;
  - React Testing Library tests for components and user flows;
  - 1-5 focused tests per feature or stage.
- Write production-quality code ready for real use.
- Keep code clean, typed, maintainable, cohesive, and aligned with the plan.
- Consider UI performance when implementing or changing interface code.
- Avoid unnecessary dependencies and abstractions.
- Do not implement real backend, authentication, persistence, or server API routes unless the plan is explicitly changed.
- If implementation requires deviating from `PLAN.md`, stop and ask the user for approval before changing direction.

## Git Safety
- Check `git status` before making changes when the repository has been initialized.
- Do not revert, overwrite, or discard changes made by the user or another agent.
- Do not commit, push, create branches, or open pull requests unless the user explicitly asks.
- Do not run destructive commands such as `rm -rf`, `git reset --hard`, or broad checkout/restore commands without explicit user approval.

## Dependency Policy
- Do not add dependencies unless they are justified by the plan or clearly reduce implementation risk.
- Prefer built-in Next.js, React, Tailwind, and shadcn/ui capabilities before adding packages.
- When adding a dependency, explain whether it is runtime or dev-only and why it is needed.

## Next.js Rendering and Performance
- Prefer React Server Components by default.
- Use Client Components only where interactivity, browser APIs, or client-side state are required.
- Keep client component boundaries small and close to interactive UI.
- Use Streaming with Suspense where it improves perceived loading or separates async UI states cleanly.
- Avoid moving mock/business logic into large client-only page components.
- Keep Core Web Vitals in the green zone:
  - optimize LCP by avoiding heavy first-render client JavaScript and oversized above-the-fold content;
  - protect CLS with stable dimensions for tables, controls, loading states, and responsive layouts;
  - protect INP by keeping event handlers lightweight and row-level updates targeted.
- After UI stages, verify that the interface remains responsive and does not introduce obvious layout shifts.

## UI and Accessibility
- Build the actual dashboard as the first screen; do not create a marketing landing page.
- Keep the interface restrained, practical, and dashboard-like.
- Avoid decorative hero sections, decorative gradients, gradient orbs, and visual filler.
- Use stable dimensions for controls, table rows, status badges, loading indicators, and action buttons.
- Ensure all interactive elements have accessible names.
- Ensure checkbox and button flows are keyboard-accessible.
- Ensure loading and disabled states are understandable to users and assistive technologies where practical.
- Do not let text overflow or overlap at desktop or mobile widths.

## Testing Discipline
- New pure logic should have unit tests.
- New React components and user flows should have React Testing Library tests.
- Tests should verify behavior, not implementation details.
- Use fake timers for delay-based behavior such as invoice generation and payment retry simulation.
- Keep test coverage focused for this assignment: 1-5 high-value tests per feature or stage.

## Browser Verification
- After UI-related stages, run the local dev server when available and verify the app in a browser.
- Check at least one desktop viewport and one mobile viewport.
- Check for visible layout issues, broken interactions, and console errors.
- Do not leave required dev server sessions running after verification unless the user asks.

## Environment and Secrets
- Do not create `.env` or `.env.local` unless required by an approved plan change.
- Do not store API keys, tokens, credentials, or secrets in the repository.
- Do not depend on private local machine state for application behavior.

## Verification
Use the verification commands defined in `PLAN.md` as they become available:

- `pnpm lint`
- `pnpm test`
- `pnpm build`

Report any command that cannot be run and explain why.

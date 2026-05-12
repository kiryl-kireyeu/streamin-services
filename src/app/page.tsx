import { Suspense } from "react";
import { getTransactions, TransactionsDashboard } from "@/features/transactions";

function TransactionsDashboardFallback() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="h-28 rounded-lg border bg-muted/40" />
      <div className="h-96 rounded-lg border bg-muted/30" />
    </div>
  );
}

async function TransactionsPageContent() {
  const transactions = await getTransactions();

  return <TransactionsDashboard transactions={transactions} />;
}

export default function Home() {
  return (
    <main className="flex min-h-dvh bg-background">
      <Suspense fallback={<TransactionsDashboardFallback />}>
        <TransactionsPageContent />
      </Suspense>
    </main>
  );
}

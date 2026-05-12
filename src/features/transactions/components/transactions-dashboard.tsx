"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTransactionsDashboard } from "../hooks/use-transactions-dashboard";
import {
  formatTransactionAmount,
  formatTransactionDateTime,
} from "../lib/formatters";
import type { Transaction, TransactionStatus } from "../types";

type TransactionsDashboardProps = {
  transactions: readonly Transaction[];
};

const statusStyles: Record<TransactionStatus, string> = {
  Success:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
  Failed:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300",
  Pending:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
};

export function TransactionsDashboard({
  transactions,
}: TransactionsDashboardProps) {
  const {
    selectedRetryCount,
    isRetrySelectionEmpty,
    isTransactionSelected,
    isInvoiceGenerating,
    downloadInvoice,
    toggleTransactionSelection,
  } = useTransactionsDashboard(transactions);

  return (
    <section
      aria-labelledby="transactions-heading"
      className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8"
    >
      <div className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Subscription billing
          </p>
          <h1
            id="transactions-heading"
            className="text-2xl font-semibold tracking-normal text-foreground sm:text-3xl"
          >
            Transactions
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            Review recent payments, identify failed charges, and prepare bulk
            retries.
          </p>
        </div>

        <Button disabled={isRetrySelectionEmpty} className="w-full sm:w-auto">
          Retry Selected
          {selectedRetryCount > 0 ? ` (${selectedRetryCount})` : null}
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <span className="sr-only">Select failed transaction</span>
              </TableHead>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date and time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Invoice</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => {
              const isFailed = transaction.status === "Failed";
              const invoiceGenerating = isInvoiceGenerating(transaction.id);

              return (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {isFailed ? (
                      <Checkbox
                        aria-label={`Select failed transaction ${transaction.id}`}
                        checked={isTransactionSelected(transaction.id)}
                        onCheckedChange={() =>
                          toggleTransactionSelection(transaction.id)
                        }
                      />
                    ) : null}
                  </TableCell>
                  <TableCell className="font-medium">
                    {transaction.id}
                  </TableCell>
                  <TableCell>
                    {formatTransactionAmount(
                      transaction.amount,
                      transaction.currency,
                    )}
                  </TableCell>
                  <TableCell>
                    {formatTransactionDateTime(transaction.dateTime)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={statusStyles[transaction.status]}
                    >
                      {transaction.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      aria-label={`Download invoice ${transaction.invoiceNumber}`}
                      disabled={invoiceGenerating}
                      onClick={() => void downloadInvoice(transaction)}
                    >
                      {invoiceGenerating ? "Generating..." : "Download Invoice"}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

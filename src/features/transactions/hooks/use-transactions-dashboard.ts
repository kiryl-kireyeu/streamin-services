"use client";

import { useMemo, useState } from "react";
import type { Transaction } from "../types";

export const useTransactionsDashboard = (
  initialTransactions: readonly Transaction[],
) => {
  const [selectedTransactionIds, setSelectedTransactionIds] = useState<
    Set<Transaction["id"]>
  >(() => new Set());

  const failedTransactionIds = useMemo(
    () =>
      new Set(
        initialTransactions
          .filter((transaction) => transaction.status === "Failed")
          .map((transaction) => transaction.id),
      ),
    [initialTransactions],
  );

  const selectedRetryCount = selectedTransactionIds.size;

  const isTransactionSelected = (transactionId: Transaction["id"]) =>
    selectedTransactionIds.has(transactionId);

  const toggleTransactionSelection = (transactionId: Transaction["id"]) => {
    if (!failedTransactionIds.has(transactionId)) {
      return;
    }

    setSelectedTransactionIds((currentSelection) => {
      const nextSelection = new Set(currentSelection);

      if (nextSelection.has(transactionId)) {
        nextSelection.delete(transactionId);
      } else {
        nextSelection.add(transactionId);
      }

      return nextSelection;
    });
  };

  return {
    selectedRetryCount,
    isRetrySelectionEmpty: selectedRetryCount === 0,
    isTransactionSelected,
    toggleTransactionSelection,
  };
};

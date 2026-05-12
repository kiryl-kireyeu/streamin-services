"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { downloadInvoiceFile } from "../lib/download-invoice-file";
import { generateInvoice } from "../lib/mock-api";
import type { Transaction } from "../types";

export const useTransactionsDashboard = (
  initialTransactions: readonly Transaction[],
) => {
  const [selectedTransactionIds, setSelectedTransactionIds] = useState<
    Set<Transaction["id"]>
  >(() => new Set());
  const [generatingInvoiceIds, setGeneratingInvoiceIds] = useState<
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

  const isInvoiceGenerating = (transactionId: Transaction["id"]) =>
    generatingInvoiceIds.has(transactionId);

  const downloadInvoice = async (transaction: Transaction) => {
    let shouldStartDownload = false;

    setGeneratingInvoiceIds((currentIds) => {
      if (currentIds.has(transaction.id)) {
        return currentIds;
      }

      const nextIds = new Set(currentIds);
      nextIds.add(transaction.id);
      shouldStartDownload = true;

      return nextIds;
    });

    if (!shouldStartDownload) {
      return;
    }

    try {
      const invoiceFile = await generateInvoice(transaction);
      downloadInvoiceFile(invoiceFile);
      toast.success(`Invoice ${transaction.invoiceNumber} downloaded.`);
    } catch {
      toast.error(`Invoice ${transaction.invoiceNumber} could not be downloaded.`);
    } finally {
      setGeneratingInvoiceIds((currentIds) => {
        const nextIds = new Set(currentIds);
        nextIds.delete(transaction.id);

        return nextIds;
      });
    }
  };

  return {
    selectedRetryCount,
    isRetrySelectionEmpty: selectedRetryCount === 0,
    isTransactionSelected,
    isInvoiceGenerating,
    downloadInvoice,
    toggleTransactionSelection,
  };
};

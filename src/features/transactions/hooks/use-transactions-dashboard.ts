"use client";

import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { downloadInvoiceFile } from "../lib/download-invoice-file";
import { generateInvoice, retryPayment } from "../lib/mock-api";
import type { Transaction } from "../types";

export const useTransactionsDashboard = (
  initialTransactions: readonly Transaction[],
) => {
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    initialTransactions.map((transaction) => ({ ...transaction })),
  );
  const [selectedTransactionIds, setSelectedTransactionIds] = useState<
    Set<Transaction["id"]>
  >(() => new Set());
  const [generatingInvoiceIds, setGeneratingInvoiceIds] = useState<
    Set<Transaction["id"]>
  >(() => new Set());
  const generatingInvoiceIdsRef = useRef<Set<Transaction["id"]>>(new Set());
  const [retryingTransactionIds, setRetryingTransactionIds] = useState<
    Set<Transaction["id"]>
  >(() => new Set());

  const failedTransactionIds = useMemo(
    () =>
      new Set(
        transactions
          .filter((transaction) => transaction.status === "Failed")
          .map((transaction) => transaction.id),
      ),
    [transactions],
  );

  const selectedRetryableTransactionIds = useMemo(
    () =>
      [...selectedTransactionIds].filter(
        (transactionId) =>
          failedTransactionIds.has(transactionId) &&
          !retryingTransactionIds.has(transactionId),
      ),
    [failedTransactionIds, retryingTransactionIds, selectedTransactionIds],
  );

  const selectedRetryCount = selectedRetryableTransactionIds.length;

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

  const isTransactionRetrying = (transactionId: Transaction["id"]) =>
    retryingTransactionIds.has(transactionId);

  const retrySelectedPayments = () => {
    const retryTransactionIds = selectedRetryableTransactionIds;

    if (retryTransactionIds.length === 0) {
      return;
    }

    setRetryingTransactionIds((currentIds) => {
      const nextIds = new Set(currentIds);

      for (const transactionId of retryTransactionIds) {
        nextIds.add(transactionId);
      }

      return nextIds;
    });

    for (const transactionId of retryTransactionIds) {
      void retryPayment(transactionId)
        .then((result) => {
          setTransactions((currentTransactions) =>
            currentTransactions.map((transaction) =>
              transaction.id === result.transactionId
                ? { ...transaction, status: result.status }
                : transaction,
            ),
          );
        })
        .catch(() => {
          setTransactions((currentTransactions) =>
            currentTransactions.map((transaction) =>
              transaction.id === transactionId
                ? { ...transaction, status: "Failed" }
                : transaction,
            ),
          );
        })
        .finally(() => {
          setSelectedTransactionIds((currentSelection) => {
            const nextSelection = new Set(currentSelection);
            nextSelection.delete(transactionId);

            return nextSelection;
          });
          setRetryingTransactionIds((currentIds) => {
            const nextIds = new Set(currentIds);
            nextIds.delete(transactionId);

            return nextIds;
          });
        });
    }
  };

  const downloadInvoice = async (transaction: Transaction) => {
    if (generatingInvoiceIdsRef.current.has(transaction.id)) {
      return;
    }

    generatingInvoiceIdsRef.current.add(transaction.id);
    setGeneratingInvoiceIds(new Set(generatingInvoiceIdsRef.current));

    try {
      const invoiceFile = await generateInvoice(transaction);
      downloadInvoiceFile(invoiceFile);
      toast.success(`Invoice ${transaction.invoiceNumber} downloaded.`);
    } catch {
      toast.error(`Invoice ${transaction.invoiceNumber} could not be downloaded.`);
    } finally {
      generatingInvoiceIdsRef.current.delete(transaction.id);
      setGeneratingInvoiceIds(new Set(generatingInvoiceIdsRef.current));
    }
  };

  return {
    transactions,
    selectedRetryCount,
    isRetrySelectionEmpty: selectedRetryCount === 0,
    isTransactionSelected,
    isInvoiceGenerating,
    isTransactionRetrying,
    downloadInvoice,
    retrySelectedPayments,
    toggleTransactionSelection,
  };
};

import {
  INVOICE_GENERATION_DELAY_MS,
  RETRY_PAYMENT_FAILURE_RATE,
  RETRY_PAYMENT_MAX_DELAY_MS,
  RETRY_PAYMENT_MIN_DELAY_MS,
} from "./constants";
import { MOCK_TRANSACTIONS } from "./mock-data";
import type {
  GenerateInvoiceOptions,
  InvoiceFile,
  RetryPaymentOptions,
  RetryPaymentResult,
  Transaction,
} from "../types";

const delay = (milliseconds: number) =>
  new Promise<void>((resolve) => {
    globalThis.setTimeout(resolve, milliseconds);
  });

export const cloneTransaction = (transaction: Transaction): Transaction => ({
  ...transaction,
});

export const getRetryPaymentDelayMs = (random = Math.random) => {
  const delayRange = RETRY_PAYMENT_MAX_DELAY_MS - RETRY_PAYMENT_MIN_DELAY_MS;

  return RETRY_PAYMENT_MIN_DELAY_MS + Math.round(random() * delayRange);
};

export const createInvoiceFile = (transaction: Transaction): InvoiceFile => ({
  fileName: `${transaction.invoiceNumber}.pdf`,
  mimeType: "application/pdf",
  content: [
    "Streaming Service Invoice",
    `Invoice: ${transaction.invoiceNumber}`,
    `Transaction: ${transaction.id}`,
    `Amount: ${transaction.amount.toFixed(2)} ${transaction.currency}`,
    `Date: ${new Date(transaction.dateTime).toISOString()}`,
    `Status: ${transaction.status}`,
  ].join("\n"),
});

export const getTransactions = async (): Promise<Transaction[]> =>
  MOCK_TRANSACTIONS.map(cloneTransaction);

export const generateInvoice = async (
  transaction: Transaction,
  options: GenerateInvoiceOptions = {},
): Promise<InvoiceFile> => {
  await delay(options.delayMs ?? INVOICE_GENERATION_DELAY_MS);

  return createInvoiceFile(transaction);
};

export const retryPayment = async (
  transactionId: string,
  options: RetryPaymentOptions = {},
): Promise<RetryPaymentResult> => {
  await delay(options.delayMs ?? getRetryPaymentDelayMs());

  const outcomeRandom = options.outcomeRandom ?? Math.random;
  const status =
    outcomeRandom() < RETRY_PAYMENT_FAILURE_RATE ? "Failed" : "Success";

  return {
    transactionId,
    status,
    attemptedAt: (options.now ?? (() => new Date()))().toISOString(),
  };
};

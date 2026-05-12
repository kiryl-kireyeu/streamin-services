export const TRANSACTION_STATUSES = ["Success", "Failed", "Pending"] as const;

export type TransactionStatus = (typeof TRANSACTION_STATUSES)[number];

export type Transaction = {
  id: string;
  amount: number;
  currency: string;
  dateTime: string;
  status: TransactionStatus;
  invoiceNumber: string;
};

export type InvoiceFile = {
  fileName: string;
  mimeType: "application/pdf";
  content: string;
};

export type RetryPaymentResult = {
  transactionId: string;
  status: Extract<TransactionStatus, "Success" | "Failed">;
  attemptedAt: string;
};

export type RetryPaymentOptions = {
  delayMs?: number;
  outcomeRandom?: () => number;
  now?: () => Date;
};

export type GenerateInvoiceOptions = {
  delayMs?: number;
};

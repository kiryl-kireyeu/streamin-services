import type { Transaction } from "../types";

export const MOCK_TRANSACTIONS: readonly Transaction[] = [
  {
    id: "txn_1001",
    amount: 19.99,
    currency: "USD",
    dateTime: "2026-05-01T09:14:00.000Z",
    status: "Success",
    invoiceNumber: "INV-2026-1001",
  },
  {
    id: "txn_1002",
    amount: 19.99,
    currency: "USD",
    dateTime: "2026-04-01T09:12:00.000Z",
    status: "Failed",
    invoiceNumber: "INV-2026-1002",
  },
  {
    id: "txn_1003",
    amount: 24.99,
    currency: "USD",
    dateTime: "2026-03-01T09:16:00.000Z",
    status: "Success",
    invoiceNumber: "INV-2026-1003",
  },
  {
    id: "txn_1004",
    amount: 24.99,
    currency: "USD",
    dateTime: "2026-02-01T09:11:00.000Z",
    status: "Failed",
    invoiceNumber: "INV-2026-1004",
  },
  {
    id: "txn_1005",
    amount: 19.99,
    currency: "USD",
    dateTime: "2026-01-01T09:10:00.000Z",
    status: "Pending",
    invoiceNumber: "INV-2026-1005",
  },
  {
    id: "txn_1006",
    amount: 19.99,
    currency: "USD",
    dateTime: "2025-12-01T09:13:00.000Z",
    status: "Failed",
    invoiceNumber: "INV-2025-1006",
  },
];

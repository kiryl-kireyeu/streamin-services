import type { Transaction } from "../types";

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

export const formatTransactionAmount = (
  amount: Transaction["amount"],
  currency: Transaction["currency"],
) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);

export const formatTransactionDateTime = (
  dateTime: Transaction["dateTime"],
) => DATE_TIME_FORMATTER.format(new Date(dateTime));

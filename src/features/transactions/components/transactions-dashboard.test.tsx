import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { getTransactions } from "../lib/mock-api";
import { TransactionsDashboard } from "./transactions-dashboard";

const renderDashboard = async () => {
  const transactions = await getTransactions();

  render(<TransactionsDashboard transactions={transactions} />);

  return { transactions };
};

describe("TransactionsDashboard", () => {
  it("renders transaction rows and invoice actions", async () => {
    const { transactions } = await renderDashboard();

    for (const transaction of transactions) {
      expect(screen.getByText(transaction.id)).toBeInTheDocument();
      expect(
        screen.getByRole("button", {
          name: `Download invoice ${transaction.invoiceNumber}`,
        }),
      ).toBeInTheDocument();
    }

    expect(
      screen.getAllByRole("button", { name: /download invoice/i }),
    ).toHaveLength(transactions.length);
  });

  it("shows selectable checkboxes for failed rows", async () => {
    const { transactions } = await renderDashboard();
    const failedTransactions = transactions.filter(
      (transaction) => transaction.status === "Failed",
    );

    for (const transaction of failedTransactions) {
      expect(
        screen.getByRole("checkbox", {
          name: `Select failed transaction ${transaction.id}`,
        }),
      ).toBeInTheDocument();
    }

    expect(screen.getAllByRole("checkbox")).toHaveLength(
      failedTransactions.length,
    );
  });

  it("does not show selection controls for non-failed rows", async () => {
    const { transactions } = await renderDashboard();
    const nonFailedTransactions = transactions.filter(
      (transaction) => transaction.status !== "Failed",
    );

    for (const transaction of nonFailedTransactions) {
      const row = screen.getByRole("row", { name: new RegExp(transaction.id) });

      expect(within(row).queryByRole("checkbox")).not.toBeInTheDocument();
    }
  });

  it("disables retry with no selection and enables it with the selected count", async () => {
    const user = userEvent.setup();

    await renderDashboard();

    expect(
      screen.getByRole("button", { name: "Retry Selected" }),
    ).toBeDisabled();

    await user.click(
      screen.getByRole("checkbox", {
        name: "Select failed transaction txn_1002",
      }),
    );

    expect(
      screen.getByRole("button", { name: "Retry Selected (1)" }),
    ).toBeEnabled();

    await user.click(
      screen.getByRole("checkbox", {
        name: "Select failed transaction txn_1004",
      }),
    );

    expect(
      screen.getByRole("button", { name: "Retry Selected (2)" }),
    ).toBeEnabled();
  });
});

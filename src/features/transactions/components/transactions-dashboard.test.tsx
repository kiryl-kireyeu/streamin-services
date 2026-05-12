import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { getTransactions } from "../lib/mock-api";
import { downloadInvoiceFile } from "../lib/download-invoice-file";
import { TransactionsDashboard } from "./transactions-dashboard";

const { toastErrorMock, toastSuccessMock } = vi.hoisted(() => ({
  toastErrorMock: vi.fn(),
  toastSuccessMock: vi.fn(),
}));

vi.mock("../lib/download-invoice-file", () => ({
  downloadInvoiceFile: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: toastSuccessMock,
    error: toastErrorMock,
  },
}));

const renderDashboard = async () => {
  const transactions = await getTransactions();

  render(<TransactionsDashboard transactions={transactions} />);

  return { transactions };
};

describe("TransactionsDashboard", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

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

  it("shows generating state only for the clicked invoice row while download is pending", async () => {
    vi.useFakeTimers();

    await renderDashboard();

    const activeInvoiceButton = screen.getByRole("button", {
      name: "Download invoice INV-2026-1002",
    });
    const otherInvoiceButton = screen.getByRole("button", {
      name: "Download invoice INV-2026-1001",
    });

    fireEvent.click(activeInvoiceButton);

    expect(activeInvoiceButton).toBeDisabled();
    expect(activeInvoiceButton).toHaveTextContent("Generating...");
    expect(otherInvoiceButton).toBeEnabled();
    expect(otherInvoiceButton).toHaveTextContent("Download Invoice");
    expect(downloadInvoiceFile).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1_999);
    });

    expect(activeInvoiceButton).toBeDisabled();
    expect(otherInvoiceButton).toBeEnabled();
  });

  it("downloads the generated invoice and shows a success notification after the delay", async () => {
    vi.useFakeTimers();

    await renderDashboard();

    const invoiceButton = screen.getByRole("button", {
      name: "Download invoice INV-2026-1002",
    });

    fireEvent.click(invoiceButton);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2_000);
    });

    expect(downloadInvoiceFile).toHaveBeenCalledTimes(1);
    expect(downloadInvoiceFile).toHaveBeenCalledWith(
      expect.objectContaining({
        fileName: "INV-2026-1002.pdf",
        mimeType: "application/pdf",
        content: expect.stringContaining("Transaction: txn_1002"),
      }),
    );
    expect(toastSuccessMock).toHaveBeenCalledWith(
      "Invoice INV-2026-1002 downloaded.",
    );
    expect(invoiceButton).toBeEnabled();
    expect(invoiceButton).toHaveTextContent("Download Invoice");
  });
});

import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { downloadInvoiceFile } from "../lib/download-invoice-file";
import { getTransactions, retryPayment } from "../lib/mock-api";
import type { RetryPaymentResult } from "../types";
import { TransactionsDashboard } from "./transactions-dashboard";

const { toastErrorMock, toastSuccessMock } = vi.hoisted(() => ({
  toastErrorMock: vi.fn(),
  toastSuccessMock: vi.fn(),
}));

vi.mock("../lib/download-invoice-file", () => ({
  downloadInvoiceFile: vi.fn(),
}));

vi.mock("../lib/mock-api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../lib/mock-api")>();

  return {
    ...actual,
    retryPayment: vi.fn(actual.retryPayment),
  };
});

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

const createRetryResult = (
  transactionId: string,
  status: RetryPaymentResult["status"],
): RetryPaymentResult => ({
  transactionId,
  status,
  attemptedAt: "2026-05-12T10:00:00.000Z",
});

const createDeferredRetry = () => {
  let resolve!: (value: RetryPaymentResult) => void;
  let reject!: (error?: unknown) => void;
  const promise = new Promise<RetryPaymentResult>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  return { promise, resolve, reject };
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

  it("retries selected failed rows independently and restores selection by outcome", async () => {
    const user = userEvent.setup();
    const firstRetry = createDeferredRetry();
    const secondRetry = createDeferredRetry();
    const retryPaymentMock = vi.mocked(retryPayment);

    retryPaymentMock.mockImplementation((transactionId) => {
      if (transactionId === "txn_1002") {
        return firstRetry.promise;
      }

      if (transactionId === "txn_1004") {
        return secondRetry.promise;
      }

      throw new Error(`Unexpected retry for ${transactionId}`);
    });

    await renderDashboard();

    await user.click(
      screen.getByRole("checkbox", {
        name: "Select failed transaction txn_1002",
      }),
    );
    await user.click(
      screen.getByRole("checkbox", {
        name: "Select failed transaction txn_1004",
      }),
    );
    await user.click(
      screen.getByRole("button", { name: "Retry Selected (2)" }),
    );

    expect(retryPaymentMock).toHaveBeenCalledTimes(2);
    expect(retryPaymentMock).toHaveBeenNthCalledWith(1, "txn_1002");
    expect(retryPaymentMock).toHaveBeenNthCalledWith(2, "txn_1004");
    expect(
      screen.getByRole("status", { name: "Retrying transaction txn_1002" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("status", { name: "Retrying transaction txn_1004" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("checkbox", {
        name: "Select failed transaction txn_1002",
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("checkbox", {
        name: "Select failed transaction txn_1004",
      }),
    ).not.toBeInTheDocument();

    await act(async () => {
      firstRetry.resolve(createRetryResult("txn_1002", "Success"));
      await firstRetry.promise;
    });

    const successfulRetryRow = screen.getByRole("row", { name: /txn_1002/ });
    const pendingRetryRow = screen.getByRole("row", { name: /txn_1004/ });

    await waitFor(() => {
      expect(within(successfulRetryRow).getByText("Success")).toBeInTheDocument();
    });
    expect(
      within(successfulRetryRow).queryByRole("checkbox"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("status", { name: "Retrying transaction txn_1004" }),
    ).toBeInTheDocument();
    expect(within(pendingRetryRow).getByText("Retrying...")).toBeInTheDocument();

    await act(async () => {
      secondRetry.resolve(createRetryResult("txn_1004", "Failed"));
      await secondRetry.promise;
    });

    await waitFor(() => {
      expect(within(pendingRetryRow).getByText("Failed")).toBeInTheDocument();
    });
    expect(
      screen.getByRole("checkbox", {
        name: "Select failed transaction txn_1004",
      }),
    ).toBeEnabled();
    expect(
      screen.getByRole("button", { name: "Retry Selected" }),
    ).toBeDisabled();
  });

  it("downloads an invoice after retrying the selected transaction", async () => {
    const retryPaymentMock = vi.mocked(retryPayment);

    retryPaymentMock.mockResolvedValueOnce(
      createRetryResult("txn_1002", "Success"),
    );

    render(<TransactionsDashboard transactions={await getTransactions()} />);

    fireEvent.click(
      screen.getByRole("checkbox", {
        name: "Select failed transaction txn_1002",
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Retry Selected (1)" }));

    await waitFor(() => {
      expect(
        within(screen.getByRole("row", { name: /txn_1002/ })).getByText(
          "Success",
        ),
      ).toBeInTheDocument();
    });

    vi.useFakeTimers();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Download invoice INV-2026-1002",
      }),
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2_000);
    });

    expect(downloadInvoiceFile).toHaveBeenCalledTimes(1);
    expect(downloadInvoiceFile).toHaveBeenCalledWith(
      expect.objectContaining({
        fileName: "INV-2026-1002.pdf",
      }),
    );
  });
});

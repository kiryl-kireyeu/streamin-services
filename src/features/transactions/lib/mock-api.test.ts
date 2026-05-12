import { afterEach, describe, expect, it, vi } from "vitest";

import {
  generateInvoice,
  getTransactions,
  retryPayment,
} from "./mock-api";

describe("transactions mock api", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns cloned transaction data on each call", async () => {
    const firstResult = await getTransactions();
    const secondResult = await getTransactions();

    expect(firstResult).toEqual(secondResult);
    expect(firstResult).not.toBe(secondResult);
    expect(firstResult[0]).not.toBe(secondResult[0]);

    firstResult[0].status = "Failed";

    expect(secondResult[0].status).toBe("Success");
    expect((await getTransactions())[0].status).toBe("Success");
  });

  it("generates invoice content after the configured delay", async () => {
    vi.useFakeTimers();
    const [transaction] = await getTransactions();

    const invoicePromise = generateInvoice(transaction, { delayMs: 2_000 });

    await vi.advanceTimersByTimeAsync(1_999);

    const pendingMarker = vi.fn();
    invoicePromise.then(pendingMarker);
    await vi.runAllTicks();
    expect(pendingMarker).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);

    await expect(invoicePromise).resolves.toMatchObject({
      fileName: "INV-2026-1001.pdf",
      mimeType: "application/pdf",
      content: expect.stringContaining("Transaction: txn_1001"),
    });
    await expect(invoicePromise).resolves.toMatchObject({
      content: expect.stringContaining("Amount: 19.99 USD"),
    });
  });

  it("resolves retry success with deterministic outcome and timestamp", async () => {
    vi.useFakeTimers();
    const attemptedAt = new Date("2026-05-12T10:30:00.000Z");

    const retryPromise = retryPayment("txn_1002", {
      delayMs: 1_500,
      outcomeRandom: () => 0.2,
      now: () => attemptedAt,
    });

    await vi.advanceTimersByTimeAsync(1_500);

    await expect(retryPromise).resolves.toEqual({
      transactionId: "txn_1002",
      status: "Success",
      attemptedAt: attemptedAt.toISOString(),
    });
  });

  it("resolves retry failure with deterministic outcome", async () => {
    vi.useFakeTimers();

    const retryPromise = retryPayment("txn_1004", {
      delayMs: 1_000,
      outcomeRandom: () => 0.19,
      now: () => new Date("2026-05-12T11:00:00.000Z"),
    });

    await vi.advanceTimersByTimeAsync(1_000);

    await expect(retryPromise).resolves.toMatchObject({
      transactionId: "txn_1004",
      status: "Failed",
      attemptedAt: "2026-05-12T11:00:00.000Z",
    });
  });
});

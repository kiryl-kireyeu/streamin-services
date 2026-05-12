import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createInvoiceDownloadUrl,
  downloadInvoiceFile,
} from "./download-invoice-file";
import type { InvoiceFile } from "../types";

const invoiceFile: InvoiceFile = {
  fileName: "INV-2026-1002.pdf",
  mimeType: "application/pdf",
  content: "Invoice file content",
};

describe("download invoice file helpers", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates an object URL from the invoice PDF blob", () => {
    const createObjectUrlSpy = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:invoice-url");

    const downloadUrl = createInvoiceDownloadUrl(invoiceFile);

    expect(downloadUrl).toBe("blob:invoice-url");
    expect(createObjectUrlSpy).toHaveBeenCalledTimes(1);
    const [objectUrlSource] = createObjectUrlSpy.mock.calls[0];

    expect(objectUrlSource).toBeInstanceOf(Blob);

    if (!(objectUrlSource instanceof Blob)) {
      throw new Error("Expected invoice source to be a Blob.");
    }

    expect(objectUrlSource.type).toBe("application/pdf");
  });

  it("clicks a temporary link and revokes the object URL", () => {
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:invoice-url");
    const revokeObjectUrlSpy = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => undefined);
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);

    downloadInvoiceFile(invoiceFile);

    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(revokeObjectUrlSpy).toHaveBeenCalledWith("blob:invoice-url");
    expect(
      document.querySelector('a[download="INV-2026-1002.pdf"]'),
    ).not.toBeInTheDocument();
  });
});

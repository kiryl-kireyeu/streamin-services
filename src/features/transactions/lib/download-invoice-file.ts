import type { InvoiceFile } from "../types";

export const createInvoiceDownloadUrl = (invoiceFile: InvoiceFile) => {
  const blob = new Blob([invoiceFile.content], {
    type: invoiceFile.mimeType,
  });

  return URL.createObjectURL(blob);
};

export const downloadInvoiceFile = (invoiceFile: InvoiceFile) => {
  const downloadUrl = createInvoiceDownloadUrl(invoiceFile);
  const link = document.createElement("a");

  link.href = downloadUrl;
  link.download = invoiceFile.fileName;
  link.style.display = "none";

  document.body.append(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(downloadUrl);
};

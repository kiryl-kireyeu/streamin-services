const sanitizePdfText = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, "?")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");

const createTextCommand = (line: string, index: number) => {
  const escapedLine = sanitizePdfText(line);

  if (index === 0) {
    return `(${escapedLine}) Tj`;
  }

  return `0 -24 Td (${escapedLine}) Tj`;
};

const formatPdfOffset = (offset: number) => offset.toString().padStart(10, "0");

export const createInvoicePdfContent = (lines: readonly string[]) => {
  const contentStream = [
    "BT",
    "/F1 18 Tf",
    "72 760 Td",
    ...lines.map(createTextCommand),
    "ET",
  ].join("\n");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    [
      "<< /Type /Page",
      "/Parent 2 0 R",
      "/MediaBox [0 0 612 792]",
      "/Resources << /Font << /F1 5 0 R >> >>",
      "/Contents 4 0 R",
      ">>",
    ].join("\n"),
    [
      `<< /Length ${contentStream.length} >>`,
      "stream",
      contentStream,
      "endstream",
    ].join("\n"),
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];

  let pdfContent = "%PDF-1.4\n";
  const objectOffsets: number[] = [];

  objects.forEach((objectContent, index) => {
    objectOffsets.push(pdfContent.length);
    pdfContent += `${index + 1} 0 obj\n${objectContent}\nendobj\n`;
  });

  const xrefOffset = pdfContent.length;
  const xrefEntries = [
    "0000000000 65535 f ",
    ...objectOffsets.map((offset) => `${formatPdfOffset(offset)} 00000 n `),
  ];

  return [
    pdfContent,
    "xref",
    `0 ${objects.length + 1}`,
    ...xrefEntries,
    "trailer",
    `<< /Size ${objects.length + 1} /Root 1 0 R >>`,
    "startxref",
    String(xrefOffset),
    "%%EOF",
    "",
  ].join("\n");
};

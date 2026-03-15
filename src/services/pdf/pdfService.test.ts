import { generatePdfFromScan } from "./pdfService";

describe("generatePdfFromScan", () => {
  const baseSession = {
    preset: "Original" as const,
    pdfExportState: "idle" as const,
    scanResult: {
      status: "success" as const,
      page: {
        uri: "file:///corrected-scan.jpg",
      },
    },
  };

  it("creates a non-empty pdf from corrected scan image", async () => {
    const printToFileAsync = jest.fn(async () => ({
      uri: "file:///cache/rendered.pdf",
      numberOfPages: 1,
    }));
    const copyAsync = jest.fn(async () => undefined);
    const getInfoAsync = jest.fn(async () => ({
      exists: true as const,
      uri: "file:///documents/scan-1700000000000.pdf",
      size: 12345,
      isDirectory: false,
      modificationTime: 1700000000,
    }));

    const result = await generatePdfFromScan(baseSession, {
      printToFileAsync,
      copyAsync,
      getInfoAsync,
      documentDirectory: "file:///documents/",
      now: () => 1700000000000,
    });

    expect(printToFileAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        width: 595,
        height: 842,
        base64: false,
      }),
    );

    expect(printToFileAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        html: expect.stringContaining("file:///corrected-scan.jpg"),
      }),
    );
    expect(printToFileAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        html: expect.stringContaining("filter: none"),
      }),
    );

    expect(copyAsync).toHaveBeenCalledWith({
      from: "file:///cache/rendered.pdf",
      to: "file:///documents/scan-1700000000000.pdf",
    });

    expect(result).toEqual({
      status: "success",
      uri: "file:///documents/scan-1700000000000.pdf",
      fileName: "scan-1700000000000.pdf",
      size: 12345,
    });
  });

  it("returns typed error for missing corrected image uri", async () => {
    const result = await generatePdfFromScan(
      {
        ...baseSession,
        scanResult: {
          status: "success",
          page: { uri: "" },
        },
      },
      {
        documentDirectory: "file:///documents/",
      },
    );

    expect(result).toEqual({
      status: "error",
      error: {
        code: "INVALID_SCAN_URI",
        message: "Missing corrected image uri",
      },
    });
  });

  it("returns typed error when scan session is not successful", async () => {
    const result = await generatePdfFromScan({
      preset: "Original",
      pdfExportState: "idle",
      scanResult: { status: "cancel" },
    });

    expect(result).toEqual({
      status: "error",
      error: {
        code: "INVALID_SCAN_RESULT",
        message: "Scan session does not contain a successful scan result",
      },
    });
  });

  it("returns typed error when documents directory is unavailable", async () => {
    const result = await generatePdfFromScan(baseSession, {
      documentDirectory: null,
    });

    expect(result).toEqual({
      status: "error",
      error: {
        code: "DOCUMENTS_DIRECTORY_UNAVAILABLE",
        message: "App documents directory is unavailable",
      },
    });
  });

  it("returns typed error when print or persistence fails", async () => {
    const result = await generatePdfFromScan(baseSession, {
      printToFileAsync: jest.fn(async () => {
        throw new Error("print failed");
      }),
      documentDirectory: "file:///documents/",
    });

    expect(result.status).toBe("error");
    if (result.status !== "error") {
      throw new Error("Expected generation failure");
    }

    expect(result.error.code).toBe("PDF_GENERATION_FAILED");
    expect(result.error.message).toBe("print failed");
  });
});

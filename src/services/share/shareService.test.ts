import { sharePdf } from "./shareService";

describe("sharePdf", () => {
  it("opens native share sheet for generated pdf uri", async () => {
    const isAvailableAsync = jest.fn(async () => true);
    const shareAsync = jest.fn(async () => undefined);

    const result = await sharePdf("file:///documents/scan-1700000000000.pdf", {
      isAvailableAsync,
      shareAsync,
    });

    expect(isAvailableAsync).toHaveBeenCalledTimes(1);
    expect(shareAsync).toHaveBeenCalledWith("file:///documents/scan-1700000000000.pdf", {
      dialogTitle: "Share scanned document",
      mimeType: "application/pdf",
      UTI: "com.adobe.pdf",
    });
    expect(result).toEqual({ status: "success" });
  });

  it("returns typed error when uri is missing", async () => {
    const result = await sharePdf("   ");

    expect(result).toEqual({
      status: "error",
      error: {
        code: "INVALID_PDF_URI",
        message: "PDF uri is required to share",
      },
    });
  });

  it("returns typed error when native sharing is unavailable", async () => {
    const result = await sharePdf("file:///documents/scan.pdf", {
      isAvailableAsync: jest.fn(async () => false),
    });

    expect(result).toEqual({
      status: "error",
      error: {
        code: "SHARE_UNAVAILABLE",
        message: "Native sharing is not available on this device",
      },
    });
  });

  it("returns typed error when shareAsync throws", async () => {
    const result = await sharePdf("file:///documents/scan.pdf", {
      isAvailableAsync: jest.fn(async () => true),
      shareAsync: jest.fn(async () => {
        throw new Error("share failed");
      }),
    });

    expect(result.status).toBe("error");
    if (result.status !== "error") {
      throw new Error("Expected share error");
    }
    expect(result.error.code).toBe("SHARE_FAILED");
    expect(result.error.message).toBe("share failed");
  });
});

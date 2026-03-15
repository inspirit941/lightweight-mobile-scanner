import * as Sharing from "expo-sharing";

type SharePdfErrorCode = "INVALID_PDF_URI" | "SHARE_UNAVAILABLE" | "SHARE_FAILED";

export type SharePdfResult =
  | {
      status: "success";
    }
  | {
      status: "error";
      error: {
        code: SharePdfErrorCode;
        message: string;
        details?: unknown;
      };
    };

type ShareDependencies = {
  isAvailableAsync: typeof Sharing.isAvailableAsync;
  shareAsync: typeof Sharing.shareAsync;
};

function createDefaultDependencies(): ShareDependencies {
  return {
    isAvailableAsync: Sharing.isAvailableAsync,
    shareAsync: Sharing.shareAsync,
  };
}

export async function sharePdf(
  pdfUri: string,
  overrides: Partial<ShareDependencies> = {},
): Promise<SharePdfResult> {
  const deps = { ...createDefaultDependencies(), ...overrides };

  if (!pdfUri.trim()) {
    return {
      status: "error",
      error: {
        code: "INVALID_PDF_URI",
        message: "PDF uri is required to share",
      },
    };
  }

  const isAvailable = await deps.isAvailableAsync();
  if (!isAvailable) {
    return {
      status: "error",
      error: {
        code: "SHARE_UNAVAILABLE",
        message: "Native sharing is not available on this device",
      },
    };
  }

  try {
    await deps.shareAsync(pdfUri, {
      dialogTitle: "Share scanned document",
      mimeType: "application/pdf",
      UTI: "com.adobe.pdf",
    });
    return { status: "success" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to share PDF";
    return {
      status: "error",
      error: {
        code: "SHARE_FAILED",
        message,
        details: error,
      },
    };
  }
}

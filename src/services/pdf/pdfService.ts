import * as FileSystem from "expo-file-system/legacy";
import * as Print from "expo-print";
import type { ScanSession } from "../../types/scanner";
import { buildPdfTemplate } from "./templates";

type GeneratePdfErrorCode =
  | "INVALID_SCAN_RESULT"
  | "INVALID_SCAN_URI"
  | "DOCUMENTS_DIRECTORY_UNAVAILABLE"
  | "PDF_GENERATION_FAILED";

export type GeneratePdfResult =
  | {
      status: "success";
      uri: string;
      fileName: string;
      size: number;
    }
  | {
      status: "error";
      error: {
        code: GeneratePdfErrorCode;
        message: string;
        details?: unknown;
      };
    };

type PdfDependencies = {
  printToFileAsync: typeof Print.printToFileAsync;
  copyAsync: typeof FileSystem.copyAsync;
  getInfoAsync: typeof FileSystem.getInfoAsync;
  documentDirectory: string | null;
  now: () => number;
};

function createDefaultDependencies(): PdfDependencies {
  return {
    printToFileAsync: Print.printToFileAsync,
    copyAsync: FileSystem.copyAsync,
    getInfoAsync: FileSystem.getInfoAsync,
    documentDirectory: FileSystem.documentDirectory,
    now: () => Date.now(),
  };
}

function createPdfFilename(now: number): string {
  return `scan-${now}.pdf`;
}

export async function generatePdfFromScan(
  session: ScanSession,
  overrides: Partial<PdfDependencies> = {},
): Promise<GeneratePdfResult> {
  const deps = { ...createDefaultDependencies(), ...overrides };

  if (session.scanResult?.status !== "success") {
    return {
      status: "error",
      error: {
        code: "INVALID_SCAN_RESULT",
        message: "Scan session does not contain a successful scan result",
      },
    };
  }

  const templateResult = buildPdfTemplate({
    imageUri: session.scanResult.page?.uri,
    preset: session.preset,
  });

  if (!templateResult.ok) {
    return {
      status: "error",
      error: {
        code: templateResult.error.code,
        message: templateResult.error.message,
      },
    };
  }

  if (!deps.documentDirectory) {
    return {
      status: "error",
      error: {
        code: "DOCUMENTS_DIRECTORY_UNAVAILABLE",
        message: "App documents directory is unavailable",
      },
    };
  }

  const fileName = createPdfFilename(deps.now());
  const destinationUri = `${deps.documentDirectory}${fileName}`;

  try {
    const renderedPdf = await deps.printToFileAsync({
      html: templateResult.html,
      width: 595,
      height: 842,
      base64: false,
    });

    await deps.copyAsync({
      from: renderedPdf.uri,
      to: destinationUri,
    });

    const fileInfo = await deps.getInfoAsync(destinationUri);
    const size = fileInfo.exists ? fileInfo.size : 0;

    return {
      status: "success",
      uri: destinationUri,
      fileName,
      size,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate PDF";

    return {
      status: "error",
      error: {
        code: "PDF_GENERATION_FAILED",
        message,
        details: error,
      },
    };
  }
}

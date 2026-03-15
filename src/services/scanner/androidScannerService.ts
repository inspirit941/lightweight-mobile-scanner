import DocumentScanner, {
  ResponseType,
  ScanDocumentResponseStatus,
  type ScanDocumentOptions,
  type ScanDocumentResponse,
} from "react-native-document-scanner-plugin";
import type { ScanResult } from "../../types/scanner";
import type { ScanOptions, ScannerService } from "./types";

type ScannerModuleWithAvailability = {
  scanDocument: (options?: ScanDocumentOptions) => Promise<ScanDocumentResponse>;
  isAvailable?: () => boolean | Promise<boolean>;
};

const DEFAULT_QUALITY = 90;

function toCroppedImageQuality(quality?: number): number {
  if (typeof quality !== "number" || Number.isNaN(quality)) {
    return DEFAULT_QUALITY;
  }

  if (quality >= 0 && quality <= 1) {
    return Math.round(quality * 100);
  }

  return Math.min(100, Math.max(0, Math.round(quality)));
}

function getScannerModule(): ScannerModuleWithAvailability {
  return DocumentScanner as ScannerModuleWithAvailability;
}

function normalizeError(error: unknown): ScanResult {
  const code =
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code?: unknown }).code === "string"
      ? (error as { code: string }).code
      : "SCAN_FAILED";

  const message =
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
      ? (error as { message: string }).message
      : "Scanner failed to launch";

  return {
    status: "error",
    error: {
      code,
      message,
      details: error,
    },
  };
}

export const androidScannerService: ScannerService = {
  async scan(options?: ScanOptions): Promise<ScanResult> {
    const available = await this.isAvailable();
    if (!available) {
      return {
        status: "error",
        error: {
          code: "SCANNER_UNAVAILABLE",
          message: "Scanner is not available on this device",
        },
      };
    }

    const scanner = getScannerModule();

    try {
      const result = await scanner.scanDocument({
        maxNumDocuments: 1,
        responseType: ResponseType.ImageFilePath,
        croppedImageQuality: toCroppedImageQuality(options?.quality),
      });

      if (result.status === ScanDocumentResponseStatus.Cancel) {
        return { status: "cancel" };
      }

      if (result.status === ScanDocumentResponseStatus.Success) {
        const firstUri = result.scannedImages?.find(
          (uri): uri is string => typeof uri === "string" && uri.length > 0
        );

        if (firstUri) {
          return {
            status: "success",
            page: {
              uri: firstUri,
            },
          };
        }

        return {
          status: "error",
          error: {
            code: "EMPTY_SCAN_RESULT",
            message: "Scanner returned success without an image",
          },
        };
      }

      return {
        status: "error",
        error: {
          code: "INVALID_SCAN_STATUS",
          message: "Scanner returned an unknown status",
        },
      };
    } catch (error: unknown) {
      return normalizeError(error);
    }
  },

  async isAvailable(): Promise<boolean> {
    const scanner = getScannerModule();

    if (typeof scanner.isAvailable !== "function") {
      return false;
    }

    try {
      const value = await scanner.isAvailable();
      return value === true;
    } catch {
      return false;
    }
  },
};

export const defaultScannerService = androidScannerService;

export default androidScannerService;

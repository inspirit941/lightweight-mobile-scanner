/**
 * Scanner service interface implementation.
 * This is the contract that screens use to interact with the scanner.
 * V1 implementation will be provided by androidScannerService in T4.
 */

import type { ScanOptions, ScannerService } from "./types";
import type { ScanResult } from "../../types/scanner";

/**
 * Default scanner service implementation.
 * In V1, this will be replaced by androidScannerService.
 * For now, provides a mock implementation for testing.
 */
export const defaultScannerService: ScannerService = {
  async scan(_options?: ScanOptions): Promise<ScanResult> {
    // V1 implementation will be provided by androidScannerService
    // This is a placeholder for the interface contract
    return {
      status: "error",
      error: {
        code: "NOT_IMPLEMENTED",
        message: "Scanner service not yet implemented",
      },
    };
  },

  async isAvailable(): Promise<boolean> {
    // V1 implementation will be provided by androidScannerService
    return false;
  },
};

export default defaultScannerService;

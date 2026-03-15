/**
 * Scanner service contract types.
 * Defines the interface for scanner operations and normalized responses.
 */

import type { ScanResult } from "../../types/scanner";

/**
 * Options for scanner operation.
 * V1 uses default options - this type exists for future extensibility.
 */
export type ScanOptions = {
  /** Single-page only in V1 */
  singlePage?: boolean;
  /** Native scanner UI preferred */
  useNativeUI?: boolean;
  /** Preferred output file path (optional) */
  outputFilePath?: string;
  /** Scan quality (optional) */
  quality?: number;
};

/**
 * Scanner service interface.
 * Abstracts the native scanner implementation behind a stable contract.
 */
export interface ScannerService {
  /**
   * Launches the native scanner and returns a normalized result.
   *
   * @param options - Optional scan configuration
   * @returns Normalized ScanResult with app-owned types
   */
  scan(options?: ScanOptions): Promise<ScanResult>;

  /**
   * Checks if the scanner is available on the current device.
   *
   * @returns true if scanner is available, false otherwise
   */
  isAvailable(): Promise<boolean>;
}

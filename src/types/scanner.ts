/**
 * Scanner domain types for the mobile scanner MVP.
 * Defines the core domain model for scan operations, results, and presets.
 */

/**
 * Normalized scan result status outcomes.
 * These are the only valid states returned by the scanner service.
 */
export type ScanStatus = "success" | "cancel" | "error";

/**
 * Represents a single scanned page with corrected image data.
 * V1 is single-page only, so this type represents the complete scan result.
 */
export type ScanPage = {
  /** URI of the corrected scan image (app-owned, not plugin-specific) */
  uri: string;
  /** Optional metadata about the scan */
  metadata?: {
    width?: number;
    height?: number;
    timestamp?: number;
  };
};

/**
 * Scan result with normalized status and app-owned types.
 * No plugin-specific objects leak into the domain model.
 */
export type ScanResult = {
  /** Normalized status outcome */
  status: ScanStatus;
  /** Corrected scan page when status is success */
  page?: ScanPage;
  /** Error metadata when status is error */
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
};

/**
 * Scan preset options for post-scan enhancement.
 * V1 supports exactly two presets.
 */
export type ScanPreset = "Original" | "B&W Scan";

/**
 * State of PDF export operation.
 */
export type PdfExportState = "idle" | "generating" | "ready" | "error";

/**
 * Complete scan session state.
 * V1 is single-page only - later scans replace existing page.
 */
export type ScanSession = {
  /** Current scan result if available */
  scanResult?: ScanResult;
  /** Selected scan preset */
  preset: ScanPreset;
  /** PDF export state */
  pdfExportState: PdfExportState;
  /** Generated PDF URI when ready */
  pdfUri?: string;
};

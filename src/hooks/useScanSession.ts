import { useSyncExternalStore } from "react";
import { useScanSessionStore } from "../context/scanSessionContext";
import type { ScannerService } from "../services/scanner/types";

/**
 * Single-page scan session hook.
 * V1 constraint: Only one scan page is stored at a time.
 * Later scans replace the existing page instead of appending.
 */
export function useScanSession(scannerService: ScannerService) {
  void scannerService;
  const store = useScanSessionStore();
  const session = useSyncExternalStore(store.subscribe, store.getState, store.getState);

  return {
    ...session,
    updateScanResult: store.updateScanResult,
    updatePreset: store.updatePreset,
    updatePdfExportState: store.updatePdfExportState,
    setPdfUri: store.setPdfUri,
    resetSession: store.resetSession,
  };
}

import { createContext, type ReactNode, useContext, useRef } from "react";
import type { PdfExportState, ScanPreset, ScanResult, ScanSession } from "../types/scanner";

type ScanSessionStore = {
  getState: () => ScanSession;
  subscribe: (listener: () => void) => () => void;
  updateScanResult: (result: ScanResult) => void;
  updatePreset: (preset: ScanPreset) => void;
  updatePdfExportState: (state: PdfExportState) => void;
  setPdfUri: (uri?: string) => void;
  resetSession: () => void;
};

const createDefaultSession = (): ScanSession => ({
  preset: "Original",
  pdfExportState: "idle",
});

const createScanSessionStore = (): ScanSessionStore => {
  let state = createDefaultSession();
  const listeners = new Set<() => void>();

  const emit = () => {
    listeners.forEach((listener) => {
      listener();
    });
  };

  const setState = (updater: (prev: ScanSession) => ScanSession) => {
    state = updater(state);
    emit();
  };

  return {
    getState: () => state,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    updateScanResult: (result) => {
      setState((prev) => ({
        ...prev,
        scanResult: result,
        pdfExportState: "idle",
        pdfUri: undefined,
      }));
    },
    updatePreset: (preset) => {
      setState((prev) => ({ ...prev, preset }));
    },
    updatePdfExportState: (stateValue) => {
      setState((prev) => ({ ...prev, pdfExportState: stateValue }));
    },
    setPdfUri: (uri) => {
      setState((prev) => ({ ...prev, pdfUri: uri }));
    },
    resetSession: () => {
      setState(() => createDefaultSession());
    },
  };
};

const defaultScanSessionStore = createScanSessionStore();
const ScanSessionStoreContext = createContext<ScanSessionStore | null>(null);

export function ScanSessionProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<ScanSessionStore | null>(null);

  if (!storeRef.current) {
    storeRef.current = createScanSessionStore();
  }

  return (
    <ScanSessionStoreContext.Provider value={storeRef.current}>
      {children}
    </ScanSessionStoreContext.Provider>
  );
}

export function useScanSessionStore() {
  return useContext(ScanSessionStoreContext) ?? defaultScanSessionStore;
}

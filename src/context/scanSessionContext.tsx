import { createContext, type ReactNode, useContext, useRef } from "react";
import {
  DEFAULT_PRESET,
  type PdfExportState,
  type ScanPreset,
  type ScanResult,
  type ScanSession,
} from "../types/scanner";

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
  preset: DEFAULT_PRESET,
  pdfExportState: "idle",
});

const resetPdfState = (session: ScanSession): ScanSession => ({
  ...session,
  pdfExportState: "idle",
  pdfUri: undefined,
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
        ...resetPdfState(prev),
        scanResult: result,
      }));
    },
    updatePreset: (preset) => {
      setState((prev) => ({
        ...resetPdfState(prev),
        preset,
      }));
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
  const store = useContext(ScanSessionStoreContext);

  if (!store) {
    throw new Error("useScanSessionStore must be used within a ScanSessionProvider");
  }

  return store;
}

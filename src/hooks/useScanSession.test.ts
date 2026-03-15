import { act } from "@testing-library/react-native";
import { renderHookWithScanSession } from "../test-utils/scanSession";
import { useScanSession } from "./useScanSession";
import type { PdfExportState, ScanResult } from "../types/scanner";

describe("useScanSession", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("initial state", () => {
    it("initializes with default preset and idle PDF state", () => {
      const { result } = renderHookWithScanSession(() => useScanSession());

      expect(result.current.preset).toBe("Original");
      expect(result.current.pdfExportState).toBe("idle");
      expect(result.current.scanResult).toBeUndefined();
      expect(result.current.pdfUri).toBeUndefined();
    });
  });

  describe("updateScanResult", () => {
    it("stores scan result and resets PDF state", () => {
      const { result } = renderHookWithScanSession(() => useScanSession());

      const mockResult: ScanResult = {
        status: "success",
        page: {
          uri: "file:///scan.jpg",
          metadata: { width: 800, height: 600, timestamp: Date.now() },
        },
      };

      act(() => {
        result.current.updateScanResult(mockResult);
      });

      expect(result.current.scanResult).toEqual(mockResult);
      expect(result.current.pdfExportState).toBe("idle");
      expect(result.current.pdfUri).toBeUndefined();
    });

    it("stores cancel result without page", () => {
      const { result } = renderHookWithScanSession(() => useScanSession());

      const mockResult: ScanResult = {
        status: "cancel",
      };

      act(() => {
        result.current.updateScanResult(mockResult);
      });

      expect(result.current.scanResult).toEqual(mockResult);
      expect(result.current.scanResult?.page).toBeUndefined();
    });

    it("stores error result with error metadata", () => {
      const { result } = renderHookWithScanSession(() => useScanSession());

      const mockResult: ScanResult = {
        status: "error",
        error: {
          code: "SCANNER_NOT_AVAILABLE",
          message: "Scanner is not available on this device",
        },
      };

      act(() => {
        result.current.updateScanResult(mockResult);
      });

      expect(result.current.scanResult).toEqual(mockResult);
      expect(result.current.scanResult?.error).toEqual(mockResult.error);
    });
  });

  describe("updatePreset", () => {
    it("updates the selected preset", () => {
      const { result } = renderHookWithScanSession(() => useScanSession());

      act(() => {
        result.current.updatePreset("B&W Scan");
      });

      expect(result.current.preset).toBe("B&W Scan");
    });

    it("accepts only valid preset values", () => {
      const { result } = renderHookWithScanSession(() => useScanSession());

      act(() => {
        result.current.updatePreset("Original");
      });

      expect(result.current.preset).toBe("Original");

      act(() => {
        result.current.updatePreset("B&W Scan");
      });

      expect(result.current.preset).toBe("B&W Scan");
    });

    it("resets pdf export state and uri when preset changes", () => {
      const { result } = renderHookWithScanSession(() => useScanSession());

      act(() => {
        result.current.updatePdfExportState("ready");
        result.current.setPdfUri("file:///documents/scan.pdf");
        result.current.updatePreset("B&W Scan");
      });

      expect(result.current.preset).toBe("B&W Scan");
      expect(result.current.pdfExportState).toBe("idle");
      expect(result.current.pdfUri).toBeUndefined();
    });
  });

  describe("updatePdfExportState", () => {
    it("updates PDF export state", () => {
      const { result } = renderHookWithScanSession(() => useScanSession());

      act(() => {
        result.current.updatePdfExportState("generating");
      });

      expect(result.current.pdfExportState).toBe("generating");

      act(() => {
        result.current.updatePdfExportState("ready");
      });

      expect(result.current.pdfExportState).toBe("ready");
    });

    it("accepts all valid PDF export states", () => {
      const { result } = renderHookWithScanSession(() => useScanSession());

      const states: PdfExportState[] = [
        "idle",
        "generating",
        "ready",
        "error",
      ];

      states.forEach((state) => {
        act(() => {
          result.current.updatePdfExportState(state);
        });
        expect(result.current.pdfExportState).toBe(state);
      });
    });
  });

  describe("setPdfUri", () => {
    it("sets the PDF URI when ready", () => {
      const { result } = renderHookWithScanSession(() => useScanSession());

      const mockUri = "file:///documents/scan.pdf";

      act(() => {
        result.current.setPdfUri(mockUri);
      });

      expect(result.current.pdfUri).toBe(mockUri);
    });

    it("clears PDF URI when undefined is passed", () => {
      const { result } = renderHookWithScanSession(() => useScanSession());

      act(() => {
        result.current.setPdfUri("file:///documents/scan.pdf");
      });

      expect(result.current.pdfUri).toBe("file:///documents/scan.pdf");

      act(() => {
        result.current.setPdfUri(undefined);
      });

      expect(result.current.pdfUri).toBeUndefined();
    });
  });

  describe("resetSession", () => {
    it("resets session to initial state", () => {
      const { result } = renderHookWithScanSession(() => useScanSession());

      act(() => {
        result.current.updateScanResult({
          status: "success",
          page: { uri: "file:///scan.jpg" },
        });
        result.current.updatePreset("B&W Scan");
        result.current.updatePdfExportState("generating");
        result.current.setPdfUri("file:///documents/scan.pdf");
      });

      expect(result.current.scanResult).toBeDefined();
      expect(result.current.preset).toBe("B&W Scan");
      expect(result.current.pdfExportState).toBe("generating");
      expect(result.current.pdfUri).toBe("file:///documents/scan.pdf");

      act(() => {
        result.current.resetSession();
      });

      expect(result.current.scanResult).toBeUndefined();
      expect(result.current.preset).toBe("Original");
      expect(result.current.pdfExportState).toBe("idle");
      expect(result.current.pdfUri).toBeUndefined();
    });
  });

  describe("stores only one active scan page", () => {
    it("replaces existing page with new scan", () => {
      const { result } = renderHookWithScanSession(() => useScanSession());

      const firstScan: ScanResult = {
        status: "success",
        page: { uri: "file:///scan1.jpg" },
      };

      const secondScan: ScanResult = {
        status: "success",
        page: { uri: "file:///scan2.jpg" },
      };

      act(() => {
        result.current.updateScanResult(firstScan);
      });

      expect(result.current.scanResult?.page?.uri).toBe("file:///scan1.jpg");

      act(() => {
        result.current.updateScanResult(secondScan);
      });

      expect(result.current.scanResult?.page?.uri).toBe("file:///scan2.jpg");
      expect(result.current.scanResult?.page?.uri).not.toBe("file:///scan1.jpg");
    });

    it("does not append multiple pages", () => {
      const { result } = renderHookWithScanSession(() => useScanSession());

      act(() => {
        result.current.updateScanResult({
          status: "success",
          page: { uri: "file:///scan1.jpg" },
        });
      });

      expect(result.current.scanResult?.page?.uri).toBe("file:///scan1.jpg");

      act(() => {
        result.current.updateScanResult({
          status: "success",
          page: { uri: "file:///scan2.jpg" },
        });
      });

      expect(result.current.scanResult?.page?.uri).toBe("file:///scan2.jpg");
      expect(result.current.scanResult?.page?.uri).not.toBe("file:///scan1.jpg");
    });
  });
});

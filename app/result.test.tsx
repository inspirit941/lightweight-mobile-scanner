import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { useScanSession } from "../src/hooks/useScanSession";
import { generatePdfFromScan } from "../src/services/pdf/pdfService";
import { sharePdf } from "../src/services/share/shareService";
import ResultScreen from "./result";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("../src/hooks/useScanSession", () => ({
  useScanSession: jest.fn(),
}));

jest.mock("../src/services/pdf/pdfService", () => ({
  generatePdfFromScan: jest.fn(),
}));

jest.mock("../src/services/share/shareService", () => ({
  sharePdf: jest.fn(),
}));

describe("ResultScreen", () => {
  const mockRouter = {
    replace: jest.fn(),
  };

  const createSessionMock = (overrides?: {
    scanResult?: unknown;
    preset?: string;
    pdfExportState?: "idle" | "generating" | "ready" | "error";
    pdfUri?: string | undefined;
  }) => {
    const defaultScanResult = {
      status: "success",
      page: {
        uri: "file:///scan.jpg",
        metadata: {
          width: 1000,
          height: 2000,
          timestamp: "2026-01-02T03:04:05.000Z",
        },
      },
    } as const;

    const state = {
      scanResult:
        overrides && Object.hasOwn(overrides, "scanResult")
          ? overrides.scanResult
          : defaultScanResult,
      preset: overrides?.preset ?? "Original",
      pdfExportState: overrides?.pdfExportState ?? ("idle" as const),
      pdfUri: overrides?.pdfUri,
    };

    const mockUpdatePdfExportState = jest.fn(
      (nextState: "idle" | "generating" | "ready" | "error") => {
        state.pdfExportState = nextState;
      },
    );
    const mockSetPdfUri = jest.fn((uri?: string) => {
      state.pdfUri = uri;
    });
    const mockResetSession = jest.fn(() => {
      state.scanResult = undefined;
      state.preset = "Original";
      state.pdfExportState = "idle";
      state.pdfUri = undefined;
    });

    (useScanSession as jest.Mock).mockImplementation(() => ({
      scanResult: state.scanResult,
      preset: state.preset,
      pdfExportState: state.pdfExportState,
      pdfUri: state.pdfUri,
      updatePdfExportState: mockUpdatePdfExportState,
      setPdfUri: mockSetPdfUri,
      resetSession: mockResetSession,
    }));

    return {
      state,
      mockUpdatePdfExportState,
      mockSetPdfUri,
      mockResetSession,
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (generatePdfFromScan as jest.Mock).mockResolvedValue({
      status: "success",
      uri: "file:///documents/generated.pdf",
      fileName: "generated.pdf",
      size: 1234,
    });
    (sharePdf as jest.Mock).mockResolvedValue({ status: "success" });
  });

  it("clears session and pdf state on start over", () => {
    const { mockResetSession, state } = createSessionMock({
      preset: "B&W Scan",
      pdfExportState: "ready",
      pdfUri: "file:///documents/generated.pdf",
    });

    const { getByText } = render(<ResultScreen />);

    expect(getByText("Preset: B&W Scan")).toBeTruthy();
    expect(getByText("State: ready")).toBeTruthy();

    fireEvent.press(getByText("Start Over"));

    expect(mockResetSession).toHaveBeenCalledTimes(1);
    expect(mockRouter.replace).toHaveBeenCalledWith("/");
    expect(state.scanResult).toBeUndefined();
    expect(state.preset).toBe("Original");
    expect(state.pdfExportState).toBe("idle");
    expect(state.pdfUri).toBeUndefined();
  });

  it("auto-triggers generate transition from idle state", async () => {
    const { mockUpdatePdfExportState } = createSessionMock({
      pdfExportState: "idle",
      pdfUri: undefined,
    });

    const { getByLabelText, getByText } = render(<ResultScreen />);

    expect(getByLabelText("Share PDF")).toBeDisabled();
    expect(getByText("State: idle")).toBeTruthy();

    await waitFor(() => {
      expect(mockUpdatePdfExportState).toHaveBeenCalledWith("generating");
    });
  });

  it("runs PDF generation when export state is generating", async () => {
    const { state, mockUpdatePdfExportState, mockSetPdfUri } = createSessionMock({
      pdfExportState: "generating",
      pdfUri: undefined,
    });

    const { getByText } = render(<ResultScreen />);
    expect(getByText("State: generating")).toBeTruthy();

    await waitFor(() => {
      expect(generatePdfFromScan).toHaveBeenCalledWith({
        scanResult: state.scanResult,
        preset: state.preset,
        pdfExportState: "generating",
        pdfUri: undefined,
      });
      expect(mockSetPdfUri).toHaveBeenCalledWith("file:///documents/generated.pdf");
      expect(mockUpdatePdfExportState).toHaveBeenCalledWith("ready");
    });
  });

  it("keeps share disabled when no pdf uri exists", () => {
    createSessionMock({
      pdfExportState: "ready",
      pdfUri: undefined,
    });

    const { getByLabelText } = render(<ResultScreen />);
    expect(getByLabelText("Share PDF")).toBeDisabled();
  });

  it("shares PDF only when uri is available", async () => {
    createSessionMock({
      pdfExportState: "ready",
      pdfUri: "file:///documents/existing.pdf",
    });

    const { getByLabelText } = render(<ResultScreen />);
    const shareButton = getByLabelText("Share PDF");

    expect(shareButton).toBeEnabled();
    fireEvent.press(shareButton);

    await waitFor(() => {
      expect(sharePdf).toHaveBeenCalledWith("file:///documents/existing.pdf");
    });
  });
});

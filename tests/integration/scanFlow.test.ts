import { fireEvent, waitFor } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import React from "react";
import HomeScreen from "../../app/index";
import ResultScreen from "../../app/result";
import ReviewScreen from "../../app/review";
import { generatePdfFromScan } from "../../src/services/pdf/pdfService";
import { androidScannerService } from "../../src/services/scanner";
import { sharePdf } from "../../src/services/share/shareService";
import { renderWithScanSession } from "../../src/test-utils/scanSession";

jest.mock("react-native/Libraries/Animated/NativeAnimatedHelper", () => ({}), {
  virtual: true,
});

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("../../src/services/scanner", () => ({
  androidScannerService: {
    scan: jest.fn(),
    isAvailable: jest.fn(),
  },
}));

jest.mock("../../src/services/pdf/pdfService", () => ({
  generatePdfFromScan: jest.fn(),
}));

jest.mock("../../src/services/share/shareService", () => ({
  sharePdf: jest.fn(),
}));

function FlowHarness() {
  return React.createElement(
    React.Fragment,
    null,
    React.createElement(HomeScreen),
    React.createElement(ReviewScreen),
    React.createElement(ResultScreen),
  );
}

describe("scan flow integration", () => {
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (sharePdf as jest.Mock).mockResolvedValue({ status: "success" });
  });

  it("completes scan to generate pdf flow", async () => {
    const scanResult = {
      status: "success",
      page: {
        uri: "file:///test-scan.jpg",
        metadata: { width: 800, height: 600, timestamp: 1731000000000 },
      },
    };

    let resolvePdf: (value: {
      status: "success";
      uri: string;
      fileName: string;
      size: number;
    }) => void = () => undefined;
    const pdfPromise = new Promise((resolve) => {
      resolvePdf = resolve;
    });

    (generatePdfFromScan as jest.Mock).mockReturnValue(pdfPromise);

    (androidScannerService.scan as jest.Mock).mockResolvedValue(scanResult);

    const utils = renderWithScanSession(React.createElement(FlowHarness));

    fireEvent.press(utils.getByText("Scan Document"));

    await waitFor(() => {
      expect(androidScannerService.scan).toHaveBeenCalledTimes(1);
      expect(mockRouter.push).toHaveBeenCalledWith("/review");
    });

    expect(utils.queryByText("Scan cancelled")).toBeNull();

    fireEvent.press(utils.getByText("Save as PDF"));

    expect(mockRouter.push).toHaveBeenCalledWith("/result");

    await waitFor(() => {
      expect(utils.queryByText("State: generating")).not.toBeNull();
    });

    expect(utils.getByLabelText("Share PDF")).toBeDisabled();

    resolvePdf({
      status: "success",
      uri: "file:///documents/generated.pdf",
      fileName: "generated.pdf",
      size: 1234,
    });

    await waitFor(() => {
      expect(generatePdfFromScan).toHaveBeenCalled();
      expect(utils.queryByText("State: ready")).not.toBeNull();
      expect(utils.queryByText("file:///documents/generated.pdf")).not.toBeNull();
    });

    await waitFor(() => {
      expect(utils.getByLabelText("Share PDF")).toBeEnabled();
    });

    fireEvent.press(utils.getByLabelText("Share PDF"));

    await waitFor(() => {
      expect(sharePdf).toHaveBeenCalledWith("file:///documents/generated.pdf");
    });
  });
});

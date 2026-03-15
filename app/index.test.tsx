import { fireEvent, waitFor } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { androidScannerService } from "../src/services/scanner";
import { renderWithScanSession } from "../src/test-utils/scanSession";
import HomeScreen from "./index";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("../src/services/scanner", () => ({
  androidScannerService: {
    scan: jest.fn(),
    isAvailable: jest.fn(),
  },
}));

const mockRouter = {
  push: jest.fn(),
};

function renderHomeScreen() {
  return renderWithScanSession(<HomeScreen />);
}

describe("HomeScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it("renders the primary scan button", () => {
    const { getByText } = renderHomeScreen();
    expect(getByText("Scan Document")).toBeTruthy();
  });

  it("launches scanner and navigates to review on success", async () => {
    (androidScannerService.scan as jest.Mock).mockResolvedValue({
      status: "success",
      page: { uri: "file:///test.jpg" },
    });

    const { getByText } = renderHomeScreen();
    const button = getByText("Scan Document");

    fireEvent.press(button);

    await waitFor(() => {
      expect(androidScannerService.scan).toHaveBeenCalled();
      expect(mockRouter.push).toHaveBeenCalledWith("/review");
    });
  });

  it("renders inline status on cancel or unsupported scanner", async () => {
    (androidScannerService.scan as jest.Mock).mockResolvedValue({
      status: "cancel",
    });

    const { getByText } = renderHomeScreen();
    const button = getByText("Scan Document");

    fireEvent.press(button);

    await waitFor(() => {
      expect(getByText("Scan cancelled")).toBeTruthy();
      expect(mockRouter.push).not.toHaveBeenCalled();
    });

    (androidScannerService.scan as jest.Mock).mockResolvedValue({
      status: "error",
      error: {
        code: "SCANNER_UNAVAILABLE",
        message: "Scanner is not available on this device",
      },
    });

    fireEvent.press(button);

    await waitFor(() => {
      expect(getByText("Scanner is not available on this device")).toBeTruthy();
      expect(mockRouter.push).not.toHaveBeenCalled();
    });
  });
});

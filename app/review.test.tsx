import { fireEvent, render } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { useScanSession } from "../src/hooks/useScanSession";
import ReviewScreen from "./review";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("../src/hooks/useScanSession", () => ({
  useScanSession: jest.fn(),
}));

describe("ReviewScreen", () => {
  const mockRouter = {
    push: jest.fn(),
  };

  const mockUpdatePreset = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it("shows empty state when no scan result exists", () => {
    (useScanSession as jest.Mock).mockReturnValue({
      scanResult: undefined,
      preset: "Original",
      updatePreset: mockUpdatePreset,
    });

    const { getByText } = render(<ReviewScreen />);
    expect(getByText("No scan result found.")).toBeTruthy();
  });

  it("renders preview and exactly two presets when success result exists", () => {
    (useScanSession as jest.Mock).mockReturnValue({
      scanResult: {
        status: "success",
        page: { uri: "file:///test-scan.jpg" },
      },
      preset: "Original",
      updatePreset: mockUpdatePreset,
    });

    const { getByText, getByLabelText } = render(<ReviewScreen />);
    
    expect(getByText("Scan Preview")).toBeTruthy();
    expect(getByText("file:///test-scan.jpg")).toBeTruthy();
    
    expect(getByLabelText("Original preset")).toBeTruthy();
    expect(getByLabelText("B&W Scan preset")).toBeTruthy();
    expect(getByText("Save as PDF")).toBeTruthy();
  });

  it("switches preset and enables Save as PDF", () => {
    (useScanSession as jest.Mock).mockReturnValue({
      scanResult: {
        status: "success",
        page: { uri: "file:///test-scan.jpg" },
      },
      preset: "Original",
      updatePreset: mockUpdatePreset,
    });

    const { getByLabelText, getByText } = render(<ReviewScreen />);
    
    const bwPreset = getByLabelText("B&W Scan preset");
    fireEvent.press(bwPreset);
    
    expect(mockUpdatePreset).toHaveBeenCalledWith("B&W Scan");

    const saveButton = getByText("Save as PDF");
    fireEvent.press(saveButton);

    expect(mockRouter.push).toHaveBeenCalledWith("/result");
  });
});

import DocumentScanner, {
  ResponseType,
} from "react-native-document-scanner-plugin";
import { androidScannerService } from "./androidScannerService";

type MockedScannerModule = {
  scanDocument: jest.Mock;
  isAvailable?: jest.Mock;
};

jest.mock("react-native-document-scanner-plugin", () => ({
  __esModule: true,
  ResponseType: {
    Base64: "base64",
    ImageFilePath: "imageFilePath",
  },
  ScanDocumentResponseStatus: {
    Success: "success",
    Cancel: "cancel",
  },
  default: {
    scanDocument: jest.fn(),
    isAvailable: jest.fn(),
  },
}));

const mockedDocumentScanner = DocumentScanner as unknown as MockedScannerModule;

describe("androidScannerService", () => {
  beforeEach(() => {
    mockedDocumentScanner.scanDocument.mockReset();
    mockedDocumentScanner.isAvailable?.mockReset();
    mockedDocumentScanner.isAvailable?.mockResolvedValue(true);
  });

  it("maps plugin success to single-page scan result", async () => {
    mockedDocumentScanner.scanDocument.mockResolvedValue({
      status: "success",
      scannedImages: ["file:///corrected-page.jpg", "file:///ignored-page.jpg"],
      originalImage: "file:///raw.jpg",
      detectedContours: [1, 2, 3],
    });

    const result = await androidScannerService.scan({ quality: 0.91 });

    expect(mockedDocumentScanner.scanDocument).toHaveBeenCalledWith({
      maxNumDocuments: 1,
      responseType: ResponseType.ImageFilePath,
      croppedImageQuality: 91,
    });

    expect(result).toEqual({
      status: "success",
      page: {
        uri: "file:///corrected-page.jpg",
      },
    });
    expect(result).not.toHaveProperty("scannedImages");
    expect(result.page).not.toHaveProperty("originalImage");
    expect(result.page).not.toHaveProperty("detectedContours");
  });

  it("maps plugin cancel to app cancel result", async () => {
    mockedDocumentScanner.scanDocument.mockResolvedValue({
      status: "cancel",
      scannedImages: ["file:///should-not-leak.jpg"],
    });

    const result = await androidScannerService.scan();

    expect(result).toEqual({ status: "cancel" });
  });

  it("maps plugin exceptions to typed error result", async () => {
    mockedDocumentScanner.scanDocument.mockRejectedValue({
      code: "document scan error",
      message: "error opening camera",
    });

    const result = await androidScannerService.scan();

    expect(result).toEqual({
      status: "error",
      error: {
        code: "document scan error",
        message: "error opening camera",
        details: {
          code: "document scan error",
          message: "error opening camera",
        },
      },
    });
  });

  it("returns unsupported or error state when scanner cannot launch", async () => {
    mockedDocumentScanner.isAvailable?.mockResolvedValue(false);

    const unavailableResult = await androidScannerService.scan();
    expect(unavailableResult).toEqual({
      status: "error",
      error: {
        code: "SCANNER_UNAVAILABLE",
        message: "Scanner is not available on this device",
      },
    });

    mockedDocumentScanner.isAvailable?.mockResolvedValue(true);
    mockedDocumentScanner.scanDocument.mockRejectedValue(new Error("launch failed"));

    const errorResult = await androidScannerService.scan();
    expect(errorResult).toMatchObject({
      status: "error",
      error: {
        code: "SCAN_FAILED",
        message: "launch failed",
      },
    });
  });

  it("isAvailable safely returns false when plugin hook is missing", async () => {
    delete mockedDocumentScanner.isAvailable;

    const available = await androidScannerService.isAvailable();

    expect(available).toBe(false);
  });
});

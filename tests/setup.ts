import "@testing-library/jest-native/extend-expect";

jest.mock("react-native-document-scanner-plugin", () => ({
  scanDocument: jest.fn(async () => ({
    scannedImages: [],
    status: "cancel",
  })),
  default: {
    scanDocument: jest.fn(async () => ({
      scannedImages: [],
      status: "cancel",
    })),
  },
}));

jest.mock("expo-print", () => ({
  printToFileAsync: jest.fn(async () => ({ uri: "file:///mock.pdf" })),
}));

jest.mock("expo-file-system", () => ({
  documentDirectory: "file:///documents/",
  cacheDirectory: "file:///cache/",
  writeAsStringAsync: jest.fn(async () => undefined),
  readAsStringAsync: jest.fn(async () => ""),
  copyAsync: jest.fn(async () => undefined),
  makeDirectoryAsync: jest.fn(async () => undefined),
  getInfoAsync: jest.fn(async () => ({ exists: true, size: 1 })),
}));

jest.mock("expo-file-system/legacy", () => ({
  documentDirectory: "file:///documents/",
  cacheDirectory: "file:///cache/",
  writeAsStringAsync: jest.fn(async () => undefined),
  readAsStringAsync: jest.fn(async () => ""),
  copyAsync: jest.fn(async () => undefined),
  makeDirectoryAsync: jest.fn(async () => undefined),
  getInfoAsync: jest.fn(async () => ({
    exists: true,
    uri: "file:///documents/mock.pdf",
    size: 1,
    isDirectory: false,
    modificationTime: 0,
  })),
}));

jest.mock("expo-sharing", () => ({
  isAvailableAsync: jest.fn(async () => true),
  shareAsync: jest.fn(async () => undefined),
}));

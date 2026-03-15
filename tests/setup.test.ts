import scanner from "react-native-document-scanner-plugin";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const print = require("expo-print");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fileSystem = require("expo-file-system");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const sharing = require("expo-sharing");

describe("mocks native scanner module", () => {
  it("provides safe mocks for native modules", async () => {
    expect(scanner.scanDocument).toBeDefined();
    await expect(print.printToFileAsync({ html: "<html />" })).resolves.toEqual({
      uri: "file:///mock.pdf",
    });
    await expect(sharing.isAvailableAsync()).resolves.toBe(true);
    expect(fileSystem.documentDirectory).toBe("file:///documents/");
  });
});

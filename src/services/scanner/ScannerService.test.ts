import { defaultScannerService } from "./ScannerService";

describe("ScannerService", () => {
  describe("scan", () => {
    it("normalizes success and cancel outcomes", async () => {
      const result = await defaultScannerService.scan();

      expect(result).toHaveProperty("status");
      expect(["success", "cancel", "error"]).toContain(result.status);

      if (result.status === "success") {
        expect(result).toHaveProperty("page");
        expect(result.page).toHaveProperty("uri");
        expect(result.page!.uri).toMatch(/^file:\/\//);
      }

      if (result.status === "cancel") {
        expect(result).not.toHaveProperty("page");
      }

      if (result.status === "error") {
        expect(result).toHaveProperty("error");
        expect(result.error).toHaveProperty("code");
        expect(result.error).toHaveProperty("message");
      }
    });

    it("returns app-owned types without plugin-specific objects", async () => {
      const result = await defaultScannerService.scan();

      expect(result).not.toHaveProperty("scannedImages");
      expect(result).not.toHaveProperty("originalImage");
      expect(result).not.toHaveProperty("detectedContours");

      if (result.status === "success") {
        expect(result.page).not.toHaveProperty("detectedContours");
      }
    });

    it("handles optional scan options", async () => {
      const options = {
        singlePage: true,
        useNativeUI: true,
        quality: 0.9,
      };

      const result = await defaultScannerService.scan(options);

      expect(result).toHaveProperty("status");
      expect(["success", "cancel", "error"]).toContain(result.status);
    });
  });

  describe("isAvailable", () => {
    it("returns a boolean indicating scanner availability", async () => {
      const available = await defaultScannerService.isAvailable();

      expect(typeof available).toBe("boolean");
    });
  });
});

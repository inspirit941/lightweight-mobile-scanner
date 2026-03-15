import { buildPdfTemplate } from "./templates";

describe("buildPdfTemplate", () => {
  it("builds HTML with no filter for Original preset", () => {
    const result = buildPdfTemplate({
      imageUri: "file:///scan.jpg",
      preset: "Original",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("Expected template generation to succeed");
    }

    expect(result.html).toContain("size: A4 portrait");
    expect(result.html).toContain('src="file:///scan.jpg"');
    expect(result.html).toContain("filter: none");
  });

  it("builds HTML with B&W filter for B&W Scan preset", () => {
    const result = buildPdfTemplate({
      imageUri: "file:///scan.jpg",
      preset: "B&W Scan",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("Expected template generation to succeed");
    }

    expect(result.html).toContain("grayscale(1)");
    expect(result.html).toContain("contrast(1.2)");
  });

  it("rejects missing corrected image uri", () => {
    const result = buildPdfTemplate({
      imageUri: "   ",
      preset: "Original",
    });

    expect(result).toEqual({
      ok: false,
      error: {
        code: "INVALID_SCAN_URI",
        message: "Missing corrected image uri",
      },
    });
  });
});

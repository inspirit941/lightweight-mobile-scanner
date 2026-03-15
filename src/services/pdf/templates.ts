import type { ScanPreset } from "../../types/scanner";

export type PdfTemplateInput = {
  imageUri?: string;
  preset: ScanPreset;
};

export type PdfTemplateError = {
  code: "INVALID_SCAN_URI";
  message: string;
};

export type PdfTemplateResult =
  | {
      ok: true;
      html: string;
    }
  | {
      ok: false;
      error: PdfTemplateError;
    };

const PRESET_FILTER: Record<ScanPreset, string> = {
  Original: "none",
  "B&W Scan": "grayscale(1) contrast(1.2) brightness(1.05)",
};

function escapeAttribute(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function buildPdfTemplate(input: PdfTemplateInput): PdfTemplateResult {
  const imageUri = input.imageUri?.trim();

  if (!imageUri) {
    return {
      ok: false,
      error: {
        code: "INVALID_SCAN_URI",
        message: "Missing corrected image uri",
      },
    };
  }

  const filter = PRESET_FILTER[input.preset];
  const safeUri = escapeAttribute(imageUri);

  return {
    ok: true,
    html: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      @page {
        size: A4 portrait;
        margin: 0;
      }

      html,
      body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        background: #fff;
      }

      .page {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }

      .scan {
        width: 100%;
        height: 100%;
        object-fit: contain;
        filter: ${filter};
      }
    </style>
  </head>
  <body>
    <main class="page">
      <img class="scan" src="${safeUri}" alt="Scanned document" />
    </main>
  </body>
</html>`,
  };
}

import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useScanSession } from "../src/hooks/useScanSession";
import { generatePdfFromScan } from "../src/services/pdf/pdfService";
import { androidScannerService } from "../src/services/scanner";
import { sharePdf } from "../src/services/share/shareService";

export default function ResultScreen() {
  const router = useRouter();
  const {
    scanResult,
    preset,
    pdfExportState,
    pdfUri,
    updatePdfExportState,
    setPdfUri,
    resetSession,
  } = useScanSession(androidScannerService);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const scanPage = scanResult?.status === "success" ? scanResult.page : undefined;

  const metadataRows = useMemo(() => {
    const metadata = scanPage?.metadata;
    if (!metadata) {
      return ["Width: --", "Height: --", "Captured: --"];
    }

    const width = metadata.width ? `${metadata.width}px` : "--";
    const height = metadata.height ? `${metadata.height}px` : "--";
    const capturedAt = metadata.timestamp
      ? new Date(metadata.timestamp).toLocaleString()
      : "--";

    return [`Width: ${width}`, `Height: ${height}`, `Captured: ${capturedAt}`];
  }, [scanPage?.metadata]);

  useEffect(() => {
    if (pdfExportState !== "generating" || !scanPage) {
      return;
    }

    let cancelled = false;

    const runGeneration = async () => {
      const result = await generatePdfFromScan({
        scanResult,
        preset,
        pdfExportState,
        pdfUri,
      });

      if (cancelled) {
        return;
      }

      if (result.status === "success") {
        setPdfUri(result.uri);
        updatePdfExportState("ready");
        setActionMessage(`PDF ready (${result.fileName})`);
      } else {
        updatePdfExportState("error");
        setActionMessage(result.error.message);
      }
    };

    runGeneration();

    return () => {
      cancelled = true;
    };
  }, [pdfExportState, scanPage, scanResult, preset, pdfUri, updatePdfExportState, setPdfUri]);

  const canGenerate = scanResult?.status === "success" && pdfExportState !== "generating";
  const canShare = pdfExportState === "ready" && Boolean(pdfUri?.trim());

  const handleGenerate = () => {
    if (!canGenerate) {
      return;
    }

    setActionMessage(null);
    updatePdfExportState("generating");
  };

  const handleShare = async () => {
    if (!pdfUri || !canShare) {
      return;
    }

    setActionMessage(null);
    const result = await sharePdf(pdfUri);
    if (result.status === "error") {
      setActionMessage(result.error.message);
    }
  };

  const handleStartOver = () => {
    resetSession();
    setActionMessage(null);
    router.replace("/");
  };

  if (!scanPage) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyText}>No scan result found.</Text>
          <Text style={styles.emptySubtext}>Please scan a document to continue.</Text>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleStartOver}
            accessibilityRole="button"
            accessibilityLabel="Start over"
          >
            <Text style={styles.secondaryButtonText}>Start Over</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.previewContainer}>
        <View style={styles.previewContent}>
          <Text style={styles.previewTitle}>Scan Preview</Text>
          <Text style={styles.presetLabel}>Preset: {preset}</Text>
          <Text style={styles.uriText} numberOfLines={1} ellipsizeMode="middle">
            {scanPage.uri}
          </Text>
          <View style={styles.metadataList}>
            {metadataRows.map((row) => (
              <Text key={row} style={styles.metadataText}>
                {row}
              </Text>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.statusSection}>
        <Text style={styles.sectionTitle}>PDF Status</Text>
        <Text style={styles.statusText}>State: {pdfExportState}</Text>
        {pdfUri ? (
          <Text style={styles.uriText} numberOfLines={1} ellipsizeMode="middle">
            {pdfUri}
          </Text>
        ) : null}
        {actionMessage ? (
          <Text
            style={[
              styles.statusText,
              pdfExportState === "error" && styles.errorText,
            ]}
          >
            {actionMessage}
          </Text>
        ) : null}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.primaryButton, !canGenerate && styles.disabledButton]}
          onPress={handleGenerate}
          disabled={!canGenerate}
          accessibilityRole="button"
          accessibilityLabel="Generate PDF"
        >
          <Text style={styles.primaryButtonText}>Generate PDF</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.primaryButton, !canShare && styles.disabledButton]}
          onPress={handleShare}
          disabled={!canShare}
          accessibilityRole="button"
          accessibilityLabel="Share PDF"
        >
          <Text style={styles.primaryButtonText}>Share PDF</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleStartOver}
          accessibilityRole="button"
          accessibilityLabel="Start over"
        >
          <Text style={styles.secondaryButtonText}>Start Over</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  previewContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  previewContent: {
    alignItems: "center",
    padding: 20,
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  presetLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  uriText: {
    fontSize: 12,
    color: "#8E8E93",
    maxWidth: "80%",
    textAlign: "center",
  },
  metadataList: {
    marginTop: 12,
    alignItems: "center",
    gap: 4,
  },
  metadataText: {
    fontSize: 12,
    color: "#666",
  },
  statusSection: {
    marginBottom: 24,
    gap: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  statusText: {
    fontSize: 14,
    color: "#666",
  },
  errorText: {
    color: "#FF3B30",
  },
  footer: {
    paddingBottom: 10,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryButton: {
    backgroundColor: "#F2F2F7",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  secondaryButtonText: {
    color: "#1C1C1E",
    fontSize: 15,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.5,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});

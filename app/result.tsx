import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ActionButton } from "../src/components/ActionButton";
import { EmptyState } from "../src/components/EmptyState";
import { InfoSection } from "../src/components/InfoSection";
import { PreviewCard } from "../src/components/PreviewCard";
import { StatusMessage } from "../src/components/StatusMessage";
import { useScanSession } from "../src/hooks/useScanSession";
import { generatePdfFromScan } from "../src/services/pdf/pdfService";
import { sharePdf } from "../src/services/share/shareService";
import { Colors } from "../src/theme/colors";
import { Layout } from "../src/theme/layout";

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
  } = useScanSession();
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
    if (!scanPage) {
      return;
    }

    if (pdfExportState === "idle") {
      updatePdfExportState("generating");
      return;
    }

    if (pdfExportState !== "generating") {
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
      <View style={Layout.screen}>
        <EmptyState
          title="No scan result found."
          message="Please scan a document to continue."
        >
          <ActionButton
            label="Start Over"
            variant="secondary"
            onPress={handleStartOver}
            accessibilityLabel="Start over"
          />
        </EmptyState>
      </View>
    );
  }

  return (
    <View style={Layout.screen}>
      <PreviewCard title="Scan Preview">
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
      </PreviewCard>

      <InfoSection title="PDF Status">
        <View style={styles.statusContent}>
          <StatusMessage>State: {pdfExportState}</StatusMessage>
          {pdfUri ? (
            <Text style={styles.uriText} numberOfLines={1} ellipsizeMode="middle">
              {pdfUri}
            </Text>
          ) : null}
          {actionMessage ? (
            <StatusMessage variant={pdfExportState === "error" ? "error" : "neutral"}>
              {actionMessage}
            </StatusMessage>
          ) : null}
        </View>
      </InfoSection>

      <View style={[Layout.footer, styles.footer]}>
        <ActionButton
          label="Generate PDF"
          onPress={handleGenerate}
          disabled={!canGenerate}
        />
        <ActionButton
          label="Share PDF"
          onPress={handleShare}
          disabled={!canShare}
        />
        <ActionButton
          label="Start Over"
          variant="secondary"
          onPress={handleStartOver}
          accessibilityLabel="Start over"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  presetLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  uriText: {
    fontSize: 12,
    color: Colors.textCaption,
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
    color: Colors.textSecondary,
  },
  statusContent: {
    gap: 6,
  },
  footer: {
    gap: 12,
  },
});

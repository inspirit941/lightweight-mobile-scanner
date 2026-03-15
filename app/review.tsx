import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useScanSession } from "../src/hooks/useScanSession";
import { androidScannerService } from "../src/services/scanner";

export default function ReviewScreen() {
  const router = useRouter();
  const {
    scanResult,
    preset,
    updatePreset,
    updatePdfExportState,
  } = useScanSession(androidScannerService);

  const handleSave = () => {
    if (scanResult?.status === "success") {
      updatePdfExportState("generating");
      router.push("/result");
    }
  };

  if (!scanResult || scanResult.status !== "success") {
    return (
      <View style={styles.container}>
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyText}>No scan result found.</Text>
          <Text style={styles.emptySubtext}>Please go back and scan a document first.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.previewContainer}>
        <View style={styles.previewContent}>
          <Text style={styles.previewTitle}>Scan Preview</Text>
          <Text style={styles.presetLabel}>Active Preset: {preset}</Text>
          <Text style={styles.uriText} numberOfLines={1} ellipsizeMode="middle">
            {scanResult.page?.uri}
          </Text>
        </View>
      </View>

      <View style={styles.presetSection}>
        <Text style={styles.sectionTitle}>Scan Style</Text>
        <View style={styles.presetRow}>
          <TouchableOpacity
            style={[
              styles.presetButton,
              preset === "Original" && styles.activePresetButton,
            ]}
            onPress={() => updatePreset("Original")}
            accessibilityRole="button"
            accessibilityLabel="Original preset"
          >
            <Text
              style={[
                styles.presetButtonText,
                preset === "Original" && styles.activePresetButtonText,
              ]}
            >
              Original
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.presetButton,
              preset === "B&W Scan" && styles.activePresetButton,
            ]}
            onPress={() => updatePreset("B&W Scan")}
            accessibilityRole="button"
            accessibilityLabel="B&W Scan preset"
          >
            <Text
              style={[
                styles.presetButtonText,
                preset === "B&W Scan" && styles.activePresetButtonText,
              ]}
            >
              B&W Scan
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={scanResult.status !== "success"}
          accessibilityRole="button"
          accessibilityLabel="Save as PDF"
        >
          <Text style={styles.saveButtonText}>Save as PDF</Text>
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
    marginBottom: 12,
  },
  uriText: {
    fontSize: 12,
    color: "#8E8E93",
    maxWidth: "80%",
  },
  presetSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 16,
  },
  presetRow: {
    flexDirection: "row",
    gap: 12,
  },
  presetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: "#F2F2F7",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  activePresetButton: {
    backgroundColor: "#E5F1FF",
    borderColor: "#007AFF",
  },
  presetButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  activePresetButtonText: {
    color: "#007AFF",
  },
  footer: {
    paddingBottom: 10,
  },
  saveButton: {
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
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});

import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ActionButton } from "../src/components/ActionButton";
import { EmptyState } from "../src/components/EmptyState";
import { InfoSection } from "../src/components/InfoSection";
import { PreviewCard } from "../src/components/PreviewCard";
import { useScanSession } from "../src/hooks/useScanSession";
import { Colors } from "../src/theme/colors";
import { Layout } from "../src/theme/layout";
import { SCAN_PRESETS } from "../src/types/scanner";

export default function ReviewScreen() {
  const router = useRouter();
  const { scanResult, preset, updatePreset } = useScanSession();

  const handleSave = () => {
    router.push("/result");
  };

  if (!scanResult || scanResult.status !== "success") {
    return (
      <View style={Layout.screen}>
        <EmptyState
          title="No scan result found."
          message="Please go back and scan a document first."
        />
      </View>
    );
  }

  return (
    <View style={Layout.screen}>
      <PreviewCard title="Scan Preview">
        <Text style={styles.presetLabel}>Active Preset: {preset}</Text>
        <Text style={styles.uriText} numberOfLines={1} ellipsizeMode="middle">
          {scanResult.page?.uri ?? ""}
        </Text>
      </PreviewCard>

      <InfoSection
        title="Scan Style"
        style={styles.presetSection}
      >
        <View style={styles.presetRow}>
          {SCAN_PRESETS.map((scanPreset) => {
            const isActive = preset === scanPreset;

            return (
              <TouchableOpacity
                key={scanPreset}
                style={[styles.presetButton, isActive && styles.activePresetButton]}
                onPress={() => updatePreset(scanPreset)}
                accessibilityRole="button"
                accessibilityLabel={`${scanPreset} preset`}
              >
                <Text
                  style={[
                    styles.presetButtonText,
                    isActive && styles.activePresetButtonText,
                  ]}
                >
                  {scanPreset}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </InfoSection>

      <View style={Layout.footer}>
        <ActionButton label="Save as PDF" onPress={handleSave} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  presetSection: {
    marginBottom: 32,
    gap: 16,
  },
  presetLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  uriText: {
    fontSize: 12,
    color: Colors.textCaption,
    maxWidth: "80%",
    textAlign: "center",
  },
  presetRow: {
    flexDirection: "row",
    gap: 12,
  },
  presetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: Colors.secondaryBackground,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  activePresetButton: {
    backgroundColor: Colors.lightBlue,
    borderColor: Colors.primary,
  },
  presetButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.darkText,
  },
  activePresetButtonText: {
    color: Colors.primary,
  },
});

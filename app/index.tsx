import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { ActionButton } from "../src/components/ActionButton";
import { StatusMessage } from "../src/components/StatusMessage";
import { useScanSession } from "../src/hooks/useScanSession";
import { androidScannerService } from "../src/services/scanner";
import { Colors } from "../src/theme/colors";
import { Layout } from "../src/theme/layout";

export default function HomeScreen() {
  const router = useRouter();
  const { updateScanResult, scanResult } = useScanSession();

  const handleScan = async () => {
    const result = await androidScannerService.scan();
    updateScanResult(result);

    if (result.status === "success") {
      router.push("/review");
    }
  };

  return (
    <View style={[Layout.screen, styles.container]}>
      <Text style={styles.title}>Lightweight Mobile Scanner</Text>
      
      <ActionButton
        label="Scan Document"
        onPress={handleScan}
        style={styles.actionButton}
      />

      {scanResult?.status === "cancel" && (
        <StatusMessage style={styles.statusLayout}>Scan cancelled</StatusMessage>
      )}

      {scanResult?.status === "error" && (
        <StatusMessage variant="error" style={styles.statusLayout}>
          {scanResult.error?.message || "Scanner error"}
        </StatusMessage>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 40,
    color: Colors.text,
  },
  actionButton: {
    paddingHorizontal: 32,
  },
  statusLayout: {
    marginTop: 20,
    textAlign: "center",
  },
});

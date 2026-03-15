import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useScanSession } from "../src/hooks/useScanSession";
import { androidScannerService } from "../src/services/scanner";

export default function HomeScreen() {
  const router = useRouter();
  const { updateScanResult, scanResult } = useScanSession(androidScannerService);

  const handleScan = async () => {
    const result = await androidScannerService.scan();
    updateScanResult(result);

    if (result.status === "success") {
      router.push("/review");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lightweight Mobile Scanner</Text>
      
      <TouchableOpacity style={styles.button} onPress={handleScan}>
        <Text style={styles.buttonText}>Scan Document</Text>
      </TouchableOpacity>

      {scanResult?.status === "cancel" && (
        <Text style={styles.statusText}>Scan cancelled</Text>
      )}

      {scanResult?.status === "error" && (
        <Text style={[styles.statusText, styles.errorText]}>
          {scanResult.error?.message || "Scanner error"}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 40,
    color: "#1A1A1A",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  statusText: {
    marginTop: 20,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  errorText: {
    color: "#FF3B30",
  },
});

import { Stack } from "expo-router";
import { ScanSessionProvider } from "../src/context/scanSessionContext";

export default function RootLayout() {
  return (
    <ScanSessionProvider>
      <Stack />
    </ScanSessionProvider>
  );
}

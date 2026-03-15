import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../theme/colors";

interface PreviewCardProps {
  title: string;
  children?: ReactNode;
}

export const PreviewCard = ({ title, children }: PreviewCardProps) => {
  return (
    <View style={styles.previewContainer}>
      <View style={styles.previewContent}>
        <Text style={styles.previewTitle}>{title}</Text>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  previewContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.secondaryBackground,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  previewContent: {
    alignItems: "center",
    padding: 20,
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 8,
  },
});

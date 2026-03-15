import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../theme/colors";

interface EmptyStateProps {
  title: string;
  message: string;
  children?: ReactNode;
}

export const EmptyState = ({ title, message, children }: EmptyStateProps) => {
  return (
    <View style={styles.emptyStateContainer}>
      <Text style={styles.emptyText}>{title}</Text>
      <Text style={styles.emptySubtext}>{message}</Text>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
  },
});

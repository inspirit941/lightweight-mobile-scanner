import type { ReactNode } from "react";
import { type StyleProp, StyleSheet, Text, type TextStyle } from "react-native";
import { Colors } from "../theme/colors";

interface StatusMessageProps {
  children: ReactNode;
  variant?: "neutral" | "error";
  style?: StyleProp<TextStyle>;
}

export const StatusMessage = ({ children, variant = "neutral", style }: StatusMessageProps) => {
  return (
    <Text
      style={[
        styles.statusText,
        variant === "error" && styles.errorText,
        style,
      ]}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  statusText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  errorText: {
    color: Colors.error,
  },
});

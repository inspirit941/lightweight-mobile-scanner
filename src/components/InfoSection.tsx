import type { ReactNode } from "react";
import { type StyleProp, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { Colors } from "../theme/colors";

interface InfoSectionProps {
  title: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const InfoSection = ({ title, children, style }: InfoSectionProps) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
});

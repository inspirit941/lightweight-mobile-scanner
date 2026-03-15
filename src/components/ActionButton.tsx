import { StyleSheet, Text, TouchableOpacity, type TouchableOpacityProps } from "react-native";
import { Colors } from "../theme/colors";

interface ActionButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: "primary" | "secondary";
  accessibilityLabel?: string;
}

export const ActionButton = ({
  label,
  variant = "primary",
  accessibilityLabel = label,
  style,
  disabled,
  ...props
}: ActionButtonProps) => {
  const isPrimary = variant === "primary";

  return (
    <TouchableOpacity
      style={[
        isPrimary ? styles.primaryButton : styles.secondaryButton,
        disabled && isPrimary && styles.disabledButton,
        style,
      ]}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      {...props}
    >
      <Text
        style={isPrimary ? styles.primaryButtonText : styles.secondaryButtonText}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryButton: {
    backgroundColor: Colors.secondaryBackground,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryButtonText: {
    color: Colors.darkText,
    fontSize: 15,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.5,
  },
});

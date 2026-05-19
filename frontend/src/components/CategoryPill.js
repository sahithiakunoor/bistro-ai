import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { COLORS } from "../constants/colors";

export default function CategoryPill({ category, selected, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.pill, selected && styles.pillSelected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.icon}>{category.icon}</Text>
      <Text style={[styles.label, selected && styles.labelSelected]}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  pillSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  icon: {
    fontSize: 14,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  labelSelected: {
    color: COLORS.white,
  },
});

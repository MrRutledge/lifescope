import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { formatMinutes } from "@/data/sampleData";

interface CategoryDotProps {
  label: string;
  minutes: number;
  color: string;
  totalMinutes: number;
}

export function CategoryDot({ label, minutes, color, totalMinutes }: CategoryDotProps) {
  const colors = useColors();
  const pct = totalMinutes > 0 ? Math.round((minutes / totalMinutes) * 100) : 0;

  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.label, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>{label}</Text>
      <View style={styles.spacer} />
      <Text style={[styles.pct, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{pct}%</Text>
      <Text style={[styles.minutes, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
        {formatMinutes(minutes)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  label: {
    fontSize: 14,
    flex: 1,
  },
  spacer: {
    flex: 1,
  },
  pct: {
    fontSize: 13,
    width: 36,
    textAlign: "right",
  },
  minutes: {
    fontSize: 13,
    width: 44,
    textAlign: "right",
  },
});

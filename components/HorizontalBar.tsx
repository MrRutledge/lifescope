import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { formatMinutes } from "@/data/sampleData";

interface HorizontalBarProps {
  label: string;
  minutes: number;
  maxMinutes: number;
  color: string;
  showMinutes?: boolean;
  sublabel?: string;
}

export function HorizontalBar({ label, minutes, maxMinutes, color, showMinutes = true, sublabel }: HorizontalBarProps) {
  const colors = useColors();
  const pct = maxMinutes > 0 ? Math.max(0.01, minutes / maxMinutes) : 0.01;

  return (
    <View style={styles.row}>
      <View style={styles.labelWrap}>
        <Text style={[styles.label, { color: colors.foreground, fontFamily: "Inter_500Medium" }]} numberOfLines={1}>
          {label}
        </Text>
        {sublabel ? (
          <Text style={[styles.sublabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{sublabel}</Text>
        ) : null}
      </View>
      <View style={styles.barWrap}>
        <View style={[styles.barBg, { backgroundColor: colors.border }]}>
          <View style={[styles.barFill, { width: `${Math.min(100, pct * 100)}%`, backgroundColor: color }]} />
        </View>
      </View>
      {showMinutes ? (
        <Text style={[styles.minutes, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
          {formatMinutes(minutes)}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  labelWrap: {
    width: 100,
  },
  label: {
    fontSize: 14,
  },
  sublabel: {
    fontSize: 11,
    marginTop: 1,
  },
  barWrap: {
    flex: 1,
  },
  barBg: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: {
    height: 8,
    borderRadius: 4,
  },
  minutes: {
    width: 44,
    fontSize: 13,
    textAlign: "right",
  },
});

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { useColors } from "@/hooks/useColors";

interface RingProgressProps {
  size?: number;
  strokeWidth?: number;
  progress: number;
  color: string;
  label?: string;
  centerText?: string;
  centerSubtext?: string;
}

export function RingProgress({
  size = 120,
  strokeWidth = 10,
  progress,
  color,
  label,
  centerText,
  centerSubtext,
}: RingProgressProps) {
  const colors = useColors();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - Math.min(1, Math.max(0, progress)));

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>
      {(centerText || centerSubtext) && (
        <View style={[styles.center, { width: size, height: size }]}>
          {centerText && (
            <Text style={[styles.centerText, { color: color, fontFamily: "Inter_700Bold" }]}>{centerText}</Text>
          )}
          {centerSubtext && (
            <Text style={[styles.centerSubtext, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              {centerSubtext}
            </Text>
          )}
        </View>
      )}
      {label && (
        <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>{label}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    position: "relative",
  },
  center: {
    position: "absolute",
    top: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  centerText: {
    fontSize: 22,
    fontWeight: "700",
  },
  centerSubtext: {
    fontSize: 11,
    marginTop: 2,
  },
  label: {
    fontSize: 12,
    marginTop: 6,
    textAlign: "center",
  },
});

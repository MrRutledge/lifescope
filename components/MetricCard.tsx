import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface MetricCardProps {
  label: string;
  value: string;
  subtitle?: string;
  accentColor?: string;
  icon?: React.ReactNode;
  wide?: boolean;
}

export function MetricCard({ label, value, subtitle, accentColor, icon, wide }: MetricCardProps) {
  const colors = useColors();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          flex: wide ? 1 : undefined,
        },
      ]}
    >
      <View style={styles.header}>
        {icon && <View style={[styles.iconWrap, { backgroundColor: (accentColor ?? colors.primary) + "22" }]}>{icon}</View>}
        <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>{label}</Text>
      </View>
      <Text style={[styles.value, { color: accentColor ?? colors.foreground, fontFamily: "Inter_700Bold" }]}>{value}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    minWidth: 100,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  value: {
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
  },
});

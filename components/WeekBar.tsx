import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface WeekBarItem {
  label: string;
  value: number;
  dateStr: string;
}

interface WeekBarProps {
  data: WeekBarItem[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  color: string;
  maxValue?: number;
  formatValue?: (v: number) => string;
}

export function WeekBar({ data, selectedDate, onSelectDate, color, maxValue, formatValue }: WeekBarProps) {
  const colors = useColors();
  const max = maxValue ?? Math.max(...data.map(d => d.value), 1);

  return (
    <View style={styles.container}>
      {data.map((item) => {
        const isSelected = item.dateStr === selectedDate;
        const pct = Math.max(0.04, item.value / max);
        return (
          <TouchableOpacity key={item.dateStr} style={styles.col} onPress={() => onSelectDate(item.dateStr)}>
            {isSelected && formatValue ? (
              <Text style={[styles.valueLabel, { color, fontFamily: "Inter_600SemiBold" }]}>
                {formatValue(item.value)}
              </Text>
            ) : <View style={styles.valueLabelPlaceholder} />}
            <View style={styles.barContainer}>
              <View style={[styles.barBg, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.barFill,
                    {
                      height: `${Math.round(pct * 100)}%`,
                      backgroundColor: isSelected ? color : color + "55",
                    },
                  ]}
                />
              </View>
            </View>
            <Text
              style={[
                styles.dayLabel,
                {
                  color: isSelected ? color : colors.mutedForeground,
                  fontFamily: isSelected ? "Inter_700Bold" : "Inter_400Regular",
                },
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 110,
    gap: 4,
  },
  col: {
    flex: 1,
    alignItems: "center",
    height: "100%",
    justifyContent: "flex-end",
  },
  barContainer: {
    width: "100%",
    height: 70,
    justifyContent: "flex-end",
  },
  barBg: {
    width: "100%",
    height: "100%",
    borderRadius: 6,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  barFill: {
    width: "100%",
    borderRadius: 6,
  },
  dayLabel: {
    fontSize: 11,
    marginTop: 4,
  },
  valueLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  valueLabelPlaceholder: {
    height: 16,
  },
});

import React, { useRef, useEffect } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { isToday } from "@/data/sampleData";

interface DayPickerProps {
  dates: string[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

function shortDayLabel(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

function shortDateLabel(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.getDate().toString();
}

export function DayPicker({ dates, selectedDate, onSelectDate }: DayPickerProps) {
  const colors = useColors();
  const scrollRef = useRef<ScrollView>(null);
  const selectedIndex = dates.indexOf(selectedDate);

  useEffect(() => {
    if (scrollRef.current && selectedIndex >= 0) {
      scrollRef.current.scrollTo({ x: Math.max(0, selectedIndex * 52 - 120), animated: true });
    }
  }, [selectedDate, selectedIndex]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {dates.map((dateStr) => {
        const isSelected = dateStr === selectedDate;
        const todayDay = isToday(dateStr);
        return (
          <TouchableOpacity
            key={dateStr}
            onPress={() => onSelectDate(dateStr)}
            style={[
              styles.pill,
              {
                backgroundColor: isSelected ? colors.primary : colors.card,
                borderColor: isSelected ? colors.primary : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.dayText,
                {
                  color: isSelected ? colors.primaryForeground : colors.mutedForeground,
                  fontFamily: "Inter_500Medium",
                },
              ]}
            >
              {todayDay ? "Today" : shortDayLabel(dateStr)}
            </Text>
            <Text
              style={[
                styles.dateText,
                {
                  color: isSelected ? colors.primaryForeground : colors.foreground,
                  fontFamily: isSelected ? "Inter_700Bold" : "Inter_600SemiBold",
                },
              ]}
            >
              {shortDateLabel(dateStr)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 4,
  },
  pill: {
    width: 50,
    borderRadius: 14,
    alignItems: "center",
    paddingVertical: 8,
    borderWidth: 1,
  },
  dayText: {
    fontSize: 10,
    letterSpacing: 0.2,
  },
  dateText: {
    fontSize: 18,
    marginTop: 2,
  },
});

import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { SAMPLE_DATA, getLast7Days, getDayByDate, getToday, formatMinutes, CAL_COLORS, CAL_COLORS_DARK, CalendarEvent } from "@/data/sampleData";
import { DayPicker } from "@/components/DayPicker";
import { SectionHeader } from "@/components/SectionHeader";
import { HorizontalBar } from "@/components/HorizontalBar";
import { WeekBar } from "@/components/WeekBar";
import { useColorScheme } from "react-native";

export default function CalendarScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const today = getToday();
  const [selectedDate, setSelectedDate] = useState(today.date);
  const day = getDayByDate(selectedDate) ?? today;

  const calColors = isDark ? CAL_COLORS_DARK : CAL_COLORS;
  const totalScheduledMinutes = day.calendarCategories.reduce((s, c) => s + c.minutes, 0);
  const maxCatMinutes = day.calendarCategories[0]?.minutes ?? 1;

  const last7 = getLast7Days();
  const workMinutesData = last7.map(d => ({
    label: new Date(d.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "narrow" }),
    value: d.calendarCategories.find(c => c.category === "Work")?.minutes ?? 0,
    dateStr: d.date,
  }));

  const topPt = Platform.OS === "web" ? 67 : 0;
  const bottomPt = Platform.OS === "web" ? 34 : 0;

  function eventTimeLabel(evt: CalendarEvent): string {
    const ampm = evt.startHour >= 12 ? "PM" : "AM";
    const hour = evt.startHour > 12 ? evt.startHour - 12 : evt.startHour === 0 ? 12 : evt.startHour;
    const endMinute = evt.startHour * 60 + evt.durationMinutes;
    const endHour = Math.floor(endMinute / 60);
    const endAmpm = endHour >= 12 ? "PM" : "AM";
    const endH = endHour > 12 ? endHour - 12 : endHour === 0 ? 12 : endHour;
    return `${hour}:00 ${ampm} – ${endH}:${endMinute % 60 === 0 ? "00" : endMinute % 60} ${endAmpm}`;
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 16 + topPt, paddingBottom: insets.bottom + 100 + bottomPt },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Calendar</Text>
        <View style={[styles.badge, { backgroundColor: colors.calendarColor + "22" }]}>
          <Ionicons name="calendar" size={14} color={colors.calendarColor} />
          <Text style={[styles.badgeText, { color: colors.calendarColor, fontFamily: "Inter_600SemiBold" }]}>
            {day.events.length} events
          </Text>
        </View>
      </View>

      <View style={styles.pickerWrap}>
        <DayPicker
          dates={SAMPLE_DATA.map(d => d.date)}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SectionHeader title="Time Breakdown" subtitle={formatMinutes(totalScheduledMinutes) + " scheduled"} />
        {day.calendarCategories.map(cat => (
          <HorizontalBar
            key={cat.category}
            label={cat.category}
            minutes={cat.minutes}
            maxMinutes={maxCatMinutes}
            color={calColors[cat.category] ?? colors.primary}
          />
        ))}
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SectionHeader title="Events Today" />
        {day.events.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={32} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              No events scheduled
            </Text>
          </View>
        ) : (
          day.events
            .sort((a, b) => a.startHour - b.startHour)
            .map((evt, i) => (
              <View
                key={i}
                style={[
                  styles.eventCard,
                  {
                    backgroundColor: (calColors[evt.category] ?? colors.primary) + "18",
                    borderLeftColor: calColors[evt.category] ?? colors.primary,
                  },
                ]}
              >
                <View style={styles.eventContent}>
                  <Text style={[styles.eventTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                    {evt.title}
                  </Text>
                  <Text style={[styles.eventTime, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    {eventTimeLabel(evt)} · {formatMinutes(evt.durationMinutes)}
                  </Text>
                </View>
                <View style={[styles.eventBadge, { backgroundColor: calColors[evt.category] ? calColors[evt.category] + "33" : colors.secondary }]}>
                  <Text style={[styles.eventCategory, { color: calColors[evt.category] ?? colors.primary, fontFamily: "Inter_500Medium" }]}>
                    {evt.category}
                  </Text>
                </View>
              </View>
            ))
        )}
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SectionHeader title="Work Time This Week" subtitle="Work focus trend" />
        <WeekBar
          data={workMinutesData}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          color={calColors["Work"]}
          formatValue={formatMinutes}
        />
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SectionHeader title="Weekly Summary" />
        {(["Work", "Personal", "Health", "Social", "Learning", "Free"] as const).map(cat => {
          const totalMins = last7.reduce((s, d) => {
            return s + (d.calendarCategories.find(c => c.category === cat)?.minutes ?? 0);
          }, 0);
          if (totalMins === 0) return null;
          return (
            <View key={cat} style={styles.summaryRow}>
              <View style={[styles.catDot, { backgroundColor: calColors[cat] ?? colors.primary }]} />
              <Text style={[styles.summaryLabel, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>{cat}</Text>
              <Text style={[styles.summaryVal, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {formatMinutes(totalMins)} this week
              </Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 0 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: { fontSize: 28, fontWeight: "700" },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: { fontSize: 14 },
  pickerWrap: { marginBottom: 16 },
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  eventCard: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  eventContent: { flex: 1 },
  eventTitle: { fontSize: 14 },
  eventTime: { fontSize: 12, marginTop: 3 },
  eventBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginLeft: 8,
  },
  eventCategory: { fontSize: 11 },
  emptyState: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 8,
  },
  emptyText: { fontSize: 14 },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  catDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  summaryLabel: {
    fontSize: 14,
    flex: 1,
  },
  summaryVal: {
    fontSize: 13,
  },
});

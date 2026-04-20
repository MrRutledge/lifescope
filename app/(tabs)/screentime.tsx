import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View, Platform, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { SAMPLE_DATA, getLast7Days, getDayByDate, getToday, formatMinutes, CATEGORY_COLORS, CATEGORY_COLORS_DARK } from "@/data/sampleData";
import { DayPicker } from "@/components/DayPicker";
import { SectionHeader } from "@/components/SectionHeader";
import { HorizontalBar } from "@/components/HorizontalBar";
import { WeekBar } from "@/components/WeekBar";
import { CategoryDot } from "@/components/CategoryDot";

export default function ScreenTimeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const today = getToday();
  const [selectedDate, setSelectedDate] = useState(today.date);
  const day = getDayByDate(selectedDate) ?? today;
  const catColors = isDark ? CATEGORY_COLORS_DARK : CATEGORY_COLORS;

  const last7 = getLast7Days();
  const weekBarData = last7.map(d => ({
    label: new Date(d.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "narrow" }),
    value: d.totalScreenTimeMinutes,
    dateStr: d.date,
  }));

  const maxAppMinutes = day.appUsage[0]?.minutes ?? 1;

  const topPt = Platform.OS === "web" ? 67 : 0;
  const bottomPt = Platform.OS === "web" ? 34 : 0;

  const weekAvg = Math.round(last7.reduce((s, d) => s + d.totalScreenTimeMinutes, 0) / 7);

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
        <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Screen Time</Text>
        <View style={[styles.badge, { backgroundColor: colors.screenTimeColor + "22" }]}>
          <Ionicons name="phone-portrait" size={14} color={colors.screenTimeColor} />
          <Text style={[styles.badgeText, { color: colors.screenTimeColor, fontFamily: "Inter_600SemiBold" }]}>
            {formatMinutes(day.totalScreenTimeMinutes)}
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
        <SectionHeader title="This Week" subtitle={`Avg ${formatMinutes(weekAvg)}/day`} />
        <WeekBar
          data={weekBarData}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          color={colors.screenTimeColor}
          formatValue={formatMinutes}
        />
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SectionHeader title="By Category" subtitle={formatMinutes(day.totalScreenTimeMinutes) + " total"} />
        {day.categoryUsage.map(cat => (
          <CategoryDot
            key={cat.category}
            label={cat.category}
            minutes={cat.minutes}
            color={catColors[cat.category] ?? colors.primary}
            totalMinutes={day.totalScreenTimeMinutes}
          />
        ))}
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SectionHeader title="Top Apps" />
        {day.appUsage.slice(0, 8).map((app) => (
          <HorizontalBar
            key={app.name}
            label={app.name}
            minutes={app.minutes}
            maxMinutes={maxAppMinutes}
            color={catColors[app.category] ?? colors.primary}
            sublabel={app.category}
          />
        ))}
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SectionHeader title="Insights" />
        <View style={styles.insightRow}>
          <Ionicons name="trending-up" size={16} color={day.totalScreenTimeMinutes > weekAvg ? colors.destructive : colors.success} />
          <Text style={[styles.insightText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
            {day.totalScreenTimeMinutes > weekAvg
              ? `${formatMinutes(day.totalScreenTimeMinutes - weekAvg)} above your weekly average`
              : `${formatMinutes(weekAvg - day.totalScreenTimeMinutes)} below your weekly average`}
          </Text>
        </View>
        <View style={styles.insightRow}>
          <Ionicons name="time" size={16} color={colors.warning} />
          <Text style={[styles.insightText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
            {`Most time spent on ${day.appUsage[0]?.name ?? "apps"} — ${formatMinutes(day.appUsage[0]?.minutes ?? 0)}`}
          </Text>
        </View>
        <View style={styles.insightRow}>
          <Ionicons name="phone-portrait" size={16} color={colors.calendarColor} />
          <Text style={[styles.insightText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
            {`${day.categoryUsage[0]?.category ?? "Social"} is your top category at ${Math.round((day.categoryUsage[0]?.minutes ?? 0) / day.totalScreenTimeMinutes * 100)}% of screen time`}
          </Text>
        </View>
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
  insightRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 12,
  },
  insightText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
});

import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View, useColorScheme, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { SAMPLE_DATA, formatMinutes, formatDate, getToday, getDayByDate } from "@/data/sampleData";
import { MetricCard } from "@/components/MetricCard";
import { DayPicker } from "@/components/DayPicker";
import { SectionHeader } from "@/components/SectionHeader";
import { HorizontalBar } from "@/components/HorizontalBar";
import { CATEGORY_COLORS, CATEGORY_COLORS_DARK } from "@/data/sampleData";
import { useHealthContext } from "@/context/HealthContext";
import { useHydration } from "@/hooks/useHydration";
import type { RealHealthData } from "@/data/healthConnectService";

export default function OverviewScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const googleFit = useHealthContext();

  const today = getToday();
  const [selectedDate, setSelectedDate] = useState(today.date);
  const day = getDayByDate(selectedDate) ?? today;

  const catColors = isDark ? CATEGORY_COLORS_DARK : CATEGORY_COLORS;
  const topCategories = day.categoryUsage.slice(0, 3);
  const maxCatMinutes = topCategories[0]?.minutes ?? 1;

  const todayStr = new Date().toISOString().split("T")[0];
  const isToday = selectedDate === todayStr;

  const realWeekMap: Record<string, RealHealthData> = {};
  if (googleFit.weekData) {
    for (const d of googleFit.weekData) {
      realWeekMap[d.date] = d;
    }
  }

  const realDay =
    isToday && googleFit.todayData
      ? googleFit.todayData
      : realWeekMap[selectedDate];

  const steps = realDay?.steps ?? day.health.steps;
  const sleepHours = realDay?.sleepHours ?? day.health.sleepHours;
  const sleepQuality = realDay?.sleepQuality ?? day.health.sleepQuality;
  const heartRateResting = realDay?.heartRateResting ?? day.health.heartRateResting;
  const activeMinutes = realDay?.activeMinutes ?? day.health.activeMinutes;
  const caloriesBurned = realDay?.caloriesBurned ?? day.health.caloriesBurned;

  const hydration = useHydration(selectedDate);

  const isLiveData = googleFit.status === "connected" && realDay != null;

  const topPt = Platform.OS === "web" ? 67 : 0;
  const bottomPt = Platform.OS === "web" ? 34 : 0;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + 16 + topPt,
          paddingBottom: insets.bottom + 100 + bottomPt,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.titleRow}>
        <View>
          <Text style={[styles.appName, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>LifeScope</Text>
          <Text style={[styles.dateLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {formatDate(selectedDate)}
          </Text>
        </View>
        <View style={styles.headerRight}>
          {isLiveData && (
            <View style={[styles.liveBadge, { backgroundColor: colors.healthColor + "22" }]}>
              <View style={[styles.liveDot, { backgroundColor: colors.healthColor }]} />
              <Text style={[styles.liveText, { color: colors.healthColor, fontFamily: "Inter_600SemiBold" }]}>
                Live
              </Text>
            </View>
          )}
          <View style={[styles.avatarWrap, { backgroundColor: colors.primary + "22" }]}>
            <Ionicons name="person" size={20} color={colors.primary} />
          </View>
        </View>
      </View>

      <View style={styles.pickerWrap}>
        <DayPicker
          dates={SAMPLE_DATA.map(d => d.date)}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.metricsGrid}>
          <MetricCard
            label="Screen Time"
            value={formatMinutes(day.totalScreenTimeMinutes)}
            subtitle="total today"
            accentColor={colors.screenTimeColor}
            icon={<Ionicons name="phone-portrait" size={14} color={colors.screenTimeColor} />}
            wide
          />
          <MetricCard
            label="Steps"
            value={steps.toLocaleString()}
            subtitle="goal 10,000"
            accentColor={colors.healthColor}
            icon={<Ionicons name="walk" size={14} color={colors.healthColor} />}
            wide
          />
        </View>

        <View style={styles.metricsGrid}>
          <MetricCard
            label="Sleep"
            value={`${sleepHours}h`}
            subtitle={`Quality ${sleepQuality}%`}
            accentColor={colors.calendarColor}
            icon={<Ionicons name="moon" size={14} color={colors.calendarColor} />}
            wide
          />
          <MetricCard
            label="Heart Rate"
            value={`${heartRateResting}`}
            subtitle="bpm resting"
            accentColor={colors.trendsColor}
            icon={<Ionicons name="heart" size={14} color={colors.trendsColor} />}
            wide
          />
        </View>
      </View>

      <View style={[styles.section, styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SectionHeader title="Top Screen Time" subtitle="By category today" />
        {topCategories.map(cat => (
          <HorizontalBar
            key={cat.category}
            label={cat.category}
            minutes={cat.minutes}
            maxMinutes={maxCatMinutes}
            color={catColors[cat.category] ?? colors.primary}
          />
        ))}
      </View>

      <View style={[styles.section, styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SectionHeader title="Today's Schedule" subtitle={`${day.events.length} events`} />
        {day.events.map((evt, i) => (
          <View key={i} style={[styles.eventRow, { borderLeftColor: colors.primary + "66" }]}>
            <View style={[styles.eventDot, { backgroundColor: colors.primary }]} />
            <View style={styles.eventInfo}>
              <Text style={[styles.eventTitle, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                {evt.title}
              </Text>
              <Text style={[styles.eventMeta, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {evt.startHour}:00 · {formatMinutes(evt.durationMinutes)}
              </Text>
            </View>
            <View style={[styles.eventCategoryBadge, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.eventCategory, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                {evt.category}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={[styles.section, styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SectionHeader title="Active Minutes" />
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statVal, { color: colors.healthColor, fontFamily: "Inter_700Bold" }]}>
              {activeMinutes}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Active min</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statVal, { color: colors.warning, fontFamily: "Inter_700Bold" }]}>
              {caloriesBurned.toLocaleString()}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Calories</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statVal, { color: colors.calendarColor, fontFamily: "Inter_700Bold" }]}>
              {hydration.oz}oz
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Hydration</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 0,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: "700",
  },
  dateLabel: {
    fontSize: 14,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  liveText: {
    fontSize: 12,
  },
  avatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  pickerWrap: {
    marginBottom: 20,
  },
  section: {
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  sectionCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginHorizontal: 20,
    paddingHorizontal: 16,
  },
  metricsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  eventRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
    paddingLeft: 10,
    borderLeftWidth: 2,
  },
  eventDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 14,
  },
  eventMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  eventCategoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  eventCategory: {
    fontSize: 11,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  statVal: {
    fontSize: 22,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
});

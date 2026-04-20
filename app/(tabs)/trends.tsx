import React from "react";
import { ScrollView, StyleSheet, Text, View, Platform, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { getLast7Days, getPrevious7Days, getLast30Days, formatMinutes, CATEGORY_COLORS, CATEGORY_COLORS_DARK } from "@/data/sampleData";
import { SectionHeader } from "@/components/SectionHeader";
import { WeekBar } from "@/components/WeekBar";

export default function TrendsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const last7 = getLast7Days();
  const prev7 = getPrevious7Days();
  const last30 = getLast30Days();
  const catColors = isDark ? CATEGORY_COLORS_DARK : CATEGORY_COLORS;

  const today30 = last30[last30.length - 1];
  const todayDate = today30.date;

  const weekOverWeek = {
    screenTime: {
      thisWeek: Math.round(last7.reduce((s, d) => s + d.totalScreenTimeMinutes, 0) / 7),
      lastWeek: Math.round(prev7.reduce((s, d) => s + d.totalScreenTimeMinutes, 0) / Math.max(1, prev7.length)),
    },
    sleep: {
      thisWeek: last7.reduce((s, d) => s + d.health.sleepHours, 0) / 7,
      lastWeek: prev7.reduce((s, d) => s + d.health.sleepHours, 0) / Math.max(1, prev7.length),
    },
    steps: {
      thisWeek: Math.round(last7.reduce((s, d) => s + d.health.steps, 0) / 7),
      lastWeek: Math.round(prev7.reduce((s, d) => s + d.health.steps, 0) / Math.max(1, prev7.length)),
    },
    activeMinutes: {
      thisWeek: Math.round(last7.reduce((s, d) => s + d.health.activeMinutes, 0) / 7),
      lastWeek: Math.round(prev7.reduce((s, d) => s + d.health.activeMinutes, 0) / Math.max(1, prev7.length)),
    },
  };

  const screenTimeData = last7.map(d => ({
    label: new Date(d.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "narrow" }),
    value: d.totalScreenTimeMinutes,
    dateStr: d.date,
  }));

  const sleepData = last7.map(d => ({
    label: new Date(d.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "narrow" }),
    value: parseFloat(d.health.sleepHours.toFixed(1)),
    dateStr: d.date,
  }));

  const activeData = last7.map(d => ({
    label: new Date(d.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "narrow" }),
    value: d.health.activeMinutes,
    dateStr: d.date,
  }));

  const avgScreenTime7 = Math.round(last7.reduce((s, d) => s + d.totalScreenTimeMinutes, 0) / 7);
  const avgScreenTime30 = Math.round(last30.reduce((s, d) => s + d.totalScreenTimeMinutes, 0) / 30);
  const avgSleep7 = last7.reduce((s, d) => s + d.health.sleepHours, 0) / 7;
  const avgSleep30 = last30.reduce((s, d) => s + d.health.sleepHours, 0) / 30;
  const avgSteps7 = Math.round(last7.reduce((s, d) => s + d.health.steps, 0) / 7);
  const avgSteps30 = Math.round(last30.reduce((s, d) => s + d.health.steps, 0) / 30);

  const topPt = Platform.OS === "web" ? 67 : 0;
  const bottomPt = Platform.OS === "web" ? 34 : 0;

  function trendIcon(current: number, previous: number, lowerIsBetter = false) {
    const better = lowerIsBetter ? current < previous : current > previous;
    if (Math.abs(current - previous) < 0.01 * Math.abs(previous)) return null;
    return (
      <Ionicons
        name={current > previous ? "trending-up" : "trending-down"}
        size={14}
        color={better ? colors.success : colors.destructive}
      />
    );
  }

  const catBreakdown30 = ["Social", "Productivity", "Entertainment", "Communication", "Health", "Other"].map(cat => {
    const avg = Math.round(last30.reduce((s, d) => {
      return s + (d.categoryUsage.find(c => c.category === cat)?.minutes ?? 0);
    }, 0) / 30);
    return { category: cat, avgMinutes: avg };
  }).sort((a, b) => b.avgMinutes - a.avgMinutes);

  const maxCatAvg = catBreakdown30[0]?.avgMinutes ?? 1;

  const sleepScreenCorrelation = (() => {
    const highSleepDays = last30.filter(d => d.health.sleepHours >= 7.5);
    const lowSleepDays = last30.filter(d => d.health.sleepHours < 7.5);
    const avgSTHighSleep = highSleepDays.length > 0
      ? Math.round(highSleepDays.reduce((s, d) => s + d.totalScreenTimeMinutes, 0) / highSleepDays.length)
      : 0;
    const avgSTLowSleep = lowSleepDays.length > 0
      ? Math.round(lowSleepDays.reduce((s, d) => s + d.totalScreenTimeMinutes, 0) / lowSleepDays.length)
      : 0;
    return { avgSTHighSleep, avgSTLowSleep };
  })();

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
        <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Trends</Text>
        <View style={[styles.badge, { backgroundColor: colors.trendsColor + "22" }]}>
          <Ionicons name="analytics" size={14} color={colors.trendsColor} />
          <Text style={[styles.badgeText, { color: colors.trendsColor, fontFamily: "Inter_600SemiBold" }]}>30 days</Text>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SectionHeader title="This Week vs Last Week" subtitle="Day-by-day averages" />
        {[
          {
            icon: "phone-portrait" as const,
            label: "Screen Time",
            color: colors.screenTimeColor,
            thisWeek: formatMinutes(weekOverWeek.screenTime.thisWeek),
            lastWeek: formatMinutes(weekOverWeek.screenTime.lastWeek),
            delta: weekOverWeek.screenTime.thisWeek - weekOverWeek.screenTime.lastWeek,
            lowerIsBetter: true,
            raw: { a: weekOverWeek.screenTime.thisWeek, b: weekOverWeek.screenTime.lastWeek },
          },
          {
            icon: "moon" as const,
            label: "Sleep",
            color: colors.calendarColor,
            thisWeek: weekOverWeek.sleep.thisWeek.toFixed(1) + "h",
            lastWeek: weekOverWeek.sleep.lastWeek.toFixed(1) + "h",
            delta: weekOverWeek.sleep.thisWeek - weekOverWeek.sleep.lastWeek,
            lowerIsBetter: false,
            raw: { a: weekOverWeek.sleep.thisWeek, b: weekOverWeek.sleep.lastWeek },
          },
          {
            icon: "walk" as const,
            label: "Steps",
            color: colors.healthColor,
            thisWeek: (weekOverWeek.steps.thisWeek / 1000).toFixed(1) + "k",
            lastWeek: (weekOverWeek.steps.lastWeek / 1000).toFixed(1) + "k",
            delta: weekOverWeek.steps.thisWeek - weekOverWeek.steps.lastWeek,
            lowerIsBetter: false,
            raw: { a: weekOverWeek.steps.thisWeek, b: weekOverWeek.steps.lastWeek },
          },
          {
            icon: "flame" as const,
            label: "Active mins",
            color: "#F97316",
            thisWeek: weekOverWeek.activeMinutes.thisWeek + " min",
            lastWeek: weekOverWeek.activeMinutes.lastWeek + " min",
            delta: weekOverWeek.activeMinutes.thisWeek - weekOverWeek.activeMinutes.lastWeek,
            lowerIsBetter: false,
            raw: { a: weekOverWeek.activeMinutes.thisWeek, b: weekOverWeek.activeMinutes.lastWeek },
          },
        ].map(row => {
          const pct = row.raw.b !== 0 ? ((row.delta / row.raw.b) * 100).toFixed(0) : "0";
          const up = row.delta > 0;
          const neutral = Math.abs(row.delta) < 0.01 * Math.abs(row.raw.b);
          const positive = neutral ? true : (up ? !row.lowerIsBetter : row.lowerIsBetter);
          const deltaColor = neutral ? colors.mutedForeground : positive ? colors.success : colors.destructive;
          return (
            <View key={row.label} style={[styles.wowRow, { borderBottomColor: colors.border }]}>
              <Ionicons name={row.icon} size={16} color={row.color} style={{ marginRight: 8 }} />
              <Text style={[styles.wowLabel, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                {row.label}
              </Text>
              <View style={styles.wowValues}>
                <Text style={[styles.wowThis, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                  {row.thisWeek}
                </Text>
                <Text style={[styles.wowLast, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  vs {row.lastWeek}
                </Text>
                {!neutral && (
                  <View style={[styles.wowBadge, { backgroundColor: deltaColor + "22" }]}>
                    <Ionicons name={up ? "arrow-up" : "arrow-down"} size={10} color={deltaColor} />
                    <Text style={[styles.wowPct, { color: deltaColor, fontFamily: "Inter_600SemiBold" }]}>
                      {Math.abs(parseInt(pct))}%
                    </Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SectionHeader title="7-Day vs 30-Day Averages" />
        <View style={styles.compareRow}>
          <View style={[styles.compareCard, { backgroundColor: colors.background }]}>
            <View style={styles.compareIconRow}>
              <Ionicons name="phone-portrait" size={16} color={colors.screenTimeColor} />
              {trendIcon(avgScreenTime7, avgScreenTime30, true)}
            </View>
            <Text style={[styles.compareVal, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              {formatMinutes(avgScreenTime7)}
            </Text>
            <Text style={[styles.compareLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Screen Time
            </Text>
            <Text style={[styles.compareSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              vs {formatMinutes(avgScreenTime30)} (30d)
            </Text>
          </View>
          <View style={[styles.compareCard, { backgroundColor: colors.background }]}>
            <View style={styles.compareIconRow}>
              <Ionicons name="moon" size={16} color={colors.calendarColor} />
              {trendIcon(avgSleep7, avgSleep30)}
            </View>
            <Text style={[styles.compareVal, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              {avgSleep7.toFixed(1)}h
            </Text>
            <Text style={[styles.compareLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Sleep
            </Text>
            <Text style={[styles.compareSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              vs {avgSleep30.toFixed(1)}h (30d)
            </Text>
          </View>
          <View style={[styles.compareCard, { backgroundColor: colors.background }]}>
            <View style={styles.compareIconRow}>
              <Ionicons name="walk" size={16} color={colors.healthColor} />
              {trendIcon(avgSteps7, avgSteps30)}
            </View>
            <Text style={[styles.compareVal, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              {(avgSteps7 / 1000).toFixed(1)}k
            </Text>
            <Text style={[styles.compareLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Steps
            </Text>
            <Text style={[styles.compareSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              vs {(avgSteps30 / 1000).toFixed(1)}k (30d)
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SectionHeader title="Screen Time This Week" subtitle={`Avg ${formatMinutes(avgScreenTime7)}/day`} />
        <WeekBar
          data={screenTimeData}
          selectedDate={todayDate}
          onSelectDate={() => {}}
          color={colors.screenTimeColor}
          formatValue={formatMinutes}
        />
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SectionHeader title="Sleep vs Screen Time" subtitle="Correlation insight" />
        <View style={[styles.correlationBox, { backgroundColor: colors.background }]}>
          <Ionicons name="bulb" size={20} color={colors.warning} />
          <Text style={[styles.correlationText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
            {`On nights with 7.5+ hours of sleep, your screen time averages `}
            <Text style={[styles.bold, { color: colors.calendarColor }]}>
              {formatMinutes(sleepScreenCorrelation.avgSTHighSleep)}
            </Text>
            {`. On lower sleep nights, it averages `}
            <Text style={[styles.bold, { color: colors.destructive }]}>
              {formatMinutes(sleepScreenCorrelation.avgSTLowSleep)}
            </Text>
            {`.`}
          </Text>
        </View>
        <View style={styles.correlationStats}>
          <View style={styles.corrStatItem}>
            <Text style={[styles.corrStatVal, { color: colors.calendarColor, fontFamily: "Inter_700Bold" }]}>
              {formatMinutes(sleepScreenCorrelation.avgSTHighSleep)}
            </Text>
            <Text style={[styles.corrStatLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Good sleep nights
            </Text>
          </View>
          <View style={[styles.corrDivider, { backgroundColor: colors.border }]} />
          <View style={styles.corrStatItem}>
            <Text style={[styles.corrStatVal, { color: colors.destructive, fontFamily: "Inter_700Bold" }]}>
              {formatMinutes(sleepScreenCorrelation.avgSTLowSleep)}
            </Text>
            <Text style={[styles.corrStatLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Low sleep nights
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SectionHeader title="Active Minutes Trend" subtitle="Last 7 days" />
        <WeekBar
          data={activeData}
          selectedDate={todayDate}
          onSelectDate={() => {}}
          color={colors.healthColor}
          maxValue={90}
          formatValue={v => `${v}m`}
        />
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SectionHeader title="30-Day Screen Category Avg" subtitle="Daily average by category" />
        {catBreakdown30.filter(c => c.avgMinutes > 0).map(cat => (
          <View key={cat.category} style={styles.catRow}>
            <View style={[styles.catDot, { backgroundColor: catColors[cat.category] ?? colors.primary }]} />
            <Text style={[styles.catLabel, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
              {cat.category}
            </Text>
            <View style={styles.catBarWrap}>
              <View style={[styles.catBarBg, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.catBarFill,
                    {
                      width: `${Math.min(100, Math.round(cat.avgMinutes / maxCatAvg * 100))}%`,
                      backgroundColor: catColors[cat.category] ?? colors.primary,
                    },
                  ]}
                />
              </View>
            </View>
            <Text style={[styles.catVal, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
              {formatMinutes(cat.avgMinutes)}
            </Text>
          </View>
        ))}
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
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  compareRow: {
    flexDirection: "row",
    gap: 10,
  },
  compareCard: {
    flex: 1,
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    gap: 2,
  },
  compareIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  compareVal: { fontSize: 18, fontWeight: "700" },
  compareLabel: { fontSize: 11, textAlign: "center" },
  compareSub: { fontSize: 10, textAlign: "center", marginTop: 2 },
  correlationBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  correlationText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  bold: { fontFamily: "Inter_700Bold" },
  correlationStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  corrStatItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  corrDivider: {
    width: 1,
    height: 40,
    marginHorizontal: 10,
  },
  corrStatVal: { fontSize: 20, fontWeight: "700" },
  corrStatLabel: { fontSize: 12, textAlign: "center" },
  catRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  catDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  catLabel: {
    fontSize: 13,
    width: 95,
  },
  catBarWrap: {
    flex: 1,
  },
  catBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  catBarFill: {
    height: 8,
    borderRadius: 4,
  },
  catVal: {
    fontSize: 12,
    width: 44,
    textAlign: "right",
  },
  wowRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  wowLabel: {
    fontSize: 14,
    flex: 1,
  },
  wowValues: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  wowThis: {
    fontSize: 14,
  },
  wowLast: {
    fontSize: 12,
  },
  wowBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  wowPct: {
    fontSize: 11,
  },
});

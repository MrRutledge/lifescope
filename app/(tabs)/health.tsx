import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View, Platform, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { SAMPLE_DATA, getLast7Days, getDayByDate, getToday } from "@/data/sampleData";
import { DayPicker } from "@/components/DayPicker";
import { SectionHeader } from "@/components/SectionHeader";
import { WeekBar } from "@/components/WeekBar";
import { RingProgress } from "@/components/RingProgress";
import { HealthConnectBanner } from "@/components/HealthConnectBanner";
import { useHealthContext } from "@/context/HealthContext";
import { useHydration } from "@/hooks/useHydration";
import type { HealthData } from "@/data/sampleData";
import type { RealHealthData } from "@/data/healthConnectService";

function mergeHealth(
  sampleHealth: HealthData,
  real: RealHealthData | undefined
): HealthData {
  if (!real) return sampleHealth;
  return {
    steps: real.steps !== null ? real.steps : sampleHealth.steps,
    sleepHours: real.sleepHours !== null ? real.sleepHours : sampleHealth.sleepHours,
    sleepQuality: real.sleepQuality !== null ? real.sleepQuality : sampleHealth.sleepQuality,
    heartRateResting: real.heartRateResting !== null ? real.heartRateResting : sampleHealth.heartRateResting,
    heartRateAvg: real.heartRateAvg !== null ? real.heartRateAvg : sampleHealth.heartRateAvg,
    activeMinutes: real.activeMinutes !== null ? real.activeMinutes : sampleHealth.activeMinutes,
    caloriesBurned: real.caloriesBurned !== null ? real.caloriesBurned : sampleHealth.caloriesBurned,
    hydrationOz: sampleHealth.hydrationOz,
  };
}

export default function HealthScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const googleFit = useHealthContext();

  const today = getToday();
  const [selectedDate, setSelectedDate] = useState(today.date);
  const sampleDay = getDayByDate(selectedDate) ?? today;

  const todayStr = new Date().toISOString().split("T")[0];
  const isToday = selectedDate === todayStr;

  const realWeekMap: Record<string, RealHealthData> = {};
  if (googleFit.weekData) {
    for (const d of googleFit.weekData) {
      realWeekMap[d.date] = d;
    }
  }
  if (isToday && googleFit.todayData) {
    realWeekMap[todayStr] = googleFit.todayData;
  }

  const health = mergeHealth(sampleDay.health, realWeekMap[selectedDate]);
  const hydration = useHydration(selectedDate);

  const last7 = getLast7Days();
  const stepsBarData = last7.map(d => ({
    label: new Date(d.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "narrow" }),
    value: realWeekMap[d.date]?.steps ?? d.health.steps,
    dateStr: d.date,
  }));
  const sleepBarData = last7.map(d => {
    const sleepHours = realWeekMap[d.date]?.sleepHours ?? d.health.sleepHours;
    return {
      label: new Date(d.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "narrow" }),
      value: parseFloat(sleepHours.toFixed(1)),
      dateStr: d.date,
    };
  });

  const stepsGoal = 10000;
  const stepsPct = Math.min(1, health.steps / stepsGoal);
  const sleepGoal = 8;
  const sleepPct = Math.min(1, health.sleepHours / sleepGoal);

  const avgSleep =
    last7.reduce((s, d) => s + (realWeekMap[d.date]?.sleepHours ?? d.health.sleepHours), 0) / 7;
  const avgSteps = Math.round(stepsBarData.reduce((s, d) => s + d.value, 0) / 7);
  const avgHR = Math.round(
    last7.reduce((s, d) => s + (realWeekMap[d.date]?.heartRateResting ?? d.health.heartRateResting), 0) / 7
  );

  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [goalInput, setGoalInput] = useState("");

  function openGoalModal() {
    setGoalInput(String(hydration.goalOz));
    setGoalModalVisible(true);
  }

  function saveGoal() {
    const parsed = parseInt(goalInput, 10);
    if (!isNaN(parsed) && parsed > 0) {
      hydration.setGoal(parsed);
    }
    setGoalModalVisible(false);
  }

  const topPt = Platform.OS === "web" ? 67 : 0;
  const bottomPt = Platform.OS === "web" ? 34 : 0;

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
        <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Health</Text>
        <View style={[styles.badge, { backgroundColor: colors.healthColor + "22" }]}>
          <Ionicons name="heart" size={14} color={colors.healthColor} />
          <Text style={[styles.badgeText, { color: colors.healthColor, fontFamily: "Inter_600SemiBold" }]}>
            {health.heartRateResting} bpm
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

      <HealthConnectBanner
        status={googleFit.status}
        lastSynced={googleFit.lastSynced}
        errorMessage={googleFit.errorMessage}
        onConnect={googleFit.connect}
        onDisconnect={googleFit.disconnect}
        onRefresh={googleFit.refresh}
      />

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SectionHeader
          title="Today at a Glance"
          subtitle={googleFit.status === "connected" && realWeekMap[selectedDate] ? "Live data" : "Sample data"}
        />
        <View style={styles.ringsRow}>
          <View style={styles.ringItem}>
            <RingProgress
              size={110}
              progress={stepsPct}
              color={colors.healthColor}
              centerText={`${Math.round(stepsPct * 100)}%`}
              centerSubtext="goal"
            />
            <Text style={[styles.ringLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>Steps</Text>
            <Text style={[styles.ringValue, { color: colors.healthColor, fontFamily: "Inter_700Bold" }]}>
              {health.steps.toLocaleString()}
            </Text>
          </View>
          <View style={styles.ringItem}>
            <RingProgress
              size={110}
              progress={sleepPct}
              color={colors.calendarColor}
              centerText={`${health.sleepHours}h`}
              centerSubtext={`of ${sleepGoal}h`}
            />
            <Text style={[styles.ringLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>Sleep</Text>
            <Text style={[styles.ringValue, { color: colors.calendarColor, fontFamily: "Inter_700Bold" }]}>
              Quality {health.sleepQuality}%
            </Text>
          </View>
          <View style={styles.ringItem}>
            <RingProgress
              size={110}
              progress={Math.min(1, health.activeMinutes / 60)}
              color={colors.warning}
              centerText={`${health.activeMinutes}m`}
              centerSubtext="active"
            />
            <Text style={[styles.ringLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>Active</Text>
            <Text style={[styles.ringValue, { color: colors.warning, fontFamily: "Inter_700Bold" }]}>
              {health.caloriesBurned} cal
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SectionHeader title="Steps This Week" subtitle={`Avg ${avgSteps.toLocaleString()} steps/day`} />
        <WeekBar
          data={stepsBarData}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          color={colors.healthColor}
          maxValue={stepsGoal}
          formatValue={v => v.toLocaleString()}
        />
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SectionHeader title="Sleep This Week" subtitle={`Avg ${avgSleep.toFixed(1)}h/night`} />
        <WeekBar
          data={sleepBarData}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          color={colors.calendarColor}
          maxValue={sleepGoal}
          formatValue={v => `${v.toFixed(1)}h`}
        />
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SectionHeader title="Heart Rate" />
        <View style={styles.hrRow}>
          <View style={[styles.hrCard, { backgroundColor: colors.background }]}>
            <Ionicons name="heart" size={22} color={colors.trendsColor} />
            <Text style={[styles.hrVal, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              {health.heartRateResting}
            </Text>
            <Text style={[styles.hrLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Resting</Text>
          </View>
          <View style={[styles.hrCard, { backgroundColor: colors.background }]}>
            <Ionicons name="pulse" size={22} color={colors.warning} />
            <Text style={[styles.hrVal, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              {health.heartRateAvg}
            </Text>
            <Text style={[styles.hrLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Average</Text>
          </View>
          <View style={[styles.hrCard, { backgroundColor: colors.background }]}>
            <Ionicons name="stats-chart" size={22} color={colors.primary} />
            <Text style={[styles.hrVal, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              {avgHR}
            </Text>
            <Text style={[styles.hrLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>7-day Avg</Text>
          </View>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.hydrationHeader}>
          <View style={{ flex: 1 }}>
            <SectionHeader title="Hydration" subtitle="Tap to log glasses" />
          </View>
          <TouchableOpacity
            onPress={openGoalModal}
            style={[styles.goalEditBtn, { backgroundColor: colors.primary + "18" }]}
            accessibilityLabel="Set daily water goal"
          >
            <Ionicons name="settings-outline" size={16} color={colors.primary} />
            <Text style={[styles.goalEditText, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>
              Goal
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.hydrationRow}>
          <Ionicons name="water" size={24} color={colors.primary} />
          <View style={styles.hydrationInfo}>
            <Text style={[styles.hydrationVal, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              {hydration.oz} oz
            </Text>
            <Text style={[styles.hydrationLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Goal: {hydration.goalOz} oz · {Math.min(100, Math.round((hydration.oz / hydration.goalOz) * 100))}% complete
            </Text>
          </View>
          <View style={styles.hydrationControls}>
            <TouchableOpacity
              style={[styles.hydrationBtn, { backgroundColor: colors.primary + "22" }]}
              onPress={hydration.remove}
              accessibilityLabel="Remove a glass of water"
            >
              <Ionicons name="remove" size={20} color={colors.primary} />
            </TouchableOpacity>
            <Text style={[styles.glassesCount, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              {hydration.glasses}
            </Text>
            <TouchableOpacity
              style={[styles.hydrationBtn, { backgroundColor: colors.primary + "22" }]}
              onPress={hydration.add}
              accessibilityLabel="Add a glass of water"
            >
              <Ionicons name="add" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(100, Math.round((hydration.oz / hydration.goalOz) * 100))}%`,
                backgroundColor: colors.primary,
              },
            ]}
          />
        </View>
        <Text style={[styles.glassesLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          {hydration.glasses} glass{hydration.glasses !== 1 ? "es" : ""} · 8 oz each
        </Text>
      </View>

      <Modal
        visible={goalModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setGoalModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={[styles.modalBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              Daily Water Goal
            </Text>
            <Text style={[styles.modalDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Set your daily hydration goal in ounces. The default is 64 oz (8 glasses).
            </Text>
            <View style={[styles.inputRow, { borderColor: colors.border, backgroundColor: colors.background }]}>
              <TextInput
                style={[styles.goalInput, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}
                value={goalInput}
                onChangeText={setGoalInput}
                keyboardType="number-pad"
                maxLength={4}
                selectTextOnFocus
                accessibilityLabel="Daily water goal in ounces"
              />
              <Text style={[styles.inputUnit, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>oz</Text>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.border }]}
                onPress={() => setGoalModalVisible(false)}
              >
                <Text style={[styles.modalBtnText, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.primary }]}
                onPress={saveGoal}
              >
                <Text style={[styles.modalBtnText, { color: "#fff", fontFamily: "Inter_600SemiBold" }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  ringsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 8,
  },
  ringItem: {
    alignItems: "center",
    gap: 6,
  },
  ringLabel: { fontSize: 13 },
  ringValue: { fontSize: 12, textAlign: "center" },
  hrRow: {
    flexDirection: "row",
    gap: 10,
  },
  hrCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    gap: 4,
  },
  hrVal: { fontSize: 24, fontWeight: "700" },
  hrLabel: { fontSize: 12 },
  hydrationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  hydrationInfo: { flex: 1 },
  hydrationVal: { fontSize: 22, fontWeight: "700" },
  hydrationLabel: { fontSize: 13, marginTop: 2 },
  hydrationControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  hydrationBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  glassesCount: {
    fontSize: 18,
    minWidth: 24,
    textAlign: "center",
  },
  glassesLabel: {
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
  },
  progressBg: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
  },
  hydrationHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  goalEditBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  goalEditText: {
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalBox: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    gap: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  modalDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  goalInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
  },
  inputUnit: {
    fontSize: 16,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
  },
  modalBtnText: {
    fontSize: 15,
  },
});

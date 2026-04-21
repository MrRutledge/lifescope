import React from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

interface Props {
  visible: boolean;
  onClose: () => void;
}

const STEPS = [
  {
    number: "1",
    title: "Install Health Connect (if needed)",
    description:
      "On Android 13 and older, install the Health Connect app from the Play Store. Newer Android versions include Health Connect in system settings.",
    icon: "download-outline" as const,
  },
  {
    number: "2",
    title: "Open the Health tab",
    description:
      "In LifeScope, go to the Health tab and tap Allow on the Health Connect banner.",
    icon: "heart-outline" as const,
  },
  {
    number: "3",
    title: "Grant read permissions",
    description:
      "Approve access for metrics like steps, sleep, heart rate, and calories when Android prompts for Health Connect permissions.",
    icon: "shield-checkmark-outline" as const,
  },
  {
    number: "4",
    title: "Sync source apps",
    description:
      "Make sure Samsung Health, Fitbit, Google Fit, or other apps are writing data into Health Connect so LifeScope can read it.",
    icon: "sync-outline" as const,
  },
];

export function GoogleFitSetupModal({ visible, onClose }: Props) {
  const colors = useColors();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View
          style={[
            styles.header,
            { borderBottomColor: colors.border, backgroundColor: colors.card },
          ]}
        >
          <View style={styles.headerLeft}>
            <View style={[styles.headerIcon, { backgroundColor: colors.healthColor + "22" }]}>
              <Ionicons name="heart" size={20} color={colors.healthColor} />
            </View>
            <View>
              <Text
                style={[
                  styles.headerTitle,
                  { color: colors.foreground, fontFamily: "Inter_700Bold" },
                ]}
              >
                Set up Health Connect
              </Text>
              <Text
                style={[
                  styles.headerSub,
                  { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
                ]}
              >
                4-step setup guide
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={[styles.closeBtn, { backgroundColor: colors.border }]}
            accessibilityLabel="Close setup guide"
          >
            <Ionicons name="close" size={18} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.infoBanner,
              { backgroundColor: colors.primary + "15", borderColor: colors.primary + "40" },
            ]}
          >
            <Ionicons name="information-circle" size={18} color={colors.primary} />
            <Text
              style={[
                styles.infoText,
                { color: colors.foreground, fontFamily: "Inter_400Regular" },
              ]}
            >
              <Text style={{ fontFamily: "Inter_600SemiBold" }}>Note for developers & operators: </Text>
              {"No API keys are required for Health Connect. This setup only covers Android permissions and data source sync."}
            </Text>
          </View>

          {STEPS.map((step, index) => (
            <View
              key={step.number}
              style={[
                styles.stepCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View style={styles.stepTop}>
                <View
                  style={[styles.stepNumberBadge, { backgroundColor: colors.healthColor + "22" }]}
                >
                  <Text
                    style={[
                      styles.stepNumber,
                      { color: colors.healthColor, fontFamily: "Inter_700Bold" },
                    ]}
                  >
                    {step.number}
                  </Text>
                </View>
                <View
                  style={[styles.stepIconWrap, { backgroundColor: colors.healthColor + "15" }]}
                >
                  <Ionicons name={step.icon} size={16} color={colors.healthColor} />
                </View>
                <Text
                  style={[
                    styles.stepTitle,
                    { color: colors.foreground, fontFamily: "Inter_600SemiBold" },
                  ]}
                >
                  {step.title}
                </Text>
              </View>

              <Text
                style={[
                  styles.stepDesc,
                  { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
                ]}
              >
                {step.description}
              </Text>

              {index < STEPS.length - 1 && (
                <View style={[styles.stepDivider, { borderColor: colors.border }]} />
              )}
            </View>
          ))}

          <View
            style={[
              styles.tipCard,
              { backgroundColor: colors.warning + "15", borderColor: colors.warning + "40" },
            ]}
          >
            <Ionicons name="bulb-outline" size={18} color={colors.warning} />
            <Text
              style={[
                styles.tipText,
                { color: colors.foreground, fontFamily: "Inter_400Regular" },
              ]}
            >
              <Text style={{ fontFamily: "Inter_600SemiBold" }}>Tip: </Text>
              If permission prompts do not appear, open Android Settings → Health Connect →
              App permissions and verify LifeScope has access.
            </Text>
          </View>

          <TouchableOpacity
            onPress={onClose}
            style={[styles.doneBtn, { backgroundColor: colors.healthColor }]}
            activeOpacity={0.8}
          >
            <Text style={[styles.doneBtnText, { fontFamily: "Inter_600SemiBold" }]}>
              Got it — close guide
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 17 },
  headerSub: { fontSize: 12, marginTop: 1 },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, gap: 12, paddingBottom: 40 },
  infoBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  infoText: { flex: 1, fontSize: 13, lineHeight: 19 },
  stepCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  stepTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  stepNumberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumber: { fontSize: 14 },
  stepIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  stepTitle: { flex: 1, fontSize: 14 },
  stepDesc: { fontSize: 13, lineHeight: 20 },
  stepDivider: { borderTopWidth: 0 },
  tipCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  tipText: { flex: 1, fontSize: 13, lineHeight: 19 },
  doneBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  doneBtnText: { color: "#fff", fontSize: 15 },
});

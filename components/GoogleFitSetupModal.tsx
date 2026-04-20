import React from "react";
import {
  Modal,
  Platform,
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
    title: "Create a Google Cloud project",
    description:
      'Go to console.cloud.google.com and sign in with your Google account. Click \'Select a project\' at the top, then \'New Project\'. Give it a name (e.g. \'My Health App\') and click Create.',
    icon: "cloud-outline" as const,
  },
  {
    number: "2",
    title: "Enable the Fitness API",
    description:
      "In your new project, open the left menu and go to APIs & Services \u2192 Library. Search for 'Fitness API', click on it, then click Enable.",
    icon: "fitness-outline" as const,
  },
  {
    number: "3",
    title: "Configure the OAuth consent screen",
    description:
      "Go to APIs & Services \u2192 OAuth consent screen. Choose 'External' and fill in your app name and support email. Under Scopes, add the Fitness read scopes (activity, heart rate, sleep). Save and continue through the steps.",
    icon: "person-circle-outline" as const,
  },
  {
    number: "4",
    title: "Create OAuth credentials",
    description:
      "Go to APIs & Services \u2192 Credentials. Click '+ Create Credentials' \u2192 'OAuth client ID'. Choose 'Android' as the application type. Enter your app's package name and the SHA-1 signing certificate fingerprint. Click Create.",
    icon: "key-outline" as const,
  },
  {
    number: "5",
    title: "Copy your Client ID",
    description:
      "After creating the credential, you'll see a Client ID ending in .apps.googleusercontent.com. Copy this value \u2014 you'll need it in the next step.",
    icon: "copy-outline" as const,
  },
  {
    number: "6",
    title: "Add the Client ID to the app",
    description: "",
    icon: "code-slash-outline" as const,
    isCode: true,
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
                Connect Google Fit
              </Text>
              <Text
                style={[
                  styles.headerSub,
                  { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
                ]}
              >
                6-step setup guide
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
              {"This guide is for the person setting up the app, not everyday users. It walks you through creating free Google Cloud credentials so the app can read real fitness data. Takes about 10 minutes."}
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

              {step.isCode ? (
                <View style={styles.descriptionBlock}>
                  <Text
                    style={[
                      styles.stepDesc,
                      { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
                    ]}
                  >
                    {"Open the project's "}<Text style={{ fontFamily: "Inter_600SemiBold", color: colors.foreground }}>.env</Text>{" file (or your hosting environment's settings) and add:"}
                  </Text>
                  <View
                    style={[
                      styles.codeBlock,
                      { backgroundColor: colors.background, borderColor: colors.border },
                    ]}
                  >
                    <Text
                      style={[
                        styles.codeText,
                        { color: colors.healthColor, fontFamily: Platform.OS === "ios" ? "Courier" : "monospace" },
                      ]}
                    >
                      EXPO_PUBLIC_GOOGLE_FIT_CLIENT_ID=your-client-id-here
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.stepDesc,
                      { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
                    ]}
                  >
                    {'Restart the app after saving. The "Connect Your Health Data" button will then use your credentials to request real fitness data.'}
                  </Text>
                </View>
              ) : (
                <Text
                  style={[
                    styles.stepDesc,
                    { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
                  ]}
                >
                  {step.description}
                </Text>
              )}

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
              If you get stuck at any step, search "Google Cloud OAuth Android setup" for
              up-to-date screenshots and video walkthroughs.
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
  descriptionBlock: { gap: 8 },
  codeBlock: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  codeText: { fontSize: 12 },
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

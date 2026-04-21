import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import type { ConnectionStatus } from "@/hooks/useHealthConnect";
import { GoogleFitSetupModal } from "@/components/GoogleFitSetupModal";

interface Props {
  status: ConnectionStatus;
  lastSynced?: Date;
  errorMessage?: string;
  onConnect: () => void;
  onDisconnect: () => void;
  onRefresh: () => void;
}

export function HealthConnectBanner({
  status,
  lastSynced,
  errorMessage,
  onConnect,
  onDisconnect,
  onRefresh,
}: Props) {
  const colors = useColors();
  const [setupVisible, setSetupVisible] = useState(false);

  if (status === "checking") return null;

  if (status === "unavailable") {
    return (
      <>
        <View
          style={[
            styles.banner,
            styles.mutedBanner,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Ionicons name="phone-portrait-outline" size={18} color={colors.mutedForeground} />
          <View style={styles.textBlock}>
            <Text
              style={[
                styles.bannerTitle,
                { color: colors.mutedForeground, fontFamily: "Inter_500Medium" },
              ]}
            >
              Health Connect not available
            </Text>
            <Text
              style={[
                styles.bannerSub,
                { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
              ]}
            >
              Android Health Connect is required. Install it from the Play Store on older devices.
            </Text>
            <TouchableOpacity
              onPress={() => setSetupVisible(true)}
              style={styles.setupLink}
              accessibilityLabel="How to set up Health Connect"
            >
              <Ionicons name="help-circle-outline" size={13} color={colors.primary} />
              <Text
                style={[
                  styles.setupLinkText,
                  { color: colors.primary, fontFamily: "Inter_500Medium" },
                ]}
              >
                How to set up Health Connect
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <GoogleFitSetupModal visible={setupVisible} onClose={() => setSetupVisible(false)} />
      </>
    );
  }

  if (status === "connected") {
    return (
      <View
        style={[
          styles.banner,
          styles.connectedBanner,
          {
            backgroundColor: colors.healthColor + "18",
            borderColor: colors.healthColor + "44",
          },
        ]}
      >
        <View style={styles.connectedLeft}>
          <Ionicons name="checkmark-circle" size={18} color={colors.healthColor} />
          <View>
            <Text
              style={[
                styles.connectedTitle,
                { color: colors.foreground, fontFamily: "Inter_600SemiBold" },
              ]}
            >
              Health Connect synced
            </Text>
            {lastSynced && (
              <Text
                style={[
                  styles.syncedAt,
                  { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
                ]}
              >
                {formatRelativeTime(lastSynced)}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.connectedActions}>
          <TouchableOpacity
            onPress={onRefresh}
            style={[styles.iconBtn, { backgroundColor: colors.healthColor + "22" }]}
          >
            <Ionicons name="refresh" size={16} color={colors.healthColor} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onDisconnect}
            style={[styles.iconBtn, { backgroundColor: colors.border }]}
          >
            <Ionicons name="close-outline" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (status === "connecting") {
    return (
      <View style={[styles.banner, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ActivityIndicator size="small" color={colors.healthColor} />
        <Text
          style={[
            styles.connectingText,
            { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
          ]}
        >
          Requesting Health Connect access…
        </Text>
      </View>
    );
  }

  return (
    <>
      <View
        style={[
          styles.banner,
          styles.connectBanner,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={[styles.iconCircle, { backgroundColor: colors.healthColor + "22" }]}>
          <Ionicons name="heart" size={22} color={colors.healthColor} />
        </View>
        <View style={styles.textBlock}>
          <Text
            style={[styles.bannerTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}
          >
            Connect Your Health Data
          </Text>
          <Text
            style={[
              styles.bannerSub,
              { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
            ]}
          >
            {status === "error"
              ? (errorMessage ?? "Something went wrong. Please try again.")
              : "Tap to grant access — steps, sleep & heart rate from Samsung Health or any fitness app."}
          </Text>
          <TouchableOpacity
            onPress={() => setSetupVisible(true)}
            style={styles.setupLink}
            accessibilityLabel="How to set up Health Connect"
          >
            <Ionicons name="help-circle-outline" size={13} color={colors.primary} />
            <Text
              style={[
                styles.setupLinkText,
                { color: colors.primary, fontFamily: "Inter_500Medium" },
              ]}
            >
              How to set up Health Connect
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={onConnect}
          style={[styles.connectBtn, { backgroundColor: colors.healthColor }]}
          activeOpacity={0.8}
        >
          <Text style={[styles.connectBtnText, { fontFamily: "Inter_600SemiBold" }]}>
            {status === "error" ? "Retry" : "Allow"}
          </Text>
        </TouchableOpacity>
      </View>
      <GoogleFitSetupModal visible={setupVisible} onClose={() => setSetupVisible(false)} />
    </>
  );
}

function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "Synced just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `Synced ${diffMin}m ago`;
  return `Synced at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  connectedBanner: { justifyContent: "space-between" },
  connectBanner: { flexWrap: "wrap" },
  mutedBanner: {},
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  textBlock: { flex: 1, gap: 3 },
  bannerTitle: { fontSize: 14 },
  bannerSub: { fontSize: 12, lineHeight: 17 },
  setupLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  setupLinkText: { fontSize: 12 },
  connectBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  connectBtnText: { color: "#fff", fontSize: 13 },
  connectedLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  connectedTitle: { fontSize: 13 },
  syncedAt: { fontSize: 11, marginTop: 1 },
  connectedActions: { flexDirection: "row", gap: 8 },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  connectingText: { fontSize: 13 },
});

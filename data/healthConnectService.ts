import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLastNDateKeys, localDayBounds } from "@/utils/dateKey";

export interface RealHealthData {
  date: string;
  steps: number | null;
  sleepHours: number | null;
  sleepQuality: number | null;
  heartRateResting: number | null;
  heartRateAvg: number | null;
  activeMinutes: number | null;
  caloriesBurned: number | null;
}

export type HealthPermission =
  | "READ_STEPS"
  | "READ_SLEEP"
  | "READ_HEART_RATE"
  | "READ_ACTIVE_CALORIES_BURNED"
  | "READ_TOTAL_CALORIES_BURNED"
  | "READ_EXERCISE";

export const HEALTH_PERMISSIONS: HealthPermission[] = [
  "READ_STEPS",
  "READ_SLEEP",
  "READ_HEART_RATE",
  "READ_ACTIVE_CALORIES_BURNED",
  "READ_TOTAL_CALORIES_BURNED",
];

function dayBounds(dateStr: string): { startTime: string; endTime: string } {
  return localDayBounds(dateStr);
}

async function getModule() {
  if (Platform.OS !== "android") return null;
  try {
    const mod = await import("react-native-health-connect");
    return mod;
  } catch {
    return null;
  }
}

export async function isHealthConnectAvailable(): Promise<boolean> {
  if (Platform.OS !== "android") return false;
  try {
    const mod = await getModule();
    if (!mod) return false;
    const result = await mod.initialize();
    return result;
  } catch {
    return false;
  }
}

export async function requestHealthPermissions(): Promise<boolean> {
  const mod = await getModule();
  if (!mod) return false;
  try {
    const granted = await mod.requestPermission(
      HEALTH_PERMISSIONS.map((p) => ({ accessType: "read" as const, recordType: p.replace("READ_", "") as never }))
    );
    return granted.length > 0;
  } catch {
    return false;
  }
}

export async function checkHealthPermissions(): Promise<boolean> {
  const mod = await getModule();
  if (!mod) return false;
  try {
    const granted = await mod.getGrantedPermissions();
    const hasSteps = granted.some(
      (p: { accessType: string; recordType: string }) =>
        p.accessType === "read" && p.recordType === "Steps"
    );
    return hasSteps;
  } catch {
    return false;
  }
}

async function fetchSteps(
  mod: Awaited<ReturnType<typeof getModule>>,
  dateStr: string
): Promise<number | null> {
  if (!mod) return null;
  try {
    const { startTime, endTime } = dayBounds(dateStr);
    const result = await mod.readRecords("Steps", {
      timeRangeFilter: { operator: "between", startTime, endTime },
    });
    const total = (result.records as Array<{ count: number }>).reduce(
      (sum, r) => sum + (r.count ?? 0),
      0
    );
    return total > 0 ? total : null;
  } catch {
    return null;
  }
}

async function fetchSleep(
  mod: Awaited<ReturnType<typeof getModule>>,
  dateStr: string
): Promise<{ sleepHours: number | null; sleepQuality: number | null }> {
  if (!mod) return { sleepHours: null, sleepQuality: null };
  try {
    const { startTime, endTime } = dayBounds(dateStr);
    const result = await mod.readRecords("SleepSession", {
      timeRangeFilter: { operator: "between", startTime, endTime },
    });
    if (!result.records.length) return { sleepHours: null, sleepQuality: null };

    let totalMs = 0;
    let deepMs = 0;

    for (const session of result.records as Array<{
      startTime: string;
      endTime: string;
      stages?: Array<{ stage: number; startTime: string; endTime: string }>;
    }>) {
      const sessionStart = new Date(session.startTime).getTime();
      const sessionEnd = new Date(session.endTime).getTime();
      totalMs += sessionEnd - sessionStart;

      if (session.stages) {
        for (const s of session.stages) {
          if (s.stage === 4 || s.stage === 5) {
            deepMs += new Date(s.endTime).getTime() - new Date(s.startTime).getTime();
          }
        }
      }
    }

    if (totalMs === 0) return { sleepHours: null, sleepQuality: null };
    const sleepHours = parseFloat((totalMs / 3_600_000).toFixed(1));
    const quality = Math.min(100, Math.round(50 + (deepMs / totalMs) * 50));
    return { sleepHours, sleepQuality: quality };
  } catch {
    return { sleepHours: null, sleepQuality: null };
  }
}

async function fetchHeartRate(
  mod: Awaited<ReturnType<typeof getModule>>,
  dateStr: string
): Promise<{ heartRateResting: number | null; heartRateAvg: number | null }> {
  if (!mod) return { heartRateResting: null, heartRateAvg: null };
  try {
    const { startTime, endTime } = dayBounds(dateStr);
    const result = await mod.readRecords("HeartRate", {
      timeRangeFilter: { operator: "between", startTime, endTime },
    });

    const samples = (
      result.records as Array<{ samples: Array<{ beatsPerMinute: number }> }>
    ).flatMap((r) => r.samples.map((s) => s.beatsPerMinute));

    if (!samples.length) return { heartRateResting: null, heartRateAvg: null };

    const avg = Math.round(samples.reduce((a, b) => a + b, 0) / samples.length);
    const resting = Math.round(Math.min(...samples) * 0.95);
    return { heartRateResting: resting, heartRateAvg: avg };
  } catch {
    return { heartRateResting: null, heartRateAvg: null };
  }
}

async function fetchCalories(
  mod: Awaited<ReturnType<typeof getModule>>,
  dateStr: string
): Promise<number | null> {
  if (!mod) return null;
  try {
    const { startTime, endTime } = dayBounds(dateStr);
    const result = await mod.readRecords("TotalCaloriesBurned", {
      timeRangeFilter: { operator: "between", startTime, endTime },
    });
    const total = (result.records as Array<{ energy: { inKilocalories: number } }>).reduce(
      (sum, r) => sum + Math.round(r.energy?.inKilocalories ?? 0),
      0
    );
    return total > 0 ? total : null;
  } catch {
    return null;
  }
}

export async function fetchDayHealthData(dateStr: string): Promise<RealHealthData> {
  const mod = await getModule();
  const [steps, sleep, hr, calories] = await Promise.all([
    fetchSteps(mod, dateStr),
    fetchSleep(mod, dateStr),
    fetchHeartRate(mod, dateStr),
    fetchCalories(mod, dateStr),
  ]);
  return {
    date: dateStr,
    steps,
    sleepHours: sleep.sleepHours,
    sleepQuality: sleep.sleepQuality,
    heartRateResting: hr.heartRateResting,
    heartRateAvg: hr.heartRateAvg,
    activeMinutes: null,
    caloriesBurned: calories,
  };
}

export async function fetchLast7DaysHealth(): Promise<RealHealthData[]> {
  const days = getLastNDateKeys(7);
  return Promise.all(days.map((d) => fetchDayHealthData(d)));
}

const CACHE_PREFIX = "@health_cache_";

export interface CachedHealthEntry {
  data: RealHealthData;
  fetchedAt: string;
}

export async function readHealthCache(dateStr: string): Promise<CachedHealthEntry | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_PREFIX + dateStr);
    if (!raw) return null;
    return JSON.parse(raw) as CachedHealthEntry;
  } catch {
    return null;
  }
}

export async function writeHealthCache(dateStr: string, data: RealHealthData): Promise<void> {
  try {
    const entry: CachedHealthEntry = { data, fetchedAt: new Date().toISOString() };
    await AsyncStorage.setItem(CACHE_PREFIX + dateStr, JSON.stringify(entry));
  } catch {
  }
}

export async function readMultiHealthCache(
  dateStrs: string[]
): Promise<Record<string, CachedHealthEntry>> {
  try {
    const keys = dateStrs.map((d) => CACHE_PREFIX + d);
    const pairs = await AsyncStorage.multiGet(keys);
    const result: Record<string, CachedHealthEntry> = {};
    for (const [key, val] of pairs) {
      if (val) {
        const dateStr = key.slice(CACHE_PREFIX.length);
        result[dateStr] = JSON.parse(val) as CachedHealthEntry;
      }
    }
    return result;
  } catch {
    return {};
  }
}

import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";
import {
  RealHealthData,
  checkHealthPermissions,
  fetchDayHealthData,
  fetchLast7DaysHealth,
  isHealthConnectAvailable,
  requestHealthPermissions,
  readHealthCache,
  readMultiHealthCache,
  writeHealthCache,
} from "@/data/healthConnectService";
import { formatLocalDateKey, getLastNDateKeys } from "@/utils/dateKey";

export type ConnectionStatus =
  | "checking"
  | "unavailable"
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

export interface HealthConnectState {
  status: ConnectionStatus;
  errorMessage?: string;
  todayData?: RealHealthData;
  weekData?: RealHealthData[];
  lastSynced?: Date;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  refresh: () => Promise<void>;
}

function toErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "An unexpected error occurred.";
}

function getLast7DateStrs(): string[] {
  return getLastNDateKeys(7);
}

export function useHealthConnect(): HealthConnectState {
  const [status, setStatus] = useState<ConnectionStatus>("checking");
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [todayData, setTodayData] = useState<RealHealthData | undefined>();
  const [weekData, setWeekData] = useState<RealHealthData[] | undefined>();
  const [lastSynced, setLastSynced] = useState<Date | undefined>();

  const loadFromCache = useCallback(async (): Promise<boolean> => {
    const today = formatLocalDateKey();
    const last7 = getLast7DateStrs();
    const [todayCache, weekCache] = await Promise.all([
      readHealthCache(today),
      readMultiHealthCache(last7),
    ]);
    if (!todayCache) return false;
    setTodayData(todayCache.data);
    setLastSynced(new Date(todayCache.fetchedAt));
    const week = last7.map((d) => weekCache[d]?.data).filter((d): d is RealHealthData => d !== undefined);
    if (week.length > 0) {
      setWeekData(week);
    }
    setStatus("connected");
    return true;
  }, []);

  const loadData = useCallback(async (isBackground = false) => {
    try {
      const today = formatLocalDateKey();
      const [todayResult, weekResult] = await Promise.all([
        fetchDayHealthData(today),
        fetchLast7DaysHealth(),
      ]);
      setTodayData(todayResult);
      setWeekData(weekResult);
      setLastSynced(new Date());
      setStatus("connected");
      void writeHealthCache(today, todayResult);
      void Promise.all(weekResult.map((d) => writeHealthCache(d.date, d)));
    } catch (err: unknown) {
      if (isBackground) {
        console.warn("useHealthConnect background refresh error:", toErrorMessage(err));
      } else {
        setStatus("error");
        setErrorMessage("Failed to load health data. Please try again.");
        console.warn("useHealthConnect loadData error:", toErrorMessage(err));
      }
    }
  }, []);

  useEffect(() => {
    if (Platform.OS !== "android") {
      setStatus("unavailable");
      return;
    }
    let cancelled = false;
    void (async () => {
      const available = await isHealthConnectAvailable();
      if (cancelled) return;
      if (!available) {
        setStatus("unavailable");
        return;
      }
      const hasPermission = await checkHealthPermissions();
      if (cancelled) return;
      if (hasPermission) {
        const hadCache = await loadFromCache();
        if (cancelled) return;
        void loadData(hadCache);
      } else {
        setStatus("disconnected");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadData, loadFromCache]);

  const connect = useCallback(async () => {
    setStatus("connecting");
    try {
      const granted = await requestHealthPermissions();
      if (!granted) {
        setStatus("disconnected");
        return;
      }
      await loadData(false);
    } catch (err: unknown) {
      setStatus("error");
      setErrorMessage(toErrorMessage(err));
    }
  }, [loadData]);

  const disconnect = useCallback(async () => {
    setTodayData(undefined);
    setWeekData(undefined);
    setLastSynced(undefined);
    setStatus("disconnected");
  }, []);

  const refresh = useCallback(async () => {
    if (status !== "connected") return;
    await loadData(false);
  }, [status, loadData]);

  return {
    status,
    errorMessage,
    todayData,
    weekData,
    lastSynced,
    connect,
    disconnect,
    refresh,
  };
}

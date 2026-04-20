import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const OZ_PER_GLASS = 8;
const STORAGE_PREFIX = "hydration:";
const GOAL_KEY = "hydration:goal";
const DEFAULT_GOAL_OZ = 64;

function storageKey(dateStr: string) {
  return `${STORAGE_PREFIX}${dateStr}`;
}

export function useHydration(dateStr: string) {
  const [glasses, setGlasses] = useState<number>(0);
  const [goalOz, setGoalOzState] = useState<number>(DEFAULT_GOAL_OZ);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      AsyncStorage.getItem(storageKey(dateStr)),
      AsyncStorage.getItem(GOAL_KEY),
    ])
      .then(([countVal, goalVal]) => {
        if (!cancelled) {
          setGlasses(countVal !== null ? parseInt(countVal, 10) : 0);
          const parsedGoal = goalVal !== null ? parseInt(goalVal, 10) : NaN;
          const validGoal = !isNaN(parsedGoal) && parsedGoal >= 8 && parsedGoal <= 320
            ? parsedGoal
            : DEFAULT_GOAL_OZ;
          setGoalOzState(validGoal);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setGlasses(0);
          setGoalOzState(DEFAULT_GOAL_OZ);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [dateStr]);

  const add = useCallback(async () => {
    setGlasses(prev => {
      const next = prev + 1;
      AsyncStorage.setItem(storageKey(dateStr), String(next)).catch(() => {});
      return next;
    });
  }, [dateStr]);

  const remove = useCallback(async () => {
    setGlasses(prev => {
      if (prev <= 0) return 0;
      const next = prev - 1;
      AsyncStorage.setItem(storageKey(dateStr), String(next)).catch(() => {});
      return next;
    });
  }, [dateStr]);

  const setGoal = useCallback(async (oz: number) => {
    const clamped = Math.max(8, Math.min(320, oz));
    setGoalOzState(clamped);
    AsyncStorage.setItem(GOAL_KEY, String(clamped)).catch(() => {});
  }, []);

  return {
    glasses,
    oz: glasses * OZ_PER_GLASS,
    goalOz,
    setGoal,
    add,
    remove,
    loading,
  };
}

import React, { createContext, useContext } from "react";
import { useHealthConnect, type HealthConnectState } from "@/hooks/useHealthConnect";

const HealthContext = createContext<HealthConnectState | null>(null);

export function HealthProvider({ children }: { children: React.ReactNode }) {
  const state = useHealthConnect();
  return <HealthContext.Provider value={state}>{children}</HealthContext.Provider>;
}

export function useHealthContext(): HealthConnectState {
  const ctx = useContext(HealthContext);
  if (!ctx) {
    throw new Error("useHealthContext must be used within a HealthProvider");
  }
  return ctx;
}

import { createContext, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { useLiveStream } from "./ws";
import type { Alert, Incident, SiemEvent } from "./types";

interface LiveState {
  connected: boolean;
  liveEvents: SiemEvent[];
  liveAlerts: Alert[];
  liveIncidents: Incident[];
}

const LiveContext = createContext<LiveState>({
  connected: false,
  liveEvents: [],
  liveAlerts: [],
  liveIncidents: [],
});

const MAX_BUFFER = 200;

export function LiveStoreProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [liveEvents, setLiveEvents] = useState<SiemEvent[]>([]);
  const [liveAlerts, setLiveAlerts] = useState<Alert[]>([]);
  const [liveIncidents, setLiveIncidents] = useState<Incident[]>([]);
  const incidentIndexRef = useRef<Map<string, number>>(new Map());

  useLiveStream(
    (message) => {
      if (message.type === "event") {
        setLiveEvents((prev) => [message.data, ...prev].slice(0, MAX_BUFFER));
      } else if (message.type === "alert") {
        setLiveAlerts((prev) => [message.data, ...prev].slice(0, MAX_BUFFER));
      } else if (message.type === "incident") {
        setLiveIncidents((prev) => {
          const idx = prev.findIndex((i) => i.id === message.data.id);
          if (idx === -1) return [message.data, ...prev].slice(0, MAX_BUFFER);
          const copy = [...prev];
          copy[idx] = message.data;
          return copy;
        });
      }
    },
    setConnected
  );

  const value = useMemo(
    () => ({ connected, liveEvents, liveAlerts, liveIncidents }),
    [connected, liveEvents, liveAlerts, liveIncidents]
  );

  return <LiveContext.Provider value={value}>{children}</LiveContext.Provider>;
}

export function useLive() {
  return useContext(LiveContext);
}
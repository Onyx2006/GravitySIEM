import type {
  Alert,
  DetectionRule,
  EventsPage,
  IncidentDetail,
  MapSource,
  MitreTechnique,
  Stats,
  Incident,
} from "./types";

export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
export const WS_URL = import.meta.env.VITE_WS_URL ?? "ws://localhost:8000";
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export interface EventFilters {
  severity?: string;
  event_type?: string;
  source_ip?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
  sort?: string;
  page?: number;
  page_size?: number;
}

function toQuery(params: Record<string, unknown>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const api = {
  health: () => request<{ status: string; simulation_mode: boolean }>("/api/health"),

  stats: () => request<Stats>("/api/stats"),

  events: (filters: EventFilters = {}) =>
    request<EventsPage>(`/api/events${toQuery(filters)}`),
  event: (id: string) => request<EventsPage["items"][number]>(`/api/events/${id}`),

  alerts: (params: { severity?: string; status?: string; limit?: number } = {}) =>
    request<Alert[]>(`/api/alerts${toQuery(params)}`),
  alert: (id: string) => request<Alert>(`/api/alerts/${id}`),

  incidents: (params: { status?: string; severity?: string; limit?: number } = {}) =>
    request<Incident[]>(`/api/incidents${toQuery(params)}`),
  incident: (id: string) => request<IncidentDetail>(`/api/incidents/${id}`),
  updateIncidentStatus: (id: string, status: string) =>
    request<Incident>(`/api/incidents/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  rules: () => request<DetectionRule[]>("/api/rules"),
  updateRule: (id: string, enabled: boolean) =>
    request<DetectionRule>(`/api/rules/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ enabled }),
    }),

  mitre: () => request<MitreTechnique[]>("/api/mitre"),
  mapSources: () => request<MapSource[]>("/api/map/sources"),

  simulate: (attack: string) =>
    request<{ attack: string; events_queued: number; message: string }>(
      `/api/simulator/${attack}`,
      { method: "POST" }
    ),
};
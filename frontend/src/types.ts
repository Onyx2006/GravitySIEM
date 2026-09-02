export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type IncidentStatus = "OPEN" | "INVESTIGATING" | "CONTAINED" | "RESOLVED" | "FALSE_POSITIVE";

export interface SiemEvent {
  id: string;
  timestamp: string;
  source_ip: string;
  destination_ip: string | null;
  source_port: number | null;
  destination_port: number | null;
  protocol: string | null;
  event_type: string;
  source_system: string;
  username: string | null;
  hostname: string | null;
  message: string | null;
  severity: Severity;
  event_metadata: Record<string, unknown>;
  created_at: string;
}

export interface Alert {
  id: string;
  event_id: string | null;
  rule_id: string;
  incident_id: string | null;
  title: string;
  description: string;
  severity: Severity;
  confidence: number;
  source_ip: string;
  mitre_tactic: string;
  mitre_technique: string;
  status: string;
  created_at: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  status: IncidentStatus;
  source_ip: string;
  mitre_technique: string;
  first_seen: string;
  last_seen: string;
  event_count: number;
  alert_count: number;
  created_at: string;
  updated_at: string;
}

export interface TimelineItem {
  timestamp: string;
  label: string;
  kind: "event" | "alert" | "status";
}

export interface IncidentDetail extends Incident {
  timeline: TimelineItem[];
  alerts: Alert[];
}

export interface DetectionRule {
  id: string;
  name: string;
  description: string;
  severity: Severity;
  threshold: number;
  time_window: number;
  event_type: string;
  mitre_tactic: string;
  mitre_technique: string;
  mitre_technique_name: string;
  enabled: boolean;
}

export interface Stats {
  total_events: number;
  active_alerts: number;
  critical_alerts: number;
  open_incidents: number;
  events_per_minute: number;
  severity_breakdown: Record<string, number>;
  event_type_breakdown: Record<string, number>;
  top_sources: { source_ip: string; count: number }[];
  threat_activity: { timestamp: string; events: number; threats: number }[];
}

export interface MitreTechnique {
  technique_id: string;
  name: string;
  tactic: string;
  alert_count: number;
}

export interface MapSource {
  source_ip: string;
  alert_count: number;
  country: string;
  lat: number;
  lng: number;
}

export interface EventsPage {
  items: SiemEvent[];
  total: number;
  page: number;
  page_size: number;
}

export type WsMessage =
  | { type: "event"; data: SiemEvent }
  | { type: "alert"; data: Alert }
  | { type: "incident"; data: Incident };
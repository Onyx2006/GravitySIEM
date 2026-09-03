import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  FolderOpen,
  Gauge,
  ShieldAlert,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useLive } from "../liveStore";
import StatCard from "../components/StatCard";
import Panel from "../components/Panel";
import SeverityBadge from "../components/SeverityBadge";
import StatusBadge from "../components/StatusBadge";
import GlitchText from "../components/GlitchText";
import type { Stats } from "../types";

const SEVERITY_ORDER = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
const SEVERITY_COLOR: Record<string, string> = {
  CRITICAL: "#FF2447",
  HIGH: "#FF9F1C",
  MEDIUM: "#F5D90A",
  LOW: "#00F0FF",
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const { liveAlerts, liveIncidents, liveEvents } = useLive();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await api.stats();
        if (!cancelled) setStats(data);
      } catch {
        // backend not reachable yet
      }
    }
    load();
    const interval = setInterval(load, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [liveEvents.length]);

  if (!stats) {
    return (
      <div className="flex items-center gap-2 font-mono text-sm text-matrix-500">
        <span className="animate-pulse">▓▓▓</span> loading_soc_metrics<span className="cursor-blink" />
      </div>
    );
  }

  const chartData = stats.threat_activity.map((point) => ({
    time: new Date(point.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    Events: point.events,
    Threats: point.threats,
  }));

  const recentAlerts = liveAlerts.slice(0, 6);
  const recentIncidents = liveIncidents.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <GlitchText
          text="SECURITY_OVERVIEW"
          className="font-mono text-xl font-bold tracking-wide text-matrix-500"
        />
        <p className="mt-1 font-mono text-xs ">
          // estado en tiempo real del entorno simulado
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <StatCard label="total_events" value={stats.total_events} icon={Activity} />
        <StatCard label="active_alerts" value={stats.active_alerts} icon={ShieldAlert} tone="accent" />
        <StatCard label="critical_alerts" value={stats.critical_alerts} icon={AlertTriangle} tone="critical" />
        <StatCard label="open_incidents" value={stats.open_incidents} icon={FolderOpen} />
        <StatCard label="events/min" value={stats.events_per_minute} icon={Gauge} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel title="threat_activity.log" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="events" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00FF41" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#00FF41" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="threats" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF2447" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#FF2447" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke="#132030" vertical={false} />
              <XAxis dataKey="time" stroke="#5C7A6E" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#5C7A6E" fontSize={10} tickLine={false} axisLine={false} width={26} />
              <Tooltip
                contentStyle={{
                  background: "#060B10",
                  border: "1px solid #00FF41",
                  borderRadius: 0,
                  fontSize: 11,
                  fontFamily: "JetBrains Mono, monospace",
                }}
              />
              <Area type="monotone" dataKey="Events" stroke="#00FF41" fill="url(#events)" strokeWidth={1.5} />
              <Area type="monotone" dataKey="Threats" stroke="#FF2447" fill="url(#threats)" strokeWidth={1.5} />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="severity.dist">
          <div className="space-y-3">
            {SEVERITY_ORDER.map((sev) => {
              const count = stats.severity_breakdown[sev] ?? 0;
              const max = Math.max(...Object.values(stats.severity_breakdown), 1);
              return (
                <div key={sev}>
                  <div className="mb-1 flex items-center justify-between">
                    <SeverityBadge severity={sev} />
                    <span className="font-mono text-xs ">{count}</span>
                  </div>
                  <div className="h-1 w-full overflow-hidden bg-white/5">
                    <div
                      className="h-full"
                      style={{
                        width: `${(count / max) * 100}%`,
                        background: SEVERITY_COLOR[sev],
                        boxShadow: `0 0 8px ${SEVERITY_COLOR[sev]}`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel title="recent_alerts" action={<Link to="/alerts" className="font-mono text-[10px] text-matrix-500 hover:underline">view_all &gt;</Link>}>
          <div className="space-y-2">
            {recentAlerts.length === 0 && <p className="font-mono text-xs ">// sin alertas recientes</p>}
            {recentAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between border border-border/70 bg-black/20 px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate font-mono text-xs text-ink">{alert.title}</p>
                  <p className="font-mono text-[10px] ">{alert.source_ip} · {alert.mitre_technique}</p>
                </div>
                <SeverityBadge severity={alert.severity} />
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="recent_incidents" action={<Link to="/incidents" className="font-mono text-[10px] text-matrix-500 hover:underline">view_all &gt;</Link>}>
          <div className="space-y-2">
            {recentIncidents.length === 0 && <p className="font-mono text-xs ">// sin incidentes recientes</p>}
            {recentIncidents.map((incident) => (
              <Link
                key={incident.id}
                to={`/incidents/${incident.id}`}
                className="flex items-center justify-between border border-border/70 bg-black/20 px-3 py-2 hover:border-matrix-500/50"
              >
                <div className="min-w-0">
                  <p className="truncate font-mono text-xs text-ink">{incident.title}</p>
                  <p className="font-mono text-[10px] ">
                    {incident.source_ip} · {incident.alert_count} alerts
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={incident.status} />
                  <SeverityBadge severity={incident.severity} />
                </div>
              </Link>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="live_event_stream.tail -f">
        <div className="max-h-64 space-y-0.5 overflow-y-auto font-mono text-[11px]">
          {liveEvents.slice(0, 30).map((event) => (
            <div key={event.id} className="flex animate-fade-slide-in items-center gap-3 border-b border-border/30 py-1">
              <span className="w-20 shrink-0 ">
                {new Date(event.timestamp).toLocaleTimeString()}
              </span>
              <span className="w-40 shrink-0 truncate text-matrix-400">{event.event_type}</span>
              <span className="w-32 shrink-0 truncate text-ink">{event.source_ip}</span>
              <SeverityBadge severity={event.severity} className="ml-auto" />
            </div>
          ))}
          {liveEvents.length === 0 && (
            <p className="">
              <span className="text-matrix-500">$</span> waiting for events over websocket
              <span className="cursor-blink" />
            </p>
          )}
        </div>
      </Panel>
    </div>
  );
}
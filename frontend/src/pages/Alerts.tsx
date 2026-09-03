import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { useLive } from "../liveStore";
import Panel from "../components/Panel";
import SeverityBadge from "../components/SeverityBadge";
import StatusBadge from "../components/StatusBadge";
import GlitchText from "../components/GlitchText";
import type { Alert } from "../types";

const SEVERITIES = ["", "CRITICAL", "HIGH", "MEDIUM", "LOW"];

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [severity, setSeverity] = useState("");
  const { liveAlerts } = useLive();

  useEffect(() => {
    api.alerts({ severity: severity || undefined, limit: 200 }).then(setAlerts).catch(() => {});
  }, [severity, liveAlerts.length]);

  const merged = useMemo(() => {
    const byId = new Map<string, Alert>();
    [...liveAlerts, ...alerts].forEach((a) => byId.set(a.id, a));
    return Array.from(byId.values())
      .filter((a) => !severity || a.severity === severity)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [alerts, liveAlerts, severity]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <GlitchText text="ALERTS" className="font-mono text-xl font-bold tracking-wide text-matrix-500" />
          <p className="mt-1 font-mono text-xs ">// alertas generadas por el motor de deteccion</p>
        </div>
        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
          className="border border-border bg-black/40 px-3 py-2 font-mono text-xs text-ink outline-none focus:border-matrix-500"
        >
          {SEVERITIES.map((s) => <option key={s} value={s}>{s || "ALL_SEVERITY"}</option>)}
        </select>
      </div>

      <Panel>
        <div className="space-y-2">
          {merged.map((alert) => (
            <div
              key={alert.id}
              className="flex animate-fade-slide-in flex-col gap-2 border border-border/70 bg-black/20 px-4 py-3 md:flex-row md:items-center md:justify-between"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm font-medium text-ink">{alert.title}</p>
                  <span className="font-mono text-[10px] ">[{alert.rule_id}]</span>
                </div>
                <p className="mt-0.5 font-mono text-[11px] ">{alert.description}</p>
                <p className="mt-1 font-mono text-[10px] ">
                  {alert.source_ip} · {alert.mitre_tactic} ({alert.mitre_technique}) · {new Date(alert.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="font-mono text-[10px] ">conf.{alert.confidence}%</span>
                <StatusBadge status={alert.status} />
                <SeverityBadge severity={alert.severity} />
              </div>
            </div>
          ))}
          {merged.length === 0 && <p className="font-mono text-xs ">// sin alertas todavia</p>}
        </div>
      </Panel>
    </div>
  );
}
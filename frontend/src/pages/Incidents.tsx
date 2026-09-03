import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useLive } from "../liveStore";
import Panel from "../components/Panel";
import SeverityBadge from "../components/SeverityBadge";
import StatusBadge from "../components/StatusBadge";
import GlitchText from "../components/GlitchText";
import type { Incident } from "../types";

const STATUSES = ["", "OPEN", "INVESTIGATING", "CONTAINED", "RESOLVED", "FALSE_POSITIVE"];

export default function Incidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [status, setStatus] = useState("");
  const { liveIncidents } = useLive();

  useEffect(() => {
    api.incidents({ status: status || undefined, limit: 200 }).then(setIncidents).catch(() => {});
  }, [status, liveIncidents.length]);

  const merged = useMemo(() => {
    const byId = new Map<string, Incident>();
    [...liveIncidents, ...incidents].forEach((i) => byId.set(i.id, i));
    return Array.from(byId.values())
      .filter((i) => !status || i.status === status)
      .sort((a, b) => new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime());
  }, [incidents, liveIncidents, status]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <GlitchText text="INCIDENTS" className="font-mono text-xl font-bold tracking-wide text-matrix-500" />
          <p className="mt-1 font-mono text-xs ">// alertas correlacionadas por IP + tecnica MITRE</p>
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-border bg-black/40 px-3 py-2 font-mono text-xs text-ink outline-none focus:border-matrix-500"
        >
          {STATUSES.map((s) => <option key={s} value={s}>{s || "ALL_STATUS"}</option>)}
        </select>
      </div>

      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border font-mono text-[10px] uppercase tracking-widest ">
                <th className="pb-2 font-medium">title</th>
                <th className="pb-2 font-medium">source</th>
                <th className="pb-2 font-medium">events</th>
                <th className="pb-2 font-medium">alerts</th>
                <th className="pb-2 font-medium">last_seen</th>
                <th className="pb-2 font-medium">status</th>
                <th className="pb-2 font-medium">severity</th>
              </tr>
            </thead>
            <tbody>
              {merged.map((incident) => (
                <tr key={incident.id} className="border-b border-border/40 hover:bg-matrix-500/5">
                  <td className="py-2.5 font-mono text-xs">
                    <Link to={`/incidents/${incident.id}`} className="text-ink hover:text-matrix-400">{incident.title}</Link>
                  </td>
                  <td className="py-2.5 font-mono text-[11px] ">{incident.source_ip}</td>
                  <td className="py-2.5 font-mono text-[11px] ">{incident.event_count}</td>
                  <td className="py-2.5 font-mono text-[11px] ">{incident.alert_count}</td>
                  <td className="py-2.5 font-mono text-[11px] ">{new Date(incident.last_seen).toLocaleString()}</td>
                  <td className="py-2.5"><StatusBadge status={incident.status} /></td>
                  <td className="py-2.5"><SeverityBadge severity={incident.severity} /></td>
                </tr>
              ))}
              {merged.length === 0 && (
                <tr><td colSpan={7} className="py-6 text-center font-mono text-xs ">// no incidents yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
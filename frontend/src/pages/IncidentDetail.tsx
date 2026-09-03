import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { api } from "../api";
import Panel from "../components/Panel";
import SeverityBadge from "../components/SeverityBadge";
import StatusBadge from "../components/StatusBadge";
import type { IncidentDetail as IncidentDetailType } from "../types";

const STATUSES = ["OPEN", "INVESTIGATING", "CONTAINED", "RESOLVED", "FALSE_POSITIVE"];

export default function IncidentDetail() {
  const { id } = useParams<{ id: string }>();
  const [incident, setIncident] = useState<IncidentDetailType | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.incident(id).then(setIncident).catch(() => {});
  }, [id]);

  async function changeStatus(status: string) {
    if (!id) return;
    setUpdating(true);
    try {
      await api.updateIncidentStatus(id, status);
      const refreshed = await api.incident(id);
      setIncident(refreshed);
    } finally {
      setUpdating(false);
    }
  }

  if (!incident) {
    return <div className="font-mono text-sm text-matrix-500">loading incident<span className="cursor-blink" /></div>;
  }

  return (
    <div className="space-y-5">
      <Link to="/incidents" className="inline-flex items-center gap-1.5 font-mono text-xs  hover:text-matrix-400">
        <ArrowLeft size={14} /> cd ../incidents
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-mono text-xl font-bold tracking-wide text-matrix-500">{incident.title}</h1>
          <p className="mt-1 max-w-2xl font-mono text-xs ">{incident.description}</p>
          <div className="mt-2 flex items-center gap-2">
            <SeverityBadge severity={incident.severity} />
            <StatusBadge status={incident.status} />
          </div>
        </div>
        <select
          disabled={updating}
          value={incident.status}
          onChange={(e) => changeStatus(e.target.value)}
          className="border border-border bg-black/40 px-3 py-2 font-mono text-xs text-ink outline-none focus:border-matrix-500"
        >
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <InfoBox label="source_ip" value={incident.source_ip} />
        <InfoBox label="mitre_technique" value={incident.mitre_technique} />
        <InfoBox label="events" value={String(incident.event_count)} />
        <InfoBox label="alerts" value={String(incident.alert_count)} />
        <InfoBox label="first_seen" value={new Date(incident.first_seen).toLocaleString()} />
        <InfoBox label="last_seen" value={new Date(incident.last_seen).toLocaleString()} />
      </div>

      <Panel title="timeline.log">
        <ol className="space-y-3 border-l border-matrix-700 pl-4">
          {incident.timeline.map((item, idx) => (
            <li key={idx} className="relative">
              <span className="absolute -left-[21px] top-1 h-2 w-2 bg-matrix-500 shadow-glow" />
              <p className="font-mono text-[10px] ">{new Date(item.timestamp).toLocaleTimeString()}</p>
              <p className="font-mono text-xs text-ink">{item.label}</p>
            </li>
          ))}
          {incident.timeline.length === 0 && <p className="font-mono text-xs ">// no events recorded</p>}
        </ol>
      </Panel>

      <Panel title="related_alerts">
        <div className="space-y-2">
          {incident.alerts.map((alert) => (
            <div key={alert.id} className="flex items-center justify-between border border-border/70 bg-black/20 px-3 py-2">
              <div>
                <p className="font-mono text-xs text-ink">{alert.title}</p>
                <p className="font-mono text-[10px] ">{alert.rule_id} · {alert.mitre_technique}</p>
              </div>
              <SeverityBadge severity={alert.severity} />
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border bg-panel/80 p-3">
      <p className="font-mono text-[9px] uppercase tracking-widest ">{label}</p>
      <p className="mt-1 truncate font-mono text-sm text-matrix-400">{value}</p>
    </div>
  );
}
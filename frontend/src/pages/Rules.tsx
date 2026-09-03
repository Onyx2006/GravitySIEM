import { useEffect, useState } from "react";
import { api } from "../api";
import Panel from "../components/Panel";
import SeverityBadge from "../components/SeverityBadge";
import GlitchText from "../components/GlitchText";
import type { DetectionRule } from "../types";

export default function Rules() {
  const [rules, setRules] = useState<DetectionRule[]>([]);

  useEffect(() => {
    api.rules().then(setRules).catch(() => {});
  }, []);

  async function toggle(rule: DetectionRule) {
    const updated = await api.updateRule(rule.id, !rule.enabled);
    setRules((prev) => prev.map((r) => (r.id === rule.id ? updated : r)));
  }

  return (
    <div className="space-y-4">
      <div>
        <GlitchText text="DETECTION_RULES" className="font-mono text-xl font-bold tracking-wide text-matrix-500" />
        <p className="mt-1 font-mono text-xs ">// reglas del motor de deteccion — toggle enable/disable</p>
      </div>

      <div className="space-y-3">
        {rules.map((rule) => (
          <Panel key={rule.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] ">[{rule.id}]</span>
                  <h3 className="font-mono text-sm font-bold text-ink">{rule.name}</h3>
                  <SeverityBadge severity={rule.severity} />
                </div>
                <p className="mt-1.5 max-w-2xl font-mono text-[11px] ">{rule.description}</p>
                <p className="mt-2 font-mono text-[10px] text-matrix-600">
                  threshold={rule.threshold} window={rule.time_window}s event_type={rule.event_type} mitre={rule.mitre_technique}({rule.mitre_technique_name})
                </p>
              </div>
              <button
                onClick={() => toggle(rule)}
                className={`shrink-0 border px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest transition-colors ${
                  rule.enabled
                    ? "border-matrix-500/50 bg-matrix-500/10 text-matrix-400"
                    : "border-muted/30 bg-muted/5 "
                }`}
              >
                {rule.enabled ? "[ENABLED]" : "[DISABLED]"}
              </button>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
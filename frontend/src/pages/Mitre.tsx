import { useEffect, useState } from "react";
import { Radio } from "lucide-react";
import { api } from "../api";
import Panel from "../components/Panel";
import GlitchText from "../components/GlitchText";
import CountUp from "../components/CountUp";
import type { MitreTechnique } from "../types";

export default function Mitre() {
  const [techniques, setTechniques] = useState<MitreTechnique[]>([]);

  useEffect(() => {
    const load = () => api.mitre().then(setTechniques).catch(() => {});
    load();
    const interval = setInterval(load, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <GlitchText text="MITRE_ATT&CK" className="font-mono text-xl font-bold tracking-wide text-matrix-500" />
        <p className="mt-1 font-mono text-xs ">// tecnicas cubiertas por las reglas de deteccion</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {techniques.map((t) => (
          <Panel key={t.technique_id}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-[10px] text-matrix-500">{t.technique_id}</p>
                <h3 className="font-mono text-sm font-bold text-ink">{t.name}</h3>
                <p className="mt-1 font-mono text-[10px] ">{t.tactic}</p>
              </div>
              <Radio size={15} className="text-matrix-600" />
            </div>
            <div className="mt-4 flex items-baseline gap-1.5">
              <span className="font-mono text-2xl font-bold text-matrix-400"><CountUp value={t.alert_count} /></span>
              <span className="font-mono text-[10px] ">alerts</span>
            </div>
          </Panel>
        ))}
        {techniques.length === 0 && <p className="font-mono text-xs ">// loading mitre techniques...</p>}
      </div>
    </div>
  );
}
import { useState } from "react";
import {
  Bug,
  Crosshair,
  KeyRound,
  Network,
  ScanSearch,
  ShieldAlert,
  Skull,
} from "lucide-react";
import { api } from "../api";
import Panel from "../components/Panel";
import GlitchText from "../components/GlitchText";

const ATTACKS = [
  { key: "brute-force", label: "SSH_BRUTE_FORCE", description: "Intentos de login SSH fallidos repetidos desde una misma IP.", icon: KeyRound },
  { key: "port-scan", label: "PORT_SCAN", description: "Conexiones a muchos puertos distintos desde una misma IP.", icon: ScanSearch },
  { key: "sql-injection", label: "SQL_INJECTION", description: "Peticiones HTTP con patrones de inyeccion SQL simulados.", icon: Bug },
  { key: "xss", label: "XSS_ATTEMPT", description: "Peticiones HTTP con payloads XSS simulados.", icon: Bug },
  { key: "suspicious-login", label: "SUSPICIOUS_LOGIN", description: "Intentos de autenticacion desde multiples ubicaciones.", icon: ShieldAlert },
  { key: "malware", label: "MALWARE_DETECT", description: "Deteccion de un archivo sospechoso en un endpoint.", icon: Skull },
  { key: "ddos", label: "DDOS_SIMULATION", description: "Volumen alto de eventos de red simulados (sin trafico real).", icon: Network },
];

export default function Simulator() {
  const [running, setRunning] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);

  async function trigger(key: string, label: string) {
    setRunning(key);
    setLog((prev) => [`[${new Date().toLocaleTimeString()}] > executing ${label}...`, ...prev].slice(0, 24));
    try {
      const res = await api.simulate(key);
      setLog((prev) => [`[${new Date().toLocaleTimeString()}] ${label}: ${res.message}`, ...prev].slice(0, 24));
    } catch {
      setLog((prev) => [`[${new Date().toLocaleTimeString()}] ${label}: ERROR contacting backend`, ...prev].slice(0, 24));
    } finally {
      setTimeout(() => setRunning(null), 600);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <GlitchText text="ATTACK_SIMULATOR" className="font-mono text-xl font-bold tracking-wide text-matrix-500" />
        <p className="mt-2 max-w-2xl font-mono text-xs leading-relaxed ">
          // Lanza ataques SIMULADOS y educativos. Cada comando genera eventos
          ficticios progresivamente en el backend para que puedas observar como
          el motor de deteccion los identifica. No se realiza ningun trafico de
          red real ni se ataca ningun sistema externo.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {ATTACKS.map(({ key, label, description, icon: Icon }) => {
          const isRunning = running === key;
          return (
            <div
              key={key}
              className={`group relative flex flex-col justify-between overflow-hidden border bg-panel/80 p-4 transition-all ${
                isRunning ? "border-matrix-500 shadow-glow-strong" : "border-border hover:border-matrix-500/50 hover:shadow-glow"
              }`}
            >
              {isRunning && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-matrix-500/10 to-transparent bg-[length:200%_100%] animate-border-scan" />
              )}
              <div className="relative">
                <div className="mb-2 flex items-center gap-2">
                  <Icon size={16} className={isRunning ? "text-matrix-400 animate-glow-pulse" : "text-matrix-500"} />
                  <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-ink">{label}</h3>
                </div>
                <p className="font-mono text-[11px] leading-relaxed ">{description}</p>
              </div>
              <button
                onClick={() => trigger(key, label)}
                disabled={isRunning}
                className="relative mt-4 flex items-center justify-center gap-2 border border-matrix-500/50 bg-matrix-500/5 px-3 py-2 font-mono text-xs font-bold uppercase tracking-widest text-matrix-400 transition-colors hover:bg-matrix-500/20 disabled:opacity-60"
              >
                <Crosshair size={13} className={isRunning ? "animate-spin" : ""} />
                {isRunning ? "executing..." : "> execute"}
              </button>
            </div>
          );
        })}
      </div>

      <Panel title="simulation.log -f">
        <div className="max-h-56 space-y-1 overflow-y-auto font-mono text-[11px] text-matrix-400">
          {log.length === 0 && <p className="">// ningun ataque lanzado todavia en esta sesion</p>}
          {log.map((line, idx) => (
            <p key={idx} className="animate-fade-slide-in">{line}</p>
          ))}
        </div>
      </Panel>
    </div>
  );
}
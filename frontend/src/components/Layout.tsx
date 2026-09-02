import { NavLink, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Search,
  ShieldAlert,
  FolderOpen,
  Crosshair,
  Map as MapIcon,
  ListChecks,
  Radio,
} from "lucide-react";
import clsx from "clsx";
import GravityMark from "./GravityMark";

const NAV_ITEMS = [
  { to: "/", label: "dashboard", icon: LayoutDashboard, end: true },
  { to: "/events", label: "event_explorer", icon: Search },
  { to: "/alerts", label: "alerts", icon: ShieldAlert },
  { to: "/incidents", label: "incidents", icon: FolderOpen },
  { to: "/simulator", label: "attack_sim", icon: Crosshair },
  { to: "/map", label: "threat_map", icon: MapIcon },
  { to: "/rules", label: "detection_rules", icon: ListChecks },
  { to: "/mitre", label: "mitre_attck", icon: Radio },
];

export default function Layout({ connected }: { connected: boolean }) {
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative z-10 flex min-h-screen text-ink">
      <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-void/70 backdrop-blur-sm">
        <div className="border-b border-border px-4 py-4">
          <GravityMark />
        </div>
        <nav className="flex-1 space-y-0.5 px-2 py-4">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                clsx(
                  "group flex items-center gap-2.5 border border-transparent px-3 py-2 font-mono text-xs uppercase tracking-wide transition-all",
                  isActive
                    ? "border-matrix-500/40 bg-matrix-500/10 text-matrix-400 shadow-glow"
                    : " hover:border-border-bright hover:bg-white/[0.03] hover:text-matrix-400"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={14} strokeWidth={2} />
                  <span className="flex-1">{label}</span>
                  {isActive && <span className="cursor-blink" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-border px-3 py-3">
          <div className="border border-severity-medium/30 bg-severity-medium/5 px-3 py-2">
            <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-severity-medium">
              ⚠ simulation_mode=true
            </p>
            <p className="mt-1 font-mono text-[10px] leading-snug ">
              Todos los eventos y ataques son ficticios / educativos.
            </p>
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-void/70 px-5 py-2.5 backdrop-blur-sm">
          <div className="flex items-center gap-5 font-mono text-[11px]">
            <span className="">{clock.toLocaleTimeString()}</span>
            <div className="flex items-center gap-2">
              <span
                className={clsx(
                  "h-1.5 w-1.5 rounded-full",
                  connected ? "bg-matrix-500 animate-glow-pulse" : "bg-severity-critical"
                )}
              />
              <span className={connected ? "text-matrix-400" : "text-severity-critical"}>
                {connected ? "UPLINK_ACTIVE" : "DISCONNECTED"}
              </span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
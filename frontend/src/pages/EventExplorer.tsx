import { useEffect, useState } from "react";
import { api } from "../api";
import Panel from "../components/Panel";
import SeverityBadge from "../components/SeverityBadge";
import GlitchText from "../components/GlitchText";
import type { SiemEvent } from "../types";

const SEVERITIES = ["", "CRITICAL", "HIGH", "MEDIUM", "LOW"];
const PAGE_SIZE = 20;

export default function EventExplorer() {
  const [items, setItems] = useState<SiemEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [severity, setSeverity] = useState("");
  const [eventType, setEventType] = useState("");
  const [sourceIp, setSourceIp] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("timestamp_desc");
  const [selected, setSelected] = useState<SiemEvent | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .events({
        severity: severity || undefined,
        event_type: eventType || undefined,
        source_ip: sourceIp || undefined,
        search: search || undefined,
        sort,
        page,
        page_size: PAGE_SIZE,
      })
      .then((res) => {
        if (cancelled) return;
        setItems(res.items);
        setTotal(res.total);
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [severity, eventType, sourceIp, search, sort, page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const inputCls =
    "border border-border bg-black/40 px-3 py-2 font-mono text-xs text-ink outline-none placeholder: focus:border-matrix-500";

  return (
    <div className="space-y-4">
      <div>
        <GlitchText text="EVENT_EXPLORER" className="font-mono text-xl font-bold tracking-wide text-matrix-500" />
        <p className="mt-1 font-mono text-xs ">// grep -i a traves de todos los eventos ingeridos</p>
      </div>

      <Panel>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <input
            placeholder="grep message..."
            value={search}
            onChange={(e) => { setPage(1); setSearch(e.target.value); }}
            className={`col-span-2 md:col-span-1 ${inputCls}`}
          />
          <input
            placeholder="source_ip"
            value={sourceIp}
            onChange={(e) => { setPage(1); setSourceIp(e.target.value); }}
            className={inputCls}
          />
          <input
            placeholder="event_type"
            value={eventType}
            onChange={(e) => { setPage(1); setEventType(e.target.value.toUpperCase()); }}
            className={inputCls}
          />
          <select value={severity} onChange={(e) => { setPage(1); setSeverity(e.target.value); }} className={inputCls}>
            {SEVERITIES.map((s) => <option key={s} value={s}>{s || "ALL_SEVERITY"}</option>)}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className={inputCls}>
            <option value="timestamp_desc">newest_first</option>
            <option value="timestamp_asc">oldest_first</option>
            <option value="severity">by_severity</option>
          </select>
        </div>
      </Panel>

      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border font-mono text-[10px] uppercase tracking-widest ">
                <th className="pb-2 font-medium">timestamp</th>
                <th className="pb-2 font-medium">type</th>
                <th className="pb-2 font-medium">source_ip</th>
                <th className="pb-2 font-medium">dest</th>
                <th className="pb-2 font-medium">system</th>
                <th className="pb-2 font-medium">severity</th>
              </tr>
            </thead>
            <tbody>
              {items.map((event) => (
                <tr
                  key={event.id}
                  onClick={() => setSelected(event)}
                  className="cursor-pointer border-b border-border/40 hover:bg-matrix-500/5"
                >
                  <td className="py-2 font-mono text-[11px] ">{new Date(event.timestamp).toLocaleString()}</td>
                  <td className="py-2 font-mono text-[11px] text-matrix-400">{event.event_type}</td>
                  <td className="py-2 font-mono text-[11px] text-ink">{event.source_ip}</td>
                  <td className="py-2 font-mono text-[11px] ">
                    {event.destination_ip ?? "—"}{event.destination_port ? `:${event.destination_port}` : ""}
                  </td>
                  <td className="py-2 font-mono text-[11px] ">{event.source_system}</td>
                  <td className="py-2"><SeverityBadge severity={event.severity} /></td>
                </tr>
              ))}
              {!loading && items.length === 0 && (
                <tr><td colSpan={6} className="py-6 text-center font-mono text-xs ">// no matches</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between font-mono text-[11px] ">
          <span>{total.toLocaleString()} events // page {page}/{totalPages}</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="border border-border px-3 py-1 hover:border-matrix-500 disabled:opacity-30">&lt; prev</button>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="border border-border px-3 py-1 hover:border-matrix-500 disabled:opacity-30">next &gt;</button>
          </div>
        </div>
      </Panel>

      {selected && (
        <div className="fixed inset-0 z-40 flex items-center justify-end bg-black/70" onClick={() => setSelected(null)}>
          <div onClick={(e) => e.stopPropagation()} className="h-full w-full max-w-lg overflow-y-auto border-l border-matrix-500/40 bg-panel p-5 shadow-glow-strong">
            <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-matrix-500">event.json</h3>
              <button onClick={() => setSelected(null)} className="font-mono  hover:text-severity-critical">[x]</button>
            </div>
            <pre className="whitespace-pre-wrap break-all font-mono text-[11px] text-matrix-300">
              {JSON.stringify(selected, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
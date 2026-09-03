import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { api } from "../api";
import Panel from "../components/Panel";
import GlitchText from "../components/GlitchText";
import type { MapSource } from "../types";

export default function ThreatMap() {
  const [sources, setSources] = useState<MapSource[]>([]);

  useEffect(() => {
    const load = () => api.mapSources().then(setSources).catch(() => {});
    load();
    const interval = setInterval(load, 8000);
    return () => clearInterval(interval);
  }, []);

  const maxCount = Math.max(...sources.map((s) => s.alert_count), 1);

  return (
    <div className="space-y-4">
      <div>
        <GlitchText text="THREAT_MAP" className="font-mono text-xl font-bold tracking-wide text-matrix-500" />
        <p className="mt-1 font-mono text-xs ">
          // ubicaciones simuladas de IPs atacantes — sin geolocalizacion real
        </p>
      </div>

      <Panel className="overflow-hidden !p-0">
        <div style={{ height: 480 }}>
          <MapContainer center={[20, 10]} zoom={2} style={{ height: "100%", width: "100%", background: "#02040A" }} worldCopyJump>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; OpenStreetMap contributors &copy; CARTO'
            />
            {sources.map((source) => (
              <CircleMarker
                key={source.source_ip}
                center={[source.lat, source.lng]}
                radius={6 + (source.alert_count / maxCount) * 14}
                pathOptions={{ color: "#FF2447", fillColor: "#FF2447", fillOpacity: 0.35, weight: 1 }}
              >
                <Popup>
                  <div className="font-mono text-xs">
                    <p className="font-semibold">{source.source_ip}</p>
                    <p>{source.country}</p>
                    <p>{source.alert_count} alerts</p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>
      </Panel>

      <Panel title="top_attack_sources">
        <div className="space-y-2 font-mono text-[11px]">
          {sources.sort((a, b) => b.alert_count - a.alert_count).slice(0, 8).map((s) => (
            <div key={s.source_ip} className="flex items-center justify-between border-b border-border/40 py-1.5">
              <span className="text-ink">{s.source_ip}</span>
              <span className="">{s.country}</span>
              <span className="text-severity-high">{s.alert_count} alerts</span>
            </div>
          ))}
          {sources.length === 0 && <p className="">// sin fuentes de ataque todavia</p>}
        </div>
      </Panel>
    </div>
  );
}
import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import MatrixRain from "./components/MatrixRain";
import CRTOverlay from "./components/CRTOverlay";
import BootSequence from "./components/BootSequence";
import { LiveStoreProvider, useLive } from "./liveStore";
import Dashboard from "./pages/Dashboard";
import EventExplorer from "./pages/EventExplorer";
import Alerts from "./pages/Alerts";
import Incidents from "./pages/Incidents";
import IncidentDetail from "./pages/IncidentDetail";
import Simulator from "./pages/Simulator";
import ThreatMap from "./pages/ThreatMap";
import Rules from "./pages/Rules";
import Mitre from "./pages/Mitre";

function Shell() {
  const { connected } = useLive();
  return (
    <Routes>
      <Route element={<Layout connected={connected} />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/events" element={<EventExplorer />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/incidents" element={<Incidents />} />
        <Route path="/incidents/:id" element={<IncidentDetail />} />
        <Route path="/simulator" element={<Simulator />} />
        <Route path="/map" element={<ThreatMap />} />
        <Route path="/rules" element={<Rules />} />
        <Route path="/mitre" element={<Mitre />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  const [booted, setBooted] = useState(() => sessionStorage.getItem("gravity-booted") === "1");

  function handleBootComplete() {
    sessionStorage.setItem("gravity-booted", "1");
    setBooted(true);
  }

  return (
    <LiveStoreProvider>
      <MatrixRain />
      <CRTOverlay />
      {!booted && <BootSequence onComplete={handleBootComplete} />}
      {booted && <Shell />}
    </LiveStoreProvider>
  );
}
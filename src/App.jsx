import React, { useState, useEffect, useMemo } from "react";
import { T, INITIAL_SPACES, uid } from "./lib/theme";
import { generateSmartNotification, LICENSE_LABEL } from "./lib/aiEngine";
import { NavBar, MobileNav } from "./components/NavBar";
import { SystemStatementStrip, Toast } from "./components/Primitives";
import { AuthScreen } from "./components/AuthScreen";
import { ExploreView } from "./views/ExploreView";
import { SpaceDetailView } from "./views/SpaceDetailView";
import { AIAgentView } from "./views/AIAgentView";
import { LeaseFlowView } from "./views/LeaseFlowView";
import { LicensesView } from "./views/LicensesView";
import { SmartAccessView } from "./views/SmartAccessView";
import { AdminView } from "./views/AdminView";

/* ------------------------------------------------------------------ */
/*  ROOT APP                                                           */
/* ------------------------------------------------------------------ */
export default function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });
  const [view, setView] = useState("explore");
  const [spaces, setSpaces] = useState(INITIAL_SPACES);
  const [selectedId, setSelectedId] = useState(null);
  const [lease, setLease] = useState({});
  const [licenses, setLicenses] = useState([]);
  const [accessLog, setAccessLog] = useState([]);
  const [toasts, setToasts] = useState([]);

  // --- User Behavior Tracking: every viewed space is logged, then folded into
  // zone/type interest counts that the AI Agent uses to personalize matches.
  const [viewLog, setViewLog] = useState([]);
  const behavior = useMemo(() => {
    const zoneCounts = {};
    viewLog.forEach((v) => { zoneCounts[v.zone] = (zoneCounts[v.zone] || 0) + 1; });
    return { zoneCounts, views: viewLog };
  }, [viewLog]);
  function trackView(spaceId) {
    const s = spaces.find((sp) => sp.id === spaceId);
    if (!s) return;
    setViewLog((log) => [...log, { spaceId, zone: s.zone, ts: Date.now() }]);
  }

  // --- Digital Twin: live occupancy status per space, colored green/red/yellow,
  // simulating real-time sensor updates across the district.
  const [occupancyStatus, setOccupancyStatus] = useState(() => {
    const init = {};
    INITIAL_SPACES.forEach((s) => { init[s.id] = "available"; });
    return init;
  });
  useEffect(() => {
    const interval = setInterval(() => {
      setOccupancyStatus((prev) => {
        const next = { ...prev };
        const candidates = spaces.filter((s) => s.id !== lease.spaceId || !lease.active);
        for (let i = 0; i < 2 && candidates.length; i++) {
          const pick = candidates[Math.floor(Math.random() * candidates.length)];
          const roll = Math.random();
          next[pick.id] = roll < 0.55 ? "available" : roll < 0.8 ? "reserved" : "occupied";
        }
        if (lease.spaceId && lease.active) next[lease.spaceId] = "occupied";
        return next;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [spaces, lease.spaceId, lease.active]);

  // --- Smart Notifications: ambient AI-generated nudges from live demand signals,
  // replacing static alerts with context-aware messages.
  useEffect(() => {
    const interval = setInterval(() => {
      const msg = generateSmartNotification(spaces, occupancyStatus);
      if (msg) notify(msg);
    }, 20000);
    return () => clearInterval(interval);
  }, [spaces, occupancyStatus]);

  function notify(msg) {
    const id = uid("T");
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }

  const selectedSpace = spaces.find((s) => s.id === selectedId) || null;
  const leaseSpace = spaces.find((s) => s.id === lease.spaceId) || null;
  const leasedIds = lease.active ? [lease.spaceId] : [];

  function selectSpace(id) {
    trackView(id);
    setSelectedId(id);
    setView("space");
  }

  function startLease(spaceId) {
    setLease({ spaceId });
    setView("lease");
  }

  function generateLicenses() {
    const now = new Date().toLocaleString();
    setLicenses([
      { id: uid("TEN"), type: "tenant", issuedAt: now, status: "Pending", linkedAccount: user.phone },
      { id: uid("SPC"), type: "space", issuedAt: now, status: "Pending", spaceId: lease.spaceId },
      { id: uid("PRK"), type: "parking access", issuedAt: now, status: "Pending", plate: user.plate, linkedAccount: user.phone, spaceId: lease.spaceId },
    ]);
    notify("📄 Tenant License issued — linked to your account, pending approval");
    setTimeout(() => notify("📄 Space License issued — linked to your lease, pending approval"), 500);
    setTimeout(() => notify(`🅿️ Parking Access License issued — linked to plate ${user.plate}, pending approval`), 1000);
    setTimeout(() => notify("📱 Mobile notification: your licenses and QR codes are ready"), 1600);
    setView("licenses");
  }

  function setLicenseStatus(id, status) {
    setLicenses((prev) => {
      const updated = prev.map((l) => (l.id === id ? { ...l, status } : l));
      const lic = updated.find((l) => l.id === id);
      if (lic?.type === "parking access") {
        if (status === "Approved") notify(`🅿️ Parking Access License Approved — plate ${lic.plate} is now authorized for automatic gate entry`);
        else if (status === "Expired") notify(`⚠️ Parking Access License Expired — automatic entry suspended for plate ${lic.plate}`);
        else notify(`🅿️ Parking Access License set to Pending — automatic entry is on hold`);
      } else if (lic) {
        notify(`🛡️ ${LICENSE_LABEL[lic.type] || lic.type} marked ${status}`);
      }
      return updated;
    });
  }

  // Parking Access License registry — the "system database" LPR cameras and the
  // gate controller check against in real time. Kept in sync with the licensing
  // system so an approval/expiry there is reflected here instantly.
  const parkingRegistry = useMemo(() => {
    const p = licenses.find((l) => l.type === "parking access");
    if (!p) return [];
    return [{
      licenseId: p.id, plate: p.plate || user?.plate, status: p.status,
      spaceId: p.spaceId, tenantName: user?.name, issuedAt: p.issuedAt,
    }];
  }, [licenses, user]);

  if (!user) {
    return (
      <AuthScreen
        onAuth={(form) => {
          const loggedInUser = { name: form.name, phone: form.phone, businessType: form.businessType, plate: form.plate };
          localStorage.setItem("user", JSON.stringify(loggedInUser));
          setUser(loggedInUser);
          notify(`Welcome, ${form.name.split(" ")[0]}`);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen font-body" style={{ background: T.ink }}>
      <NavBar view={view} setView={setView} user={user} onLogout={() => { localStorage.removeItem("user"); setUser(null); }} />
      <SystemStatementStrip />
      <MobileNav view={view} setView={setView} />

      {view === "explore" && (
        <ExploreView spaces={spaces} leasedIds={leasedIds} occupancyStatus={occupancyStatus} user={user} behavior={behavior} onSelect={selectSpace} />
      )}
      {view === "space" && selectedSpace && (
        <SpaceDetailView space={selectedSpace} isLeased={leasedIds.includes(selectedSpace.id)} occupancyStatus={occupancyStatus} onBack={() => setView("explore")} onLease={startLease} />
      )}
      {view === "ai" && (
        <AIAgentView spaces={spaces} user={user} behavior={behavior} onSelect={selectSpace} />
      )}
      {view === "lease" && (
        <LeaseFlowView space={leaseSpace} user={user} lease={lease} setLease={setLease} notify={notify} onDone={generateLicenses} />
      )}
      {view === "licenses" && <LicensesView licenses={licenses} user={user} space={leaseSpace} onSetStatus={setLicenseStatus} />}
      {view === "access" && (
        <SmartAccessView user={user} licenses={licenses} parkingRegistry={parkingRegistry} accessLog={accessLog} setAccessLog={setAccessLog} notify={notify} />
      )}
      {view === "admin" && <AdminView spaces={spaces} setSpaces={setSpaces} leasedIds={leasedIds} occupancyStatus={occupancyStatus} />}

      <Toast toasts={toasts} />
    </div>
  );
}


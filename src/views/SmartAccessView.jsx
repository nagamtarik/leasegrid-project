import React, { useState } from "react";
import { ScanLine, QrCode, KeyRound, CheckCircle2, X, Activity } from "lucide-react";
import { T, uid } from "../lib/theme";
import { Pill, QRPlaceholder } from "../components/Primitives";

/* ------------------------------------------------------------------ */
/*  SMART ACCESS — Parking Access License Control System               */
/*  Connects: user account · licensing system · entry/exit gate         */
/* ------------------------------------------------------------------ */
export function SmartAccessView({ user, licenses, parkingRegistry, accessLog, setAccessLog, notify }) {
  const [mode, setMode] = useState("lpr");
  const [plateInput, setPlateInput] = useState(user.plate);
  const [gateOpen, setGateOpen] = useState(false);
  const [result, setResult] = useState(null);
  const [validating, setValidating] = useState(false);
  const [stage, setStage] = useState("");

  const parkingLicense = licenses.find((l) => l.type === "parking access");
  const registryEntry = parkingRegistry[0];

  function logEvent(method, granted, plate) {
    setAccessLog((log) => [
      { id: uid("LOG"), time: new Date().toLocaleString(), plate, zone: "Parking Deck", method, result: granted ? "Granted" : "Denied" },
      ...log,
    ]);
  }

  function openGate() {
    setGateOpen(true);
    setTimeout(() => setGateOpen(false), 1800);
  }

  // Simulates a real-time round trip to the licensing system's registry —
  // camera reads a plate, the gate controller queries the database, decision returns.
  function runLPRCheck() {
    setResult(null);
    setValidating(true);
    setStage("🔍 Camera reading plate…");
    setTimeout(() => {
      setStage("📡 Querying Parking Access License registry…");
      setTimeout(() => {
        const plateNorm = plateInput.trim().toUpperCase();
        const match = registryEntry && registryEntry.plate.toUpperCase() === plateNorm;
        const valid = match && registryEntry.status === "Approved";
        setValidating(false);
        setStage("");
        setResult(valid ? "granted" : "denied");
        logEvent("LPR", valid, plateNorm);
        if (valid) {
          openGate();
          notify("🚗 LPR matched an Approved Parking Access License — gate opened automatically");
        } else if (match && registryEntry.status !== "Approved") {
          notify(`⛔ Plate recognized but license status is "${registryEntry.status}" — access denied. Try the QR fallback if this is urgent.`);
        } else {
          notify("⛔ Plate not found in the Parking Access License registry — access denied");
        }
      }, 700);
    }, 500);
  }

  // QR fallback — used when the camera can't read a plate (dirt, glare, temp tag).
  // Validates the license record directly instead of the plate.
  function runQRCheck() {
    setResult(null);
    setValidating(true);
    setStage("📷 Reading QR code…");
    setTimeout(() => {
      setStage("📡 Validating license record…");
      setTimeout(() => {
        const valid = parkingLicense && parkingLicense.status === "Approved";
        setValidating(false);
        setStage("");
        setResult(valid ? "granted" : "denied");
        logEvent("QR", valid, parkingLicense?.plate || user.plate);
        if (valid) {
          openGate();
          notify("📱 QR verified against an Approved Parking Access License — gate opened automatically");
        } else {
          notify(`⛔ QR scan denied — license status is "${parkingLicense?.status || "not issued"}"`);
        }
      }, 700);
    }, 500);
  }

  const statusColor = registryEntry?.status === "Approved" ? T.signal : registryEntry?.status === "Expired" ? "#E0574C" : "#E8C93D";

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-1"><ScanLine size={18} color={T.amber} /><div className="font-display text-lg font-semibold" style={{ color: T.paper }}>Smart Access — Parking Access License Control</div></div>
      <div className="font-body text-sm mb-4" style={{ color: T.ash }}>Real-time validation against the Parking Access License registry — synced with your user account and vehicle plate.</div>

      <div className="rounded-lg p-3 mb-5 flex items-center justify-between flex-wrap gap-2" style={{ background: T.panel2, border: `1px solid ${T.line}` }}>
        <div className="font-mono text-[11px] flex items-center gap-2" style={{ color: T.ash }}>
          <KeyRound size={13} color={T.amber} /> LICENSE {parkingLicense?.id || "— none issued —"} · PLATE {parkingLicense?.plate || user.plate}
        </div>
        <span className="font-mono text-[10px] px-2 py-0.5 rounded flex items-center gap-1" style={{ color: statusColor, border: `1px solid ${statusColor}55` }}>
          <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: statusColor }} /> {registryEntry ? registryEntry.status.toUpperCase() : "NOT ISSUED"}
        </span>
      </div>

      <div className="flex gap-1.5 mb-4">
        <Pill icon={ScanLine} active={mode === "lpr"} onClick={() => setMode("lpr")}>LPR Camera</Pill>
        <Pill icon={QrCode} active={mode === "qr"} onClick={() => setMode("qr")}>QR Fallback</Pill>
      </div>

      <div className="rounded-xl p-6 mb-5 flex flex-col items-center" style={{ background: T.panel2, border: `1px solid ${T.line}` }}>
        <svg width="220" height="120" viewBox="0 0 220 120">
          <rect x="10" y="90" width="200" height="10" fill={T.line} />
          <rect x="30" y="20" width="10" height="80" fill={T.ash} />
          <rect x="180" y="20" width="10" height="80" fill={T.ash} />
          <rect x="35" y="88" width="150" height="10" fill={gateOpen ? T.signal : T.danger}
            style={{ transformOrigin: "35px 90px", transform: gateOpen ? "rotate(-70deg)" : "rotate(0deg)", transition: "transform 0.6s ease" }} />
          <circle cx="185" cy="30" r="6" fill={gateOpen ? T.signal : T.ash} />
        </svg>

        {mode === "lpr" ? (
          <div className="flex gap-2 mt-4 w-full max-w-sm">
            <input value={plateInput} onChange={(e) => setPlateInput(e.target.value)} className="flex-1 px-3 py-2.5 rounded-md font-mono text-sm outline-none text-center"
              style={{ background: T.ink, border: `1px solid ${T.line}`, color: T.paper }} />
            <button onClick={runLPRCheck} disabled={validating} className="font-mono text-xs px-4 py-2.5 rounded-md font-semibold shrink-0" style={{ background: T.amber, color: T.ink, opacity: validating ? 0.5 : 1 }}>SIMULATE ARRIVAL</button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 mt-4 w-full max-w-sm">
            {parkingLicense ? <QRPlaceholder seed={parkingLicense.id} size={110} /> : <div className="font-mono text-[11px]" style={{ color: T.ash }}>No parking license on file</div>}
            <button onClick={runQRCheck} disabled={validating || !parkingLicense} className="font-mono text-xs px-4 py-2.5 rounded-md font-semibold w-full" style={{ background: T.amber, color: T.ink, opacity: validating || !parkingLicense ? 0.5 : 1 }}>
              SIMULATE QR SCAN AT GATE
            </button>
          </div>
        )}

        {validating && <div className="font-mono text-[11px] mt-3 flex items-center gap-2" style={{ color: T.ash }}><Activity size={12} /> {stage}</div>}
        {!validating && result && (
          <div className="font-mono text-xs mt-3 flex items-center gap-2" style={{ color: result === "granted" ? T.signal : T.danger }}>
            {result === "granted" ? <CheckCircle2 size={14} /> : <X size={14} />}
            {result === "granted" ? "ACCESS GRANTED — gate opened" : "ACCESS DENIED — no valid Parking Access License found"}
          </div>
        )}
      </div>

      <div className="font-mono text-xs mb-2" style={{ color: T.ash }}>ACCESS EVENT LOG</div>
      <div className="flex flex-col gap-1.5">
        {accessLog.length === 0 && <div className="font-mono text-[11px]" style={{ color: T.ash }}>No entries yet.</div>}
        {accessLog.map((l) => (
          <div key={l.id} className="flex items-center justify-between font-mono text-[11px] rounded-md px-3 py-2 flex-wrap gap-1" style={{ background: T.panel2, border: `1px solid ${T.line}`, color: T.paper }}>
            <span>{l.plate}</span>
            <span className="px-1.5 py-0.5 rounded" style={{ background: T.ink, color: T.ash }}>{l.method}</span>
            <span style={{ color: l.result === "Granted" ? T.signal : T.danger }}>{l.result}</span>
            <span style={{ color: T.ash }}>{l.zone}</span>
            <span style={{ color: T.ash }}>{l.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}


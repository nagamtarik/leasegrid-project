import React, { useMemo } from "react";
import { Bell, CheckCircle2, AlertTriangle, Activity } from "lucide-react";
import { T } from "../lib/theme";
import { SYSTEM_STATEMENT } from "../lib/aiEngine";

/* ------------------------------------------------------------------ */
/*  QR PLACEHOLDER (deterministic pseudo-pattern, illustrative only)   */
/* ------------------------------------------------------------------ */
function seededGrid(seed, size = 11) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const cells = [];
  for (let y = 0; y < size; y++) {
    const row = [];
    for (let x = 0; x < size; x++) {
      h = (h * 1103515245 + 12345) >>> 0;
      row.push((h >>> 16) % 3 === 0);
    }
    cells.push(row);
  }
  return cells;
}

export function QRPlaceholder({ seed, size = 96, color = T.ink }) {
  const grid = useMemo(() => seededGrid(seed), [seed]);
  const cell = size / grid.length;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill="#fff" />
      {grid.map((row, y) =>
        row.map((on, x) =>
          on ? <rect key={x + "-" + y} x={x * cell} y={y * cell} width={cell} height={cell} fill={color} /> : null
        )
      )}
      {[[0, 0], [grid.length - 3, 0], [0, grid.length - 3]].map(([cx, cy], i) => (
        <g key={i}>
          <rect x={cx * cell} y={cy * cell} width={cell * 3} height={cell * 3} fill="none" stroke={color} strokeWidth={cell * 0.5} />
        </g>
      ))}
    </svg>
  );
}


/* ------------------------------------------------------------------ */
/*  SMALL UI PRIMITIVES                                                */
/* ------------------------------------------------------------------ */
export function Pill({ children, active, onClick, icon: Icon }) {
  return (
    <button
      onClick={onClick}
      className="font-mono text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors"
      style={{
        background: active ? T.amber : "transparent",
        color: active ? T.ink : T.ash,
        border: `1px solid ${active ? T.amber : T.line}`,
      }}
    >
      {Icon && <Icon size={12} />}
      {children}
    </button>
  );
}


export function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: T.panel2, border: `1px solid ${T.line}` }}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: accent + "22" }}>
        <Icon size={16} color={accent} />
      </div>
      <div>
        <div className="font-mono text-[11px]" style={{ color: T.ash }}>{label}</div>
        <div className="font-display text-lg font-semibold" style={{ color: T.paper }}>{value}</div>
      </div>
    </div>
  );
}


export function Toast({ toasts }) {
  return (
    <div className="fixed bottom-5 right-5 flex flex-col gap-2 z-50">
      {toasts.map((t) => (
        <div key={t.id} className="font-body text-sm px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-pulse"
          style={{ background: T.paper, color: T.ink, border: `1px solid ${T.amberDim}`, minWidth: 260 }}>
          <Bell size={14} color={T.amberDim} />
          {t.msg}
        </div>
      ))}
    </div>
  );
}


export function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <div className="font-mono text-[11px] mb-1" style={{ color: T.ash }}>{label.toUpperCase()}</div>
      <input value={value} type={type} placeholder={placeholder} onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 rounded-md font-body text-sm outline-none"
        style={{ background: T.ink, border: `1px solid ${T.line}`, color: T.paper }} />
    </div>
  );
}


export function MiniStat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg p-3" style={{ background: T.panel2, border: `1px solid ${T.line}` }}>
      <div className="flex items-center gap-1.5 mb-1"><Icon size={12} color={T.amber} /><span className="font-mono text-[10px]" style={{ color: T.ash }}>{label.toUpperCase()}</span></div>
      <div className="font-body text-sm" style={{ color: T.paper }}>{value}</div>
    </div>
  );
}


export function TinyMetric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-md p-2" style={{ background: T.ink }}>
      <Icon size={11} color={T.signal} />
      <div className="font-display text-sm font-semibold mt-1" style={{ color: T.paper }}>{value}</div>
      <div className="font-mono text-[9px]" style={{ color: T.ash }}>{label}</div>
    </div>
  );
}


// System-level identity banner — rendered app-wide below the nav bar
export function SystemStatementStrip() {
  return (
    <div className="flex items-center gap-2 px-6 py-1.5" style={{ background: T.panel, borderBottom: `1px solid ${T.line}` }}>
      <Activity size={11} color={T.amber} style={{ flexShrink: 0 }} />
      <div className="font-mono text-[10px] leading-tight" style={{ color: T.ash }}>{SYSTEM_STATEMENT}</div>
    </div>
  );
}


// Lifecycle stepper used on license cards
export const LIFECYCLE_STAGES = ["Issued", "Linked", "Pending", "Approved"];

export function LifecycleStepper({ status }) {
  const activeIndex = status === "Expired" ? 3 : status === "Approved" ? 3 : status === "Pending" ? 2 : 1;
  return (
    <div className="flex items-center gap-1 mb-3">
      {LIFECYCLE_STAGES.map((stage, i) => {
        const reached = i <= activeIndex;
        const isExpiredEnd = status === "Expired" && i === 3;
        return (
          <React.Fragment key={stage}>
            <div className="flex flex-col items-center" style={{ width: 46 }}>
              <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: isExpiredEnd ? "#E0574C" : reached ? T.signalDim : T.paperDim }}>
                {reached && !isExpiredEnd && <CheckCircle2 size={10} color="#fff" />}
                {isExpiredEnd && <AlertTriangle size={10} color="#fff" />}
              </div>
              <div className="font-mono text-[8px] mt-0.5 text-center leading-tight" style={{ color: T.ink }}>
                {isExpiredEnd ? "Expired" : stage}
              </div>
            </div>
            {i < LIFECYCLE_STAGES.length - 1 && <div className="flex-1 h-[2px]" style={{ background: i < activeIndex ? T.signalDim : T.paperDim }} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}


import React from "react";
import {
  MapPin, Sparkles, FileSignature, BadgeCheck, ScanLine, LayoutDashboard, LogOut
} from "lucide-react";
import { T } from "../lib/theme";

/* ------------------------------------------------------------------ */
/*  NAV                                                                */
/* ------------------------------------------------------------------ */
export const NAV_ITEMS = [
  { id: "explore", label: "Explore", icon: MapPin },
  { id: "ai", label: "AI Agent", icon: Sparkles },
  { id: "lease", label: "My Lease", icon: FileSignature },
  { id: "licenses", label: "Licenses", icon: BadgeCheck },
  { id: "access", label: "Smart Access", icon: ScanLine },
  { id: "admin", label: "Admin", icon: LayoutDashboard },
];


export function NavBar({ view, setView, user, onLogout }) {
  return (
    <div className="flex items-center justify-between px-6 py-3 sticky top-0 z-40" style={{ background: T.ink, borderBottom: `1px solid ${T.line}` }}>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-md flex items-center justify-center font-display font-bold" style={{ background: T.amber, color: T.ink }}>L</div>
        <div className="font-display font-semibold tracking-tight" style={{ color: T.paper }}>LEASEGRID</div>
        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded" style={{ color: T.ash, border: `1px solid ${T.line}` }}>DEMO</span>
      </div>
      <div className="hidden md:flex items-center gap-1">
        {NAV_ITEMS.map((n) => (
          <button key={n.id} onClick={() => setView(n.id)}
            className="font-mono text-xs px-3 py-2 rounded-md flex items-center gap-1.5 transition-colors"
            style={{ color: view === n.id ? T.ink : T.ash, background: view === n.id ? T.amber : "transparent" }}>
            <n.icon size={13} /> {n.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <div className="font-mono text-xs" style={{ color: T.paper }}>{user.name}</div>
          <div className="font-mono text-[10px]" style={{ color: T.ash }}>{user.plate}</div>
        </div>
        <button onClick={onLogout} className="w-8 h-8 rounded-md flex items-center justify-center" style={{ border: `1px solid ${T.line}` }}>
          <LogOut size={13} color={T.ash} />
        </button>
      </div>
    </div>
  );
}


export function MobileNav({ view, setView }) {
  return (
    <div className="flex md:hidden overflow-x-auto scrollbar-thin gap-1 px-4 py-2" style={{ background: T.ink, borderBottom: `1px solid ${T.line}` }}>
      {NAV_ITEMS.map((n) => (
        <button key={n.id} onClick={() => setView(n.id)}
          className="font-mono text-[11px] px-3 py-1.5 rounded-md flex items-center gap-1 shrink-0"
          style={{ color: view === n.id ? T.ink : T.ash, background: view === n.id ? T.amber : "transparent", border: `1px solid ${view===n.id?T.amber:T.line}` }}>
          <n.icon size={12} /> {n.label}
        </button>
      ))}
    </div>
  );
}


import React, { useState, useMemo } from "react";
import { MapPin, Activity, Flame, TrendingUp } from "lucide-react";
import { T, STATUS_COLOR } from "../lib/theme";
import { computeSpaceTags, computeDynamicPrice, TAG_STYLE } from "../lib/aiEngine";
import { Pill } from "../components/Primitives";

/* ------------------------------------------------------------------ */
/*  EXPLORE — blueprint map + list                                     */
/* ------------------------------------------------------------------ */
export function ExploreView({ spaces, onSelect, leasedIds, occupancyStatus, user, behavior }) {
  const [zoneFilter, setZoneFilter] = useState("All");
  const [hover, setHover] = useState(null);
  const zones = ["All", ...Array.from(new Set(spaces.map((s) => s.zone)))];
  const filtered = zoneFilter === "All" ? spaces : spaces.filter((s) => s.zone === zoneFilter);

  const tags = useMemo(
    () => computeSpaceTags(spaces, { biz: user.businessType, budget: 2500, zone: "Any" }, behavior),
    [spaces, user.businessType, behavior]
  );

  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3">
        <div className="flex items-center justify-between mb-3">
          <div className="font-display text-lg font-semibold" style={{ color: T.paper }}>District Map — Digital Twin</div>
          <div className="flex gap-1.5 flex-wrap">
            {zones.map((z) => <Pill key={z} active={zoneFilter === z} onClick={() => setZoneFilter(z)}>{z}</Pill>)}
          </div>
        </div>
        <div className="relative rounded-xl grid-bg overflow-hidden" style={{ height: 460, background: T.panel, border: `1px solid ${T.line}` }}>
          <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }}>
            <line x1="0%" y1="20%" x2="100%" y2="20%" stroke={T.line} strokeDasharray="4 4" />
            <line x1="45%" y1="0%" x2="45%" y2="100%" stroke={T.line} strokeDasharray="4 4" />
          </svg>
          {filtered.map((s) => {
            const leased = leasedIds.includes(s.id);
            const status = leased ? "occupied" : occupancyStatus?.[s.id] || "available";
            const spaceTags = tags[s.id] || [];
            return (
              <button key={s.id} onClick={() => onSelect(s.id)} onMouseEnter={() => setHover(s.id)} onMouseLeave={() => setHover(null)}
                className="absolute -translate-x-1/2 -translate-y-full flex flex-col items-center group"
                style={{ left: `${s.pin.x}%`, top: `${s.pin.y}%` }}>
                <div className="flex flex-col items-center gap-1 mb-1 transition-opacity" style={{ opacity: hover === s.id ? 1 : 0 }}>
                  {spaceTags[0] && (
                    <span className="font-mono text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap" style={{ background: TAG_STYLE[spaceTags[0]].bg, color: TAG_STYLE[spaceTags[0]].fg }}>
                      {spaceTags[0]}
                    </span>
                  )}
                  <div className="font-mono text-[10px] px-2 py-1 rounded whitespace-nowrap" style={{ background: T.ink, color: T.paper, border: `1px solid ${T.line}` }}>
                    {s.name} · ${s.price}/mo
                  </div>
                </div>
                <MapPin size={26} fill={STATUS_COLOR[status]} color={T.ink} strokeWidth={1.5} />
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-2 flex-wrap">
          {Object.entries(STATUS_COLOR).map(([k, c]) => (
            <span key={k} className="font-mono text-[10px] flex items-center gap-1.5" style={{ color: T.ash }}>
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: c }} /> {k.charAt(0).toUpperCase() + k.slice(1)}
            </span>
          ))}
          <span className="font-mono text-[10px] flex items-center gap-1.5" style={{ color: T.ash }}><Activity size={11} /> Live simulation updates every few seconds</span>
        </div>
      </div>

      <div className="lg:col-span-2 flex flex-col gap-3 max-h-[500px] overflow-y-auto scrollbar-thin pr-1">
        {filtered.map((s) => {
          const status = leasedIds.includes(s.id) ? "occupied" : occupancyStatus?.[s.id] || "available";
          const dyn = computeDynamicPrice(s, occupancyStatus);
          const spaceTags = tags[s.id] || [];
          return (
            <button key={s.id} onClick={() => onSelect(s.id)} className="text-left rounded-lg p-4 transition-colors hover:brightness-110"
              style={{ background: T.panel2, border: `1px solid ${T.line}` }}>
              <div className="flex items-center justify-between mb-1">
                <div className="font-display font-semibold text-sm" style={{ color: T.paper }}>{s.name}</div>
                <div className="flex items-center gap-1.5">
                  {dyn.surge && (
                    <span className="font-mono text-[9px] px-1.5 py-0.5 rounded flex items-center gap-0.5" style={{ background: "#E0574C22", color: "#E0574C" }}>
                      <Flame size={10} /> {dyn.multiplier.toFixed(2)}x
                    </span>
                  )}
                  <div className="font-mono text-xs" style={{ color: T.amber }}>${dyn.price.toLocaleString()}/mo</div>
                </div>
              </div>
              <div className="font-mono text-[10px] mb-2" style={{ color: T.ash }}>{s.zone} · {s.dims.w}×{s.dims.l}×{s.dims.h}m</div>
              <div className="font-body text-xs" style={{ color: T.ash }}>{s.desc}</div>
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <span className="font-mono text-[10px] flex items-center gap-1" style={{ color: T.signal }}><TrendingUp size={11} />Traffic {s.traffic}</span>
                <span className="font-mono text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1" style={{ color: STATUS_COLOR[status], border: `1px solid ${STATUS_COLOR[status]}55` }}>
                  <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: STATUS_COLOR[status] }} /> {status}
                </span>
                {spaceTags.map((t) => (
                  <span key={t} className="font-mono text-[9px] px-1.5 py-0.5 rounded" style={{ background: TAG_STYLE[t].bg, color: TAG_STYLE[t].fg }}>{t}</span>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}


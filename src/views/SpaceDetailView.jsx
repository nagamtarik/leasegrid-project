import React, { useState } from "react";
import {
  ChevronLeft, Boxes, Ruler, DollarSign, TrendingUp, Users, CheckCircle2, FileSignature
} from "lucide-react";
import { T, STATUS_COLOR } from "../lib/theme";
import { computeDynamicPrice } from "../lib/aiEngine";
import { Space3D } from "../components/Space3D";
import { MiniStat } from "../components/Primitives";

/* ------------------------------------------------------------------ */
/*  SPACE DETAIL                                                       */
/* ------------------------------------------------------------------ */
export function SpaceDetailView({ space, onBack, onLease, isLeased, occupancyStatus }) {
  const [furniture, setFurniture] = useState(false);
  const status = isLeased ? "occupied" : occupancyStatus?.[space.id] || "available";
  const dyn = computeDynamicPrice(space, occupancyStatus);
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <button onClick={onBack} className="font-mono text-xs flex items-center gap-1 mb-4" style={{ color: T.ash }}>
        <ChevronLeft size={13} /> BACK TO MAP
      </button>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${T.line}` }}>
            <Space3D space={space} showFurniture={furniture} statusColor={STATUS_COLOR[status]} />
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="font-mono text-[11px]" style={{ color: T.ash }}>Drag to rotate the 3D preview</div>
            <button onClick={() => setFurniture((f) => !f)}
              className="font-mono text-xs px-3 py-1.5 rounded-md flex items-center gap-1.5"
              style={{ background: furniture ? T.signal : "transparent", color: furniture ? T.ink : T.ash, border: `1px solid ${furniture ? T.signal : T.line}` }}>
              <Boxes size={13} /> {furniture ? "Remove Shop Setup" : "Simulate Shop Setup"}
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs" style={{ color: T.amber }}>{space.zone.toUpperCase()}</span>
            <span className="font-mono text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1" style={{ color: STATUS_COLOR[status], border: `1px solid ${STATUS_COLOR[status]}55` }}>
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: STATUS_COLOR[status] }} /> {status.toUpperCase()}
            </span>
          </div>
          <div className="font-display text-2xl font-semibold mb-2" style={{ color: T.paper }}>{space.name}</div>
          <div className="font-body text-sm mb-4" style={{ color: T.ash }}>{space.desc}</div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <MiniStat icon={Ruler} label="Dimensions" value={`${space.dims.w} × ${space.dims.l} × ${space.dims.h} m`} />
            <MiniStat icon={DollarSign} label="Monthly rate" value={
              dyn.surge ? `$${dyn.price.toLocaleString()} (surge ${dyn.multiplier.toFixed(2)}x)` : `$${space.price.toLocaleString()}`
            } />
            <MiniStat icon={TrendingUp} label="Traffic score" value={`${space.traffic} / 100`} />
            <MiniStat icon={Users} label="Allowed uses" value={space.types.join(", ")} />
          </div>

          <div className="rounded-lg p-3 mb-4 font-mono text-[11px]" style={{ background: T.panel2, border: `1px solid ${T.line}`, color: T.ash }}>
            Floor area ≈ {(space.dims.w * space.dims.l).toFixed(1)} m² · Est. build-out cost ${Math.round(space.dims.w * space.dims.l * 180).toLocaleString()}
          </div>

          {isLeased ? (
            <div className="font-mono text-xs px-4 py-3 rounded-md flex items-center gap-2" style={{ background: T.signal + "22", color: T.signal }}>
              <CheckCircle2 size={14} /> You already hold an active lease on this space
            </div>
          ) : (
            <button onClick={() => onLease(space.id)} className="w-full font-mono text-sm py-3 rounded-md font-semibold flex items-center justify-center gap-2"
              style={{ background: T.amber, color: T.ink }}>
              <FileSignature size={15} /> LEASE THIS SPACE
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


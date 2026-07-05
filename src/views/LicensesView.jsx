import React from "react";
import { ShieldCheck, AlertTriangle, CheckCircle2, Clock, Car } from "lucide-react";
import { T } from "../lib/theme";
import { getMissingLicenses, labelForType, LICENSE_LABEL } from "../lib/aiEngine";
import { QRPlaceholder, LifecycleStepper } from "../components/Primitives";

/* ------------------------------------------------------------------ */
/*  LICENSES — Parking Access License is a core, mandatory license     */
/* ------------------------------------------------------------------ */
export function LicensesView({ licenses, user, space, onSetStatus }) {
  if (!licenses.length) {
    return <div className="p-10 text-center font-mono text-sm" style={{ color: T.ash }}>No licenses issued yet — complete a lease to generate them.</div>;
  }
  const missing = getMissingLicenses(user.businessType, licenses);
  const STATUS_STYLE = {
    Pending: { bg: "#E8C93D22", fg: "#E8C93D" },
    Approved: { bg: T.signal + "22", fg: T.signal },
    Expired: { bg: "#E0574C22", fg: "#E0574C" },
  };
  function cycle(status) {
    return status === "Pending" ? "Approved" : status === "Approved" ? "Expired" : "Pending";
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="rounded-xl p-4 mb-5" style={{ background: T.panel2, border: `1px solid ${missing.length ? "#E0574C" : T.line}` }}>
        <div className="font-mono text-[11px] mb-2 flex items-center gap-1.5" style={{ color: T.ash }}>
          <ShieldCheck size={13} /> COMPLIANCE CHECKLIST — {labelForType(user.businessType)}
        </div>
        {missing.length === 0 ? (
          <div className="font-mono text-xs flex items-center gap-2" style={{ color: T.signal }}><CheckCircle2 size={13} /> All required licenses are issued</div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {missing.map((m) => (
              <span key={m} className="font-mono text-[10px] px-2 py-1 rounded flex items-center gap-1" style={{ background: "#E0574C22", color: "#E0574C" }}>
                <AlertTriangle size={11} /> Missing: {m}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {licenses.map((lic) => {
          const isParking = lic.type === "parking access";
          return (
            <div key={lic.id} className="rounded-xl overflow-hidden perm-card pl-4" style={{ background: T.paper, border: `1px solid ${isParking ? T.amberDim : T.line}` }}>
              <div className="p-4 pl-2">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-mono text-[10px] px-2 py-0.5 rounded flex items-center gap-1" style={{ background: T.ink, color: T.amber }}>
                    {isParking && <Car size={10} />} {LICENSE_LABEL[lic.type] || lic.type.toUpperCase()}
                  </div>
                  {isParking && <span className="font-mono text-[8px] px-1.5 py-0.5 rounded" style={{ background: T.amberDim, color: T.paper }}>CORE</span>}
                  <ShieldCheck size={16} color={T.signalDim} />
                </div>
                <div className="font-display font-semibold text-sm mb-1" style={{ color: T.ink }}>{lic.id}</div>
                <div className="font-mono text-[10px] mb-2" style={{ color: T.amberDim }}>Space {space?.id} · {space?.name}</div>

                <LifecycleStepper status={lic.status} />

                <div className="flex justify-center mb-3"><QRPlaceholder seed={lic.id} size={110} /></div>
                <div className="font-mono text-[10px] leading-relaxed mb-3" style={{ color: T.ink }}>
                  HOLDER: {user.name}<br />PHONE: {user.phone}
                  {isParking && <><br />PLATE: <b>{lic.plate || user.plate}</b></>}
                  <br />ISSUED: {lic.issuedAt}
                </div>
                {isParking && (
                  <div className="font-mono text-[9px] mb-3 px-2 py-1.5 rounded" style={{ background: T.ink, color: lic.status === "Approved" ? T.signal : lic.status === "Expired" ? "#E0574C" : "#E8C93D" }}>
                    {lic.status === "Approved" && "🅿️ Automatic gate entry ENABLED for this plate"}
                    {lic.status === "Pending" && "⏳ Awaiting approval — automatic entry disabled"}
                    {lic.status === "Expired" && "⛔ License expired — automatic entry suspended"}
                  </div>
                )}
                <button onClick={() => onSetStatus(lic.id, cycle(lic.status))}
                  className="w-full font-mono text-[10px] px-2 py-1.5 rounded flex items-center justify-center gap-1.5"
                  style={{ background: STATUS_STYLE[lic.status].bg, color: STATUS_STYLE[lic.status].fg }}>
                  {lic.status === "Approved" ? <CheckCircle2 size={11} /> : lic.status === "Expired" ? <AlertTriangle size={11} /> : <Clock size={11} />}
                  {lic.status.toUpperCase()} · tap to update (demo)
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


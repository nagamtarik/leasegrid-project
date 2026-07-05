import React, { useState } from "react";
import { ChevronRight } from "lucide-react";
import { T, BIZ_TYPES } from "../lib/theme";
import { SYSTEM_STATEMENT } from "../lib/aiEngine";
import { Pill, Field } from "./Primitives";

/* ------------------------------------------------------------------ */
/*  AUTH                                                               */
/* ------------------------------------------------------------------ */
export function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("signup");
  const [form, setForm] = useState({ name: "", phone: "", businessType: "retail", plate: "", password: "" });
  const canSubmit = form.name && form.phone && form.plate && form.password.length >= 4;

  return (
    <div className="min-h-screen flex items-center justify-center grid-bg font-body" style={{ background: T.ink }}>
      <div className="w-full max-w-md mx-4">
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-lg flex items-center justify-center font-display font-bold text-xl mb-3" style={{ background: T.amber, color: T.ink }}>L</div>
          <div className="font-display text-2xl font-semibold" style={{ color: T.paper }}>LeaseGrid</div>
          <div className="font-mono text-xs mt-1" style={{ color: T.ash }}>AI-powered smart space leasing</div>
          <div className="font-mono text-[9px] mt-2 max-w-xs mx-auto leading-relaxed" style={{ color: T.ash }}>{SYSTEM_STATEMENT}</div>
        </div>

        <div className="rounded-xl p-6 perm-card pl-8" style={{ background: T.panel2, border: `1px solid ${T.line}` }}>
          <div className="flex gap-2 mb-5">
            <button onClick={() => setMode("signup")} className="flex-1 font-mono text-xs py-2 rounded-md" style={{ background: mode === "signup" ? T.amber : "transparent", color: mode === "signup" ? T.ink : T.ash, border: `1px solid ${T.line}` }}>SIGN UP</button>
            <button onClick={() => setMode("login")} className="flex-1 font-mono text-xs py-2 rounded-md" style={{ background: mode === "login" ? T.amber : "transparent", color: mode === "login" ? T.ink : T.ash, border: `1px solid ${T.line}` }}>LOG IN</button>
          </div>

          <div className="flex flex-col gap-3">
            <Field label="Full name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Jordan Reyes" />
            <Field label="Phone number" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="+1 555 010 2938" />
            {mode === "signup" && (
              <div>
                <div className="font-mono text-[11px] mb-1.5" style={{ color: T.ash }}>BUSINESS TYPE</div>
                <div className="flex flex-wrap gap-1.5">
                  {BIZ_TYPES.map((b) => (
                    <Pill key={b.id} icon={b.icon} active={form.businessType === b.id} onClick={() => setForm({ ...form, businessType: b.id })}>{b.label}</Pill>
                  ))}
                </div>
              </div>
            )}
            <Field label="Vehicle plate" value={form.plate} onChange={(v) => setForm({ ...form, plate: v.toUpperCase() })} placeholder="ABC-1234" />
            <Field label="Password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} placeholder="••••••••" type="password" />
          </div>

          <button disabled={!canSubmit} onClick={() => onAuth(form)}
            className="w-full mt-5 font-mono text-xs py-3 rounded-md font-semibold flex items-center justify-center gap-2 transition-opacity"
            style={{ background: T.amber, color: T.ink, opacity: canSubmit ? 1 : 0.4 }}>
            {mode === "signup" ? "CREATE ACCOUNT" : "ENTER LEASEGRID"} <ChevronRight size={14} />
          </button>
          <div className="font-mono text-[10px] text-center mt-3" style={{ color: T.ash }}>
            Secured mock auth · demo only, no real credentials stored
          </div>
        </div>
      </div>
    </div>
  );
}


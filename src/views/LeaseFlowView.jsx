import React, { useState } from "react";
import {
  FileSignature, CreditCard, ShieldCheck, KeyRound, CheckCircle2, Clock, Landmark, Wallet
} from "lucide-react";
import { T } from "../lib/theme";
import { Pill } from "../components/Primitives";

/* ------------------------------------------------------------------ */
/*  LEASE FLOW — contract, e-sign, payment/escrow                     */
/* ------------------------------------------------------------------ */
export function LeaseFlowView({ space, user, lease, setLease, notify, onDone }) {
  const [sigName, setSigName] = useState("");
  const [payMethod, setPayMethod] = useState("card");

  if (!space) {
    return <div className="p-10 text-center font-mono text-sm" style={{ color: T.ash }}>No space selected yet — pick one from Explore or the AI Agent.</div>;
  }

  const contractText = `LEASEGRID SMART SPACE AGREEMENT

Space: ${space.name} (${space.id})
Zone: ${space.zone}
Dimensions: ${space.dims.w}m × ${space.dims.l}m × ${space.dims.h}m
Monthly Rent: $${space.price.toLocaleString()}
Permitted Use: ${space.types.join(", ")}

Tenant: ${user.name}
Phone: ${user.phone}
Vehicle Plate: ${user.plate}

Term: 12 months, auto-renewing monthly thereafter.
Deposit: one month's rent, held in escrow until lease activation.
This is a demo document generated for prototype purposes.`;

  function sign() {
    setLease({ ...lease, signed: true, signature: sigName, signedAt: new Date().toLocaleString() });
    notify("📄 Contract signed and stored on your account");
  }

  function pay() {
    setLease({ ...lease, payment: { method: payMethod, status: "escrow", paidAt: new Date().toLocaleString() } });
    notify("💳 Funds submitted and held securely in escrow");
  }

  function activate() {
    const invoice = {
      id: uid("INV"),
      lines: [
        { label: "First month rent", amount: space.price },
        { label: "Security deposit", amount: space.price },
        { label: "Service fee", amount: Math.round(space.price * 0.03) },
      ],
    };
    invoice.total = invoice.lines.reduce((a, l) => a + l.amount, 0);
    setLease({ ...lease, payment: { ...lease.payment, status: "released", releasedAt: new Date().toLocaleString() }, invoice, active: true });
    notify("✅ Lease activated — escrow funds released to landlord");
  }

  return (
    <div className="p-6 max-w-3xl mx-auto flex flex-col gap-6">
      <Step n={1} title="Smart Digital Contract" done={lease.signed}>
        <pre className="font-mono text-[11px] whitespace-pre-wrap rounded-lg p-4 mb-3" style={{ background: T.ink, color: T.paper, border: `1px solid ${T.line}` }}>{contractText}</pre>
        {!lease.signed ? (
          <div className="flex flex-col sm:flex-row gap-2">
            <input value={sigName} onChange={(e) => setSigName(e.target.value)} placeholder="Type full name to sign"
              className="flex-1 px-3 py-2.5 rounded-md text-lg outline-none" style={{ background: T.ink, border: `1px solid ${T.line}`, color: T.amber, fontFamily: "cursive" }} />
            <button disabled={!sigName} onClick={sign} className="font-mono text-xs px-4 py-2.5 rounded-md font-semibold flex items-center gap-2 shrink-0"
              style={{ background: T.amber, color: T.ink, opacity: sigName ? 1 : 0.4 }}><FileSignature size={13} /> SIGN CONTRACT</button>
          </div>
        ) : (
          <div className="font-mono text-xs flex items-center gap-2" style={{ color: T.signal }}>
            <CheckCircle2 size={14} /> Signed by "{lease.signature}" on {lease.signedAt}
          </div>
        )}
      </Step>

      <Step n={2} title="Payment & Escrow" done={lease.payment?.status === "released"} disabled={!lease.signed}>
        {!lease.payment && (
          <>
            <div className="flex gap-2 mb-3">
              <Pill icon={CreditCard} active={payMethod === "card"} onClick={() => setPayMethod("card")}>Card</Pill>
              <Pill icon={Landmark} active={payMethod === "bank"} onClick={() => setPayMethod("bank")}>Bank Transfer</Pill>
              <Pill icon={Wallet} active={payMethod === "wallet"} onClick={() => setPayMethod("wallet")}>Digital Wallet</Pill>
            </div>
            <button onClick={pay} className="font-mono text-xs px-4 py-2.5 rounded-md font-semibold flex items-center gap-2" style={{ background: T.amber, color: T.ink }}>
              <ShieldCheck size={13} /> PAY & HOLD IN ESCROW
            </button>
          </>
        )}
        {lease.payment?.status === "escrow" && (
          <div className="flex flex-col gap-2">
            <EscrowStep label="Funds submitted" done />
            <EscrowStep label="Held securely in escrow" done />
            <EscrowStep label="Awaiting lease activation" pending />
            <button onClick={activate} className="mt-2 font-mono text-xs px-4 py-2.5 rounded-md font-semibold flex items-center gap-2 self-start" style={{ background: T.signal, color: T.ink }}>
              <KeyRound size={13} /> ACTIVATE LEASE & RELEASE FUNDS
            </button>
          </div>
        )}
        {lease.payment?.status === "released" && (
          <div className="flex flex-col gap-2">
            <EscrowStep label="Funds submitted" done />
            <EscrowStep label="Held securely in escrow" done />
            <EscrowStep label={`Released to landlord — ${lease.payment.releasedAt}`} done />
          </div>
        )}
      </Step>

      {lease.invoice && (
        <Step n={3} title="Invoice" done>
          <div className="rounded-lg p-4" style={{ background: T.paper, color: T.ink }}>
            <div className="font-mono text-xs mb-2">INVOICE {lease.invoice.id}</div>
            {lease.invoice.lines.map((l) => (
              <div key={l.label} className="flex justify-between font-body text-sm py-1" style={{ borderBottom: "1px dashed " + T.paperDim }}>
                <span>{l.label}</span><span>${l.amount.toLocaleString()}</span>
              </div>
            ))}
            <div className="flex justify-between font-display font-semibold text-base pt-2">
              <span>Total</span><span>${lease.invoice.total.toLocaleString()}</span>
            </div>
          </div>
          <button onClick={onDone} className="mt-4 font-mono text-xs px-4 py-2.5 rounded-md font-semibold flex items-center gap-2" style={{ background: T.amber, color: T.ink }}>
            <BadgeCheck size={13} /> GENERATE MY LICENSES
          </button>
        </Step>
      )}
    </div>
  );
}
export function Step({ n, title, children, done, disabled }) {
  return (
    <div className="rounded-xl p-5" style={{ background: T.panel2, border: `1px solid ${done ? T.signal : T.line}`, opacity: disabled ? 0.4 : 1 }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full flex items-center justify-center font-mono text-[11px]" style={{ background: done ? T.signal : T.line, color: T.ink }}>{done ? <CheckCircle2 size={13} /> : n}</div>
        <div className="font-display font-semibold text-sm" style={{ color: T.paper }}>{title}</div>
      </div>
      {!disabled && children}
    </div>
  );
}
export function EscrowStep({ label, done, pending }) {
  return (
    <div className="font-mono text-xs flex items-center gap-2" style={{ color: done ? T.signal : T.ash }}>
      {done ? <CheckCircle2 size={13} /> : <Clock size={13} />} {label}
    </div>
  );
}


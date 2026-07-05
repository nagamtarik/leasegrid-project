import React, { useState, useMemo } from "react";
import { Sparkles, Gauge, MessageSquare, ChevronRight, CheckCircle2, DollarSign, TrendingUp, Send } from "lucide-react";
import { T, BIZ_TYPES, uid } from "../lib/theme";
import { computeMatchScore, predictTraffic, estimateROI, computeSpaceTags, TAG_STYLE, labelForType } from "../lib/aiEngine";
import { Pill, TinyMetric } from "../components/Primitives";

/* ------------------------------------------------------------------ */
/*  AI AGENT                                                           */
/* ------------------------------------------------------------------ */
export function AIAgentView({ spaces, user, onSelect, behavior }) {
  const [mode, setMode] = useState("guided");
  const [biz, setBiz] = useState(user.businessType || "retail");
  const [budget, setBudget] = useState(2500);
  const [zone, setZone] = useState("Any");
  const [results, setResults] = useState(null);

  const zones = ["Any", ...Array.from(new Set(spaces.map((s) => s.zone)))];

  function runAgent() {
    const prefs = { biz, budget, zone };
    const scored = spaces.map((s) => {
      const { score, reasons } = computeMatchScore(s, prefs, behavior);
      const predictedTraffic = predictTraffic(s);
      const roi = estimateROI(s, biz);
      const avgSpend = biz === "food" ? 14 : biz === "retail" ? 22 : biz === "showroom" ? 30 : 9;
      const monthlyRevenue = Math.round(predictedTraffic * avgSpend * 0.18 * 30);
      return { ...s, score, reasons, predictedTraffic, roi, monthlyRevenue };
    }).sort((a, b) => b.score - a.score);
    setResults(scored.slice(0, 4));
  }

  const tags = useMemo(() => computeSpaceTags(spaces, { biz, budget, zone }, behavior), [spaces, biz, budget, zone, behavior]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Sparkles size={18} color={T.amber} />
          <div className="font-display text-lg font-semibold" style={{ color: T.paper }}>Leasing AI Agent</div>
        </div>
        <div className="flex gap-1">
          <Pill icon={Gauge} active={mode === "guided"} onClick={() => setMode("guided")}>Guided</Pill>
          <Pill icon={MessageSquare} active={mode === "chat"} onClick={() => setMode("chat")}>Chat</Pill>
        </div>
      </div>
      <div className="font-body text-sm mb-5" style={{ color: T.ash }}>Describe your business and I'll match spaces, explain why, predict traffic, and estimate ROI.</div>

      {mode === "chat" ? (
        <AIChatAgent spaces={spaces} user={user} behavior={behavior} onSelect={onSelect} />
      ) : (
        <>
          <div className="rounded-xl p-5 mb-5" style={{ background: T.panel2, border: `1px solid ${T.line}` }}>
            <div className="mb-3">
              <div className="font-mono text-[11px] mb-1.5" style={{ color: T.ash }}>BUSINESS TYPE</div>
              <div className="flex flex-wrap gap-1.5">
                {BIZ_TYPES.map((b) => <Pill key={b.id} icon={b.icon} active={biz === b.id} onClick={() => setBiz(b.id)}>{b.label}</Pill>)}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
              <div>
                <div className="font-mono text-[11px] mb-1.5" style={{ color: T.ash }}>MONTHLY BUDGET — ${budget.toLocaleString()}</div>
                <input type="range" min="150" max="6000" step="50" value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="w-full" />
              </div>
              <div>
                <div className="font-mono text-[11px] mb-1.5" style={{ color: T.ash }}>PREFERRED ZONE</div>
                <div className="flex flex-wrap gap-1.5">{zones.map((z) => <Pill key={z} active={zone === z} onClick={() => setZone(z)}>{z}</Pill>)}</div>
              </div>
            </div>
            <button onClick={runAgent} className="font-mono text-xs px-4 py-2.5 rounded-md font-semibold flex items-center gap-2" style={{ background: T.amber, color: T.ink }}>
              <Sparkles size={13} /> GET RECOMMENDATIONS
            </button>
          </div>

          {results && (
            <div className="flex flex-col gap-3">
              {results.map((r, i) => (
                <div key={r.id} className="rounded-xl p-4" style={{ background: T.panel2, border: `1px solid ${i === 0 ? T.amber : T.line}` }}>
                  <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {(tags[r.id] || []).map((t) => (
                        <span key={t} className="font-mono text-[9px] px-1.5 py-0.5 rounded" style={{ background: TAG_STYLE[t].bg, color: TAG_STYLE[t].fg }}>{t}</span>
                      ))}
                      <div className="font-display font-semibold text-sm" style={{ color: T.paper }}>{r.name}</div>
                    </div>
                    <div className="font-mono text-xs" style={{ color: T.amber }}>${r.price}/mo</div>
                  </div>
                  <div className="font-mono text-[10px] mb-3" style={{ color: T.ash }}>{r.zone} · match score {r.score}/100</div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <TinyMetric icon={TrendingUp} label="Predicted traffic/day" value={r.predictedTraffic} />
                    <TinyMetric icon={Gauge} label="Est. monthly revenue" value={`$${r.monthlyRevenue.toLocaleString()}`} />
                    <TinyMetric icon={DollarSign} label="Projected ROI" value={`${r.roi}%`} />
                  </div>
                  <div className="rounded-md p-2.5 mb-3" style={{ background: T.ink }}>
                    <div className="font-mono text-[9px] mb-1.5" style={{ color: T.ash }}>WHY THIS SPACE</div>
                    <ul className="flex flex-col gap-1">
                      {r.reasons.map((reason, ri) => (
                        <li key={ri} className="font-body text-xs flex items-start gap-1.5" style={{ color: T.paper }}>
                          <CheckCircle2 size={11} color={T.signal} style={{ marginTop: 2, flexShrink: 0 }} /> {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button onClick={() => onSelect(r.id)} className="font-mono text-xs px-3 py-2 rounded-md flex items-center gap-1.5" style={{ border: `1px solid ${T.line}`, color: T.paper }}>
                    View Space <ChevronRight size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Natural-language chat agent — parses free text into structured preferences,
// then runs the same scoring engine as the guided form so results always agree.
export function parseIntent(text, user, zones) {
  const lower = text.toLowerCase();
  let biz = user.businessType || "retail";
  const bizSynonyms = {
    retail: ["retail", "shop", "store", "boutique"],
    food: ["food", "cafe", "coffee", "restaurant", "dining", "bar"],
    kiosk: ["kiosk", "booth", "service", "stall"],
    showroom: ["showroom", "flagship", "display"],
  };
  for (const [id, words] of Object.entries(bizSynonyms)) {
    if (words.some((w) => lower.includes(w))) { biz = id; break; }
  }

  let budget = 2500;
  const moneyMatch = lower.match(/\$?\s?(\d{3,6})/);
  if (moneyMatch) budget = Number(moneyMatch[1]);

  let zone = "Any";
  for (const z of zones) {
    if (lower.includes(z.toLowerCase())) { zone = z; break; }
  }

  return { biz, budget, zone };
}

export function AIChatAgent({ spaces, user, behavior, onSelect }) {
  const zones = Array.from(new Set(spaces.map((s) => s.zone)));
  const [messages, setMessages] = useState([
    { id: "m0", role: "assistant", text: `Hi ${user.name.split(" ")[0]}, tell me about your business — e.g. "I run a coffee shop, budget around $2000, prefer the Boulevard" — and I'll match spaces and explain why.` },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);

  function send() {
    if (!input.trim()) return;
    const userMsg = { id: uid("M"), role: "user", text: input };
    setMessages((m) => [...m, userMsg]);
    const prefs = parseIntent(input, user, zones);
    setInput("");
    setThinking(true);
    setTimeout(() => {
      const scored = spaces
        .map((s) => {
          const { score, reasons } = computeMatchScore(s, prefs, behavior);
          const roi = estimateROI(s, prefs.biz);
          return { space: s, score, reasons, roi };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);
      const summary = `Based on "${labelForType(prefs.biz)}" around $${prefs.budget}/mo${prefs.zone !== "Any" ? ` in ${prefs.zone}` : ""}, here's what I'd recommend:`;
      setMessages((m) => [...m, { id: uid("M"), role: "assistant", text: summary, recs: scored }]);
      setThinking(false);
    }, 550);
  }

  return (
    <div className="rounded-xl p-4 flex flex-col" style={{ background: T.panel2, border: `1px solid ${T.line}`, height: 560 }}>
      <div className="flex-1 overflow-y-auto scrollbar-thin flex flex-col gap-3 pr-1">
        {messages.map((m) => (
          <div key={m.id} className="flex flex-col gap-2" style={{ alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div className="font-body text-sm px-3 py-2 rounded-lg max-w-[85%]"
              style={{ background: m.role === "user" ? T.amber : T.ink, color: m.role === "user" ? T.ink : T.paper }}>
              {m.text}
            </div>
            {m.recs && (
              <div className="flex flex-col gap-2 w-full">
                {m.recs.map((r, i) => (
                  <div key={r.space.id} className="rounded-lg p-3" style={{ background: T.ink, border: `1px solid ${i === 0 ? T.amber : T.line}` }}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-display font-semibold text-xs" style={{ color: T.paper }}>{r.space.name}</div>
                      <div className="font-mono text-[10px]" style={{ color: T.amber }}>${r.space.price}/mo · {r.score}/100</div>
                    </div>
                    <ul className="flex flex-col gap-0.5 mb-2">
                      {r.reasons.slice(0, 2).map((reason, ri) => (
                        <li key={ri} className="font-mono text-[10px]" style={{ color: T.ash }}>· {reason}</li>
                      ))}
                    </ul>
                    <button onClick={() => onSelect(r.space.id)} className="font-mono text-[10px] px-2 py-1 rounded-md flex items-center gap-1" style={{ border: `1px solid ${T.line}`, color: T.paper }}>
                      View Space <ChevronRight size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {thinking && <div className="font-mono text-[11px]" style={{ color: T.ash }}>Agent is analyzing spaces…</div>}
      </div>
      <div className="flex gap-2 mt-3">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Describe your business, budget, and preferred zone…"
          className="flex-1 px-3 py-2.5 rounded-md font-body text-sm outline-none" style={{ background: T.ink, border: `1px solid ${T.line}`, color: T.paper }} />
        <button onClick={send} className="font-mono text-xs px-4 py-2.5 rounded-md font-semibold flex items-center gap-1.5 shrink-0" style={{ background: T.amber, color: T.ink }}>
          <Send size={13} />
        </button>
      </div>
    </div>
  );
}


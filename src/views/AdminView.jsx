import React, { useState, useMemo } from "react";
import { Building2, CheckCircle2, Gauge, DollarSign, Plus, X, Activity } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid,
  LineChart, Line
} from "recharts";
import { T, uid, BIZ_TYPES } from "../lib/theme";
import { forecastRevenue, predictPeakTimes, predictOccupancy } from "../lib/aiEngine";
import { StatCard, Field, Pill } from "../components/Primitives";

/* ------------------------------------------------------------------ */
/*  ADMIN DASHBOARD — with predictive analytics                        */
/* ------------------------------------------------------------------ */
export function AdminView({ spaces, setSpaces, leasedIds, occupancyStatus }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", zone: "Boulevard", w: 5, l: 4, h: 3, price: 1000, types: ["retail"] });

  const totalRevenue = spaces.filter((s) => leasedIds.includes(s.id)).reduce((a, s) => a + s.price, 0);
  const occupancy = Math.round((leasedIds.length / spaces.length) * 100);

  const revenueByZone = useMemo(() => {
    const map = {};
    spaces.forEach((s) => { map[s.zone] = (map[s.zone] || 0) + (leasedIds.includes(s.id) ? s.price : 0); });
    return Object.entries(map).map(([zone, revenue]) => ({ zone, revenue }));
  }, [spaces, leasedIds]);

  const occupancyPie = [
    { name: "Leased", value: leasedIds.length },
    { name: "Available", value: spaces.length - leasedIds.length },
  ];
  const PIE_COLORS = [T.signal, T.line];

  const forecast = useMemo(() => forecastRevenue(totalRevenue || spaces.reduce((a, s) => a + s.price, 0) * 0.15), [totalRevenue, spaces]);
  const peakTimes = useMemo(() => predictPeakTimes(spaces), [spaces]);
  const predictedOccupancy = useMemo(() => predictOccupancy(occupancy, occupancyStatus), [occupancy, occupancyStatus]);

  function addSpace() {
    const id = uid("SPC");
    setSpaces((prev) => [...prev, {
      id, name: form.name || "Untitled Space", zone: form.zone,
      pin: { x: 10 + Math.random() * 80, y: 10 + Math.random() * 80 },
      dims: { w: Number(form.w), l: Number(form.l), h: Number(form.h) },
      price: Number(form.price), types: form.types, traffic: 50,
      desc: "Newly listed space added via admin console.",
    }]);
    setShowAdd(false);
    setForm({ name: "", zone: "Boulevard", w: 5, l: 4, h: 3, price: 1000, types: ["retail"] });
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="font-display text-lg font-semibold" style={{ color: T.paper }}>Admin Console</div>
          <div className="font-mono text-[11px]" style={{ color: T.ash }}>Manage spaces, monitor occupancy and revenue</div>
        </div>
        <button onClick={() => setShowAdd(true)} className="font-mono text-xs px-3 py-2 rounded-md flex items-center gap-1.5 font-semibold" style={{ background: T.amber, color: T.ink }}>
          <Plus size={13} /> ADD SPACE
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard icon={Building2} label="TOTAL SPACES" value={spaces.length} accent={T.amber} />
        <StatCard icon={CheckCircle2} label="LEASED" value={leasedIds.length} accent={T.signal} />
        <StatCard icon={Gauge} label="OCCUPANCY" value={occupancy + "%"} accent={T.ash} />
        <StatCard icon={DollarSign} label="MONTHLY REVENUE" value={"$" + totalRevenue.toLocaleString()} accent={T.amber} />
      </div>

      <div className="mb-2 font-mono text-[11px] flex items-center gap-1.5" style={{ color: T.ash }}>
        <Activity size={12} /> PREDICTIVE ANALYTICS (AI forecast — mock model)
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <div className="rounded-xl p-4" style={{ background: T.panel2, border: `1px solid ${T.line}` }}>
          <div className="font-mono text-[11px] mb-3" style={{ color: T.ash }}>REVENUE FORECAST — NEXT 6 MONTHS</div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={forecast}>
              <CartesianGrid stroke={T.lineSoft} vertical={false} />
              <XAxis dataKey="month" tick={{ fill: T.ash, fontSize: 10 }} axisLine={{ stroke: T.line }} tickLine={false} />
              <YAxis tick={{ fill: T.ash, fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: T.ink, border: `1px solid ${T.line}`, fontSize: 12 }} />
              <Line type="monotone" dataKey="revenue" stroke={T.amber} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-xl p-4" style={{ background: T.panel2, border: `1px solid ${T.line}` }}>
          <div className="font-mono text-[11px] mb-3" style={{ color: T.ash }}>PEAK TIME ANALYSIS</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={peakTimes}>
              <CartesianGrid stroke={T.lineSoft} vertical={false} />
              <XAxis dataKey="hour" tick={{ fill: T.ash, fontSize: 9 }} axisLine={{ stroke: T.line }} tickLine={false} />
              <YAxis tick={{ fill: T.ash, fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: T.ink, border: `1px solid ${T.line}`, fontSize: 12 }} />
              <Bar dataKey="traffic" fill={T.signal} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-xl p-4 flex flex-col justify-center items-center text-center" style={{ background: T.panel2, border: `1px solid ${T.line}` }}>
          <div className="font-mono text-[11px] mb-2" style={{ color: T.ash }}>PREDICTED OCCUPANCY — NEXT MONTH</div>
          <div className="font-display text-4xl font-bold mb-1" style={{ color: T.amber }}>{predictedOccupancy}%</div>
          <div className="font-mono text-[10px]" style={{ color: T.ash }}>vs. {occupancy}% current, based on reservation momentum</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <div className="rounded-xl p-4" style={{ background: T.panel2, border: `1px solid ${T.line}` }}>
          <div className="font-mono text-[11px] mb-3" style={{ color: T.ash }}>REVENUE BY ZONE</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueByZone}>
              <CartesianGrid stroke={T.lineSoft} vertical={false} />
              <XAxis dataKey="zone" tick={{ fill: T.ash, fontSize: 10 }} axisLine={{ stroke: T.line }} tickLine={false} />
              <YAxis tick={{ fill: T.ash, fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: T.ink, border: `1px solid ${T.line}`, fontSize: 12 }} />
              <Bar dataKey="revenue" fill={T.amber} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-xl p-4" style={{ background: T.panel2, border: `1px solid ${T.line}` }}>
          <div className="font-mono text-[11px] mb-3" style={{ color: T.ash }}>OCCUPANCY</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={occupancyPie} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={3}>
                {occupancyPie.map((e, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: T.ink, border: `1px solid ${T.line}`, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${T.line}` }}>
        <table className="w-full font-mono text-[11px]">
          <thead>
            <tr style={{ background: T.panel2, color: T.ash }}>
              {["ID", "NAME", "ZONE", "DIMS", "PRICE", "TYPES", "STATUS"].map((h) => <th key={h} className="text-left px-3 py-2 font-medium">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {spaces.map((s) => (
              <tr key={s.id} style={{ borderTop: `1px solid ${T.line}`, color: T.paper }}>
                <td className="px-3 py-2">{s.id}</td>
                <td className="px-3 py-2">{s.name}</td>
                <td className="px-3 py-2">{s.zone}</td>
                <td className="px-3 py-2">{s.dims.w}×{s.dims.l}×{s.dims.h}</td>
                <td className="px-3 py-2">${s.price}</td>
                <td className="px-3 py-2">{s.types.join(", ")}</td>
                <td className="px-3 py-2">
                  <span className="px-1.5 py-0.5 rounded" style={{ background: leasedIds.includes(s.id) ? T.signal + "22" : T.line, color: leasedIds.includes(s.id) ? T.signal : T.ash }}>
                    {leasedIds.includes(s.id) ? "LEASED" : "AVAILABLE"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "#00000099" }}>
          <div className="rounded-xl p-5 w-full max-w-md" style={{ background: T.panel2, border: `1px solid ${T.line}` }}>
            <div className="flex items-center justify-between mb-4">
              <div className="font-display font-semibold" style={{ color: T.paper }}>Add New Space</div>
              <button onClick={() => setShowAdd(false)}><X size={16} color={T.ash} /></button>
            </div>
            <div className="flex flex-col gap-3">
              <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Unit name" />
              <div className="grid grid-cols-3 gap-2">
                <Field label="W (m)" value={form.w} onChange={(v) => setForm({ ...form, w: v })} />
                <Field label="L (m)" value={form.l} onChange={(v) => setForm({ ...form, l: v })} />
                <Field label="H (m)" value={form.h} onChange={(v) => setForm({ ...form, h: v })} />
              </div>
              <Field label="Monthly price ($)" value={form.price} onChange={(v) => setForm({ ...form, price: v })} />
              <div>
                <div className="font-mono text-[11px] mb-1.5" style={{ color: T.ash }}>ALLOWED BUSINESS TYPES</div>
                <div className="flex flex-wrap gap-1.5">
                  {BIZ_TYPES.map((b) => (
                    <Pill key={b.id} icon={b.icon} active={form.types.includes(b.id)}
                      onClick={() => setForm({ ...form, types: form.types.includes(b.id) ? form.types.filter((t) => t !== b.id) : [...form.types, b.id] })}>
                      {b.label}
                    </Pill>
                  ))}
                </div>
              </div>
              <button onClick={addSpace} className="font-mono text-xs py-2.5 rounded-md font-semibold" style={{ background: T.amber, color: T.ink }}>SAVE SPACE</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


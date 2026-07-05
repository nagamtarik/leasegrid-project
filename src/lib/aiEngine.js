import { T, BIZ_TYPES } from "./theme";

/* ------------------------------------------------------------------ */
/*  AI ENGINE — recommendation scoring, reasoning, licensing,          */
/*  dynamic pricing, and smart notifications. Shared by every view.    */
/* ------------------------------------------------------------------ */

// Licenses legally required per business type — feeds the Smart Licensing System
export const REQUIRED_LICENSES = {
  retail: ["Tenant License", "Space License", "Business Operation Permit", "Parking Access License"],
  food: ["Tenant License", "Space License", "Health & Safety Permit", "Food Handling Permit", "Parking Access License"],
  kiosk: ["Tenant License", "Space License", "Business Operation Permit", "Parking Access License"],
  showroom: ["Tenant License", "Space License", "Business Operation Permit", "Fire Safety Certificate", "Parking Access License"],
  parking: ["Parking Access License"],
};

// Core scoring function — used by BOTH the guided form and the chat agent so
// recommendations are always consistent no matter how the user asks.
// Returns { score: 0-100, reasons: string[] } — the reasons power the "why" explanations.
export function computeMatchScore(space, prefs, behavior) {
  const reasons = [];
  let score = 0;

  if (space.types.includes(prefs.biz)) {
    score += 38;
    reasons.push(`Matches your business type (${labelForType(prefs.biz)})`);
  }

  const budget = prefs.budget || 2500;
  const priceFit = 1 - Math.min(1, Math.abs(space.price - budget) / Math.max(budget, 500));
  score += priceFit * 28;
  if (priceFit > 0.7) reasons.push(`$${space.price}/mo fits comfortably within your $${budget}/mo budget`);
  else if (priceFit < 0.35) reasons.push(`Price is a stretch relative to your stated budget`);

  if (prefs.zone && prefs.zone !== "Any" && space.zone === prefs.zone) {
    score += 16;
    reasons.push(`Located in your preferred zone (${space.zone})`);
  }

  score += (space.traffic / 100) * 12;
  if (space.traffic >= 80) reasons.push(`Very high foot traffic (${space.traffic}/100)`);
  else if (space.traffic >= 60) reasons.push(`Solid, steady foot traffic (${space.traffic}/100)`);

  if (behavior && behavior.zoneCounts && behavior.zoneCounts[space.zone]) {
    const bonus = Math.min(6, behavior.zoneCounts[space.zone] * 2);
    score += bonus;
    reasons.push(`You've been browsing ${space.zone} spaces — matches your recent interest`);
  }

  return { score: Math.round(Math.min(100, score)), reasons };
}

export function labelForType(id) {
  return (BIZ_TYPES.find((b) => b.id === id) || {}).label || id;
}

export function estimateROI(space, biz) {
  const avgSpend = biz === "food" ? 14 : biz === "retail" ? 22 : biz === "showroom" ? 30 : 9;
  const monthlyRevenue = space.traffic * avgSpend * 0.18 * 30;
  return Math.round(((monthlyRevenue - space.price) / space.price) * 100);
}

export function predictTraffic(space) {
  return Math.round(space.traffic * (0.92 + Math.random() * 0.12));
}

// Smart Recommendation Engine — tags spaces for at-a-glance UI badges
export function computeSpaceTags(spaces, prefs, behavior) {
  const scored = spaces.map((s) => ({
    id: s.id,
    score: computeMatchScore(s, prefs, behavior).score,
    roi: estimateROI(s, prefs.biz),
    traffic: s.traffic,
  }));
  const bestMatch = [...scored].sort((a, b) => b.score - a.score)[0];
  const bestRoi = [...scored].sort((a, b) => b.roi - a.roi)[0];
  const tags = {};
  scored.forEach((s) => {
    const t = [];
    if (bestMatch && s.id === bestMatch.id) t.push("Best Match");
    if (bestRoi && s.id === bestRoi.id && bestRoi.roi > 15) t.push("High ROI");
    if (s.traffic >= 80) t.push("High Demand");
    tags[s.id] = t;
  });
  return tags;
}
export const TAG_STYLE = {
  "Best Match": { bg: T.amber, fg: T.ink },
  "High ROI": { bg: T.signal, fg: T.ink },
  "High Demand": { bg: "#E0574C", fg: "#fff" },
};

// Dynamic Pricing AI — adjusts price based on demand, occupancy status, and time of day
export function computeDynamicPrice(space, occupancyStatus) {
  const status = occupancyStatus?.[space.id] || "available";
  const hour = new Date().getHours();
  const peakHour = (hour >= 11 && hour <= 14) || (hour >= 17 && hour <= 20);
  let multiplier = 1;
  if (space.traffic >= 80) multiplier += 0.12;
  if (status === "reserved") multiplier += 0.08;
  if (peakHour) multiplier += 0.06;
  multiplier = Math.min(multiplier, 1.35);
  return { price: Math.round(space.price * multiplier), multiplier, surge: multiplier > 1.08 };
}

// Smart Licensing System — compares a business type's legal requirements against issued licenses
export function getMissingLicenses(businessType, licenses) {
  const required = REQUIRED_LICENSES[businessType] || REQUIRED_LICENSES.retail;
  return required.filter((req) => !licenses.some((l) => req.toLowerCase().includes(l.type.toLowerCase())));
}

// Smart Notifications — replaces static alerts with demand-driven, AI-authored nudges
export function generateSmartNotification(spaces, occupancyStatus) {
  const trending = spaces.filter((s) => s.traffic >= 65 && occupancyStatus?.[s.id] !== "occupied");
  if (!trending.length) return null;
  const pick = trending[Math.floor(Math.random() * trending.length)];
  const { surge } = computeDynamicPrice(pick, occupancyStatus);
  return surge
    ? `🔥 Demand for ${pick.name} is surging — price is trending up, consider booking now`
    : `📈 ${pick.name} demand is rising (traffic ${pick.traffic}/100) — consider booking now`;
}

// Predictive Analytics — mock forecasting used by the Admin Dashboard
export function forecastRevenue(baseRevenue, months = 6) {
  const safe = Math.max(baseRevenue, 500);
  return Array.from({ length: months }, (_, i) => ({
    month: `M+${i + 1}`,
    revenue: Math.round(safe * (1 + 0.045 * i) * (1 + 0.05 * Math.sin(i))),
  }));
}
export function predictPeakTimes(spaces) {
  const avgTraffic = spaces.reduce((a, s) => a + s.traffic, 0) / Math.max(spaces.length, 1);
  const hours = [8, 10, 12, 14, 16, 18, 20, 22];
  return hours.map((h) => {
    const lunchBump = Math.exp(-Math.pow(h - 13, 2) / 6);
    const eveningBump = Math.exp(-Math.pow(h - 19, 2) / 8) * 0.85;
    const factor = 0.35 + lunchBump + eveningBump;
    return { hour: `${h}:00`, traffic: Math.round(avgTraffic * factor) };
  });
}
export function predictOccupancy(currentOccupancyPct, occupancyStatus) {
  const statuses = Object.values(occupancyStatus || {});
  const reserved = statuses.filter((s) => s === "reserved").length;
  const bump = statuses.length ? (reserved / statuses.length) * 22 : 0;
  return Math.min(100, Math.round(currentOccupancyPct + bump));
}

// System-level identity statement — surfaced wherever the platform's role needs
// to be made explicit: this is not a listings site, it's a lifecycle controller.
export const SYSTEM_STATEMENT =
  "The system doesn't just rent spaces — it controls the full lifecycle including access, permissions, and operational validation.";


// Human-readable labels for each issued license type
export const LICENSE_LABEL = { tenant: "Tenant License", space: "Space License", "parking access": "Parking Access License" };


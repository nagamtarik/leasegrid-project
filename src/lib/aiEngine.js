import { T, BIZ_TYPES } from "./theme";

/* ---------------- SAFE SMART NOTIFICATIONS ---------------- */

export function generateSmartNotification(spaces = [], occupancyStatus = {}) {
  if (!Array.isArray(spaces) || spaces.length === 0) return null;

  const trending = spaces.filter(
    (s) =>
      s &&
      typeof s === "object" &&
      s.traffic >= 65 &&
      occupancyStatus?.[s.id] !== "occupied"
  );

  if (!trending.length) return null;

  const pick = trending[Math.floor(Math.random() * trending.length)];
  if (!pick) return null;

  const { surge } = computeDynamicPrice(pick, occupancyStatus || {});

  return surge
    ? `🔥 Demand for ${pick.name} is surging — price is trending up, consider booking now`
    : `📈 ${pick.name} demand is rising (traffic ${pick.traffic}/100) — consider booking now`;
}

/* ---------------- EXISTING CODE (UNCHANGED SAFE) ---------------- */

export const REQUIRED_LICENSES = {
  retail: ["Tenant License", "Space License", "Business Operation Permit", "Parking Access License"],
  food: ["Tenant License", "Space License", "Health & Safety Permit", "Food Handling Permit", "Parking Access License"],
  kiosk: ["Tenant License", "Space License", "Business Operation Permit", "Parking Access License"],
  showroom: ["Tenant License", "Space License", "Business Operation Permit", "Fire Safety Certificate", "Parking Access License"],
  parking: ["Parking Access License"],
};

export function computeMatchScore(space, prefs, behavior) {
  const reasons = [];
  let score = 0;

  if (space?.types?.includes(prefs?.biz)) {
    score += 38;
    reasons.push(`Matches your business type`);
  }

  const budget = prefs?.budget || 2500;
  const priceFit = 1 - Math.min(1, Math.abs(space.price - budget) / Math.max(budget, 500));
  score += priceFit * 28;

  score += (space?.traffic || 0) / 100 * 12;

  return { score: Math.round(score), reasons };
}

export function computeDynamicPrice(space, occupancyStatus = {}) {
  const status = occupancyStatus?.[space?.id] || "available";
  const hour = new Date().getHours();
  const peak = hour >= 11 && hour <= 20;

  let multiplier = 1;
  if (space?.traffic >= 80) multiplier += 0.1;
  if (status === "reserved") multiplier += 0.08;
  if (peak) multiplier += 0.05;

  return {
    price: Math.round((space?.price || 0) * multiplier),
    multiplier,
    surge: multiplier > 1.1,
  };
}

export const LICENSE_LABEL = {
  tenant: "Tenant License",
  space: "Space License",
  "parking access": "Parking Access License",
};
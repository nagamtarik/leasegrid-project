import { ShoppingBag, Coffee, Boxes, Building2 } from "lucide-react";

// "Permit & Blueprint" design system — shared color tokens
export const T = {
  ink: "#0B1220",
  panel: "#0F1B32",
  panel2: "#12213D",
  line: "#2A3B5C",
  lineSoft: "#1A2740",
  paper: "#EDEAE2",
  paperDim: "#DCD7C9",
  amber: "#E8A33D",
  amberDim: "#8A5F22",
  signal: "#4FD1C5",
  signalDim: "#1F5C55",
  danger: "#E0574C",
  ash: "#9AA7C2",
};


// Business types offered across the platform
export const BIZ_TYPES = [
  { id: "retail", label: "Retail", icon: ShoppingBag },
  { id: "food", label: "Food & Beverage", icon: Coffee },
  { id: "kiosk", label: "Kiosk / Service", icon: Boxes },
  { id: "showroom", label: "Showroom", icon: Building2 },
];


// Mock space inventory (seed data for the demo)
export const INITIAL_SPACES = [
  { id: "BLV-04", name: "Boulevard Kiosk 04", zone: "Boulevard", pin: { x: 22, y: 30 },
    dims: { w: 4, l: 3, h: 3 }, price: 1200, types: ["retail", "kiosk", "food"], traffic: 82,
    desc: "Corner-facing kiosk on the main boulevard promenade, high foot traffic from transit exits." },
  { id: "RTP-02", name: "Riverside Retail Bay 2", zone: "Retail Plaza", pin: { x: 62, y: 52 },
    dims: { w: 8, l: 6, h: 3.5 }, price: 3400, types: ["retail", "showroom"], traffic: 65,
    desc: "Glass-fronted bay in the covered retail plaza, ideal for a flagship storefront." },
  { id: "PKD-12", name: "Parking Deck Stall P-12", zone: "Parking", pin: { x: 40, y: 78 },
    dims: { w: 5, l: 2.5, h: 2 }, price: 180, types: ["parking"], traffic: 20,
    desc: "Covered stall, level 1, adjacent to the main vehicle ramp." },
  { id: "FDC-03", name: "Food Court Unit F3", zone: "Food Court", pin: { x: 78, y: 24 },
    dims: { w: 6, l: 5, h: 3 }, price: 2600, types: ["food"], traffic: 91,
    desc: "Central food court stall with shared seating access, peak lunch traffic." },
  { id: "BLV-09", name: "Boulevard Corner Unit 09", zone: "Boulevard", pin: { x: 30, y: 16 },
    dims: { w: 10, l: 7, h: 4 }, price: 5200, types: ["retail", "showroom", "food"], traffic: 88,
    desc: "Flagship corner double-frontage unit at the boulevard's busiest intersection." },
  { id: "TPB-01", name: "Transit Plaza Booth B1", zone: "Transit Plaza", pin: { x: 55, y: 12 },
    dims: { w: 3, l: 3, h: 2.8 }, price: 950, types: ["kiosk", "food"], traffic: 74,
    desc: "Small-format booth outside the transit concourse, strong commuter footfall." },
  { id: "RFT-01", name: "Rooftop Terrace Lease T1", zone: "Rooftop", pin: { x: 85, y: 65 },
    dims: { w: 15, l: 10, h: 3 }, price: 4800, types: ["food", "showroom"], traffic: 58,
    desc: "Open-air rooftop terrace, popular for dining concepts and evening events." },
  { id: "PKD-27", name: "Parking Deck Stall P-27", zone: "Parking", pin: { x: 46, y: 86 },
    dims: { w: 5, l: 2.5, h: 2 }, price: 180, types: ["parking"], traffic: 20,
    desc: "Covered stall, level 2, near the elevator lobby." },
];


export const ZONE_COLOR = {
  Boulevard: T.amber, "Retail Plaza": T.signal, Parking: T.ash,
  "Food Court": "#E0574C", "Transit Plaza": "#8A7FE8", Rooftop: "#4FD1C5",
};


// Digital Twin occupancy colors — green = available, red = occupied, yellow = reserved
// Digital Twin occupancy colors — green = available, red = occupied, yellow = reserved
export const STATUS_COLOR = { available: "#3DDC84", occupied: T.danger, reserved: "#E8C93D" };


export function uid(prefix) {
  return prefix + "-" + Math.random().toString(36).slice(2, 8).toUpperCase();
}


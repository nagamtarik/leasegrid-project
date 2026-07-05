# LeaseGrid — Smart Leasing Platform (Prototype)

An AI-powered smart leasing platform: browse zones on a blueprint-style map, preview
spaces in an interactive 3D viewer, get AI-matched recommendations with explainable
reasoning, lease through a digital contract + escrow payment flow, receive a Tenant
License, Space License, and Parking Access License, and simulate automatic LPR/QR
gate entry — plus an admin console with predictive analytics.

> **The system doesn't just rent spaces — it controls the full lifecycle including
> access, permissions, and operational validation.**

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (default `http://localhost:5173`).

```bash
npm run build     # production build to dist/
npm run preview   # preview the production build
```

## Project structure

```
src/
  lib/
    theme.js        # design tokens (colors), business types, mock space inventory, uid()
    aiEngine.js      # scoring, reasoning, licensing rules, dynamic pricing, forecasting
  components/
    Space3D.jsx      # Three.js interactive 3D space viewer (drag to rotate, shop-setup sim)
    Primitives.jsx   # Pill, StatCard, Toast, Field, MiniStat, TinyMetric, QR code,
                      # lifecycle stepper, system-statement banner
    NavBar.jsx        # top nav + mobile nav
    AuthScreen.jsx    # sign up / log in
  views/
    ExploreView.jsx        # district map + list, digital-twin occupancy colors, AI tags
    SpaceDetailView.jsx    # 3D viewer, dynamic price, lease CTA
    AIAgentView.jsx        # guided form + natural-language chat agent (recommendations)
    LeaseFlowView.jsx      # contract generation, e-signature, escrow payment, invoice
    LicensesView.jsx       # Tenant / Space / Parking Access licenses, compliance checklist
    SmartAccessView.jsx    # LPR + QR-fallback gate simulation, access event log
    AdminView.jsx           # space management, occupancy/revenue, predictive analytics
  App.jsx            # root component — state, routing between views
  main.jsx           # React entry point
  index.css          # Tailwind + fonts + shared utility classes
```

This mirrors the module boundaries the app was designed with — each file owns one
concern, and `lib/aiEngine.js` is the single source of truth for scoring so the
guided form, the chat agent, the map tags, and the admin forecasts never disagree.

## Feature map: what's real vs. simulated

This is a working front-end prototype. Everything listed as "real" runs actual logic
in the browser; everything listed as "simulated" is a clearly-scoped mock standing in
for a system that would need real infrastructure in production.

| Area | What's real | What's simulated |
|---|---|---|
| 3D viewer | Actual Three.js scene built from each space's real dimensions; drag-to-rotate; furniture toggle | — |
| AI Agent | Real scoring function (`computeMatchScore`) with weighted business-type/budget/zone/traffic/behavior factors and generated reasons; chat agent parses free text with regex/keyword matching | Not an LLM call — see "Next steps" below |
| Recommendation tags / dynamic pricing | Real, deterministic functions computed from live data | — |
| Digital twin (map colors) | Real rendering driven by state | Occupancy status itself cycles on a 5s timer, not real sensors |
| Licensing | Real generation, compliance-gap detection (`getMissingLicenses`), status lifecycle | No persistence — licenses live only in React state |
| Parking Access License / Smart Access | Real registry-lookup logic (LPR plate match + QR fallback validate against license status) | No camera, no physical gate, no persisted database |
| Payments / escrow | Real state machine modeling the steps (submit → hold → release) | No payment processor is called; nothing moves real money |
| Auth | Functional sign up / login flow | No backend, no password hashing, nothing persisted between sessions |
| Admin predictive analytics | Real chart rendering from computed projections | The forecast/peak-time models are simple mock formulas, not trained models |

## Suggested next steps for production

- **Auth + persistence**: a real identity provider (Auth0/Cognito) and a database
  (Postgres) for users, leases, and licenses.
- **Payments/escrow**: a licensed payment processor with real escrow capability
  (Stripe Connect, Escrow.com, or a trust-account partner) — this has real legal
  requirements that vary by jurisdiction.
- **E-signature**: a provider like DocuSign or HelloSign for enforceability.
- **LPR hardware**: a real camera + recognition service (e.g. OpenALPR) integrated
  with a physical gate controller, replacing the in-memory `parkingRegistry`.
- **AI Agent**: the chat parser could be swapped for a real Claude API call behind
  the same `parseIntent`-style interface, without touching the UI layer.
- **Cloud storage**: S3 (or similar) for 3D models and space photography.
- **Real QR codes**: a proper QR-encoding library tied to a server-side verification
  endpoint, replacing the illustrative pseudo-random pattern in `QRPlaceholder`.

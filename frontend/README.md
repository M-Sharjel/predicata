# PREDICTA – Frontend (GUI prototype)

AI Infrastructure Intelligence · Final Year Project

> **Phase 1: GUI only.** Everything is driven by clearly labelled **mock data**.
> There is no backend, ML model, Prometheus, or Kubernetes connection yet.

## Run

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build
npm run preview    # serve the production build
```

Use **"Continue with demo account"** on the login page (authentication is mocked).

## Stack
Vite · React 18 · TypeScript · React Router 6 · Recharts · lucide-react. Plain CSS design system with CSS variables (light/dark).

## Structure
```
src/
  components/   Badges, Cards (KPI/Stat/Timeline), Charts, DataTable, Inputs, Overlays (Modal/Drawer/Dropdown/Toast/Confirm), States
  layouts/      AppLayout (sidebar, mobile drawer, bottom nav), nav config
  pages/        one file per route
  routes/       route table + mock auth guard
  data/         centralised mock data (mockDashboard, mockPredictions, mockIncidents, mockRecovery, mockExperiments, mockMetrics, ...)
  services/     dashboard/prediction/incident/recovery/experiment/metrics services (return mock data via a delayed promise)
  hooks/        useAsync (loading/error/reload), usePagination, useMedia
  types/        shared TypeScript types (mirror future API schemas)
  utils/        formatting, seeded random series, theme/session context
  styles/       global.css (design tokens + responsive rules)
```

## Connecting FastAPI later
Pages only call `src/services/*`. Replace the `mock(...)` calls with `fetch('/api/v1/...')`; types in `src/types` are the contract.

## Routes
`/login` `/dashboard` `/infrastructure` `/predictions` `/predictions/:id` `/incidents` `/incidents/:id` `/recovery` `/recovery/:id` `/experiments` `/experiments/:id` `/metrics` `/settings` `/help` `/notifications` `/profile`

## Responsive breakpoints
| Width | Behaviour |
|---|---|
| ≥ 1280 | Persistent sidebar, 4-column KPIs, 2:1 main grid |
| 1024–1279 | Sidebar kept, KPIs 2-up, main grid stacks |
| 768–1023 | Sidebar becomes a slide-in drawer (hamburger), tables remain tables |
| < 768 | Bottom navigation (+ "More" drawer), tables become stacked cards, modals become bottom sheets |
| ≤ 400 | Tighter gutters, single-column key/value lists |

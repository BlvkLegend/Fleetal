# Fleetal — Logistics Operations Platform

A portfolio-quality logistics SaaS dashboard built to demonstrate advanced React, Tailwind CSS, and frontend architecture skills. Designed to feel like a product someone would actually pay for.

**Live demo:** `https://yourusername.github.io/trackflow/`

---

## Stack

| Layer | Library |
|---|---|
| Framework | React 19 + Vite 8 |
| Routing | React Router v7 |
| Server state | TanStack Query v5 |
| Global state | Zustand v5 (persisted) |
| Charts | Recharts |
| Styling | Tailwind CSS v3 (teal + warm gray palette) |
| Storage | localStorage (no backend) |
| Icons | Lucide React |

---

## Modules

| Page | Features |
|---|---|
| Dashboard | Live KPIs, area chart, status donut, activity feed, mini bar chart, role-scoped view |
| Deliveries | Full CRUD, search, status/priority filters, sorting, pagination, detail modal, role guards |
| Drivers | CRUD with confirm dialogs, on-time progress bars, rating stars, status chips, zone filtering |
| Fleet | Fuel gauges, service due countdown, inline status updater, summary health chips |
| Customers | Tier segmentation tiles, spend tracking, full CRUD, confirm dialogs |
| Analytics | Revenue bar chart, volume/on-time line chart, zone performance, 14-day trend area chart |
| Settings | Dark mode, role simulator (4 roles), workspace mode toggle, data reset/clear |

---

## Key Features

**Role-based access isolation**
- Admin: full CRUD everywhere
- Dispatcher: create and edit, no delete
- Driver: scoped to own deliveries only — can't access Drivers, Fleet, Customers, or Analytics
- Viewer: read-only throughout

**Workspace mode toggle**
Banner on the dashboard lets you switch between seeded demo data and an empty workspace instantly.

**Command palette** (`Cmd/Ctrl + K`) for keyboard navigation.

**Responsive layout** — mobile sidebar slides in as an overlay; modals become bottom sheets on small screens; tables scroll horizontally.

**Dark mode** — full Tailwind `class`-strategy dark mode with a persisted preference.

**Skeleton loading** — shimmer skeletons on first load, no blank flashes.

**Toast notifications** with progress bar auto-dismiss.

**Confirm dialogs** before all destructive actions.

---

## Project Structure

```
src/
  components/
    layout/     AppLayout (Outlet), Sidebar (responsive), Topbar
    ui/         primitives, Table+Pagination, Modal+Field+ConfirmDialog,
                Dropdown, Toast, CommandPalette
  data/
    seed.js     Generates drivers, vehicles, customers, deliveries,
                activities, analytics — all seeded to localStorage
  hooks/
    index.js    useNotify, useTableState, useModal, useConfirm,
                useDebounce, useKeyPress
  lib/
    utils.js    cn(), fmtCurrency(), fmtRelTime(), STATUS_CONFIG, paginate()
  pages/
    Dashboard, Deliveries, Drivers, Fleet, Customers,
    Analytics, Settings, WorkspaceBanner
  services/
    index.js    deliveryService, driverService, vehicleService,
                customerService, analyticsService, statsService
                — all async with simulated latency and role-aware filtering
  store/
    ui.js       Zustand: theme, role, sidebarOpen, notifications,
                commandOpen, workspaceMode
```

---

## Running locally

```bash
npm install
npm run dev
```

## Deploy to GitHub Pages

1. Create a repo named `trackflow` on GitHub
2. Push everything including `.github/`
3. Go to **Settings > Pages > Source: GitHub Actions**
4. Push to `main` — workflow deploys automatically

> If your repo has a different name, update `base` in `vite.config.js` and `basename` in `App.jsx`.

---

Built by **Aloba Iyunadeoluwa** — Frontend Developer & UI/UX Designer

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Deliveries } from './pages/Deliveries';
import { Drivers } from './pages/Drivers';
import { Fleet } from './pages/Fleet';
import { Customers } from './pages/Customers';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { seedStorage } from './data/seed';
import { useUIStore } from './store/ui';

// Seed on first load if in seeded mode
const { workspaceMode } = useUIStore.getState();
if (workspaceMode === 'seeded' || workspaceMode === undefined) {
  seedStorage();
}

const qc = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter basename="/trackflow">
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="deliveries" element={<Deliveries />} />
            <Route path="drivers"    element={<Drivers />} />
            <Route path="fleet"      element={<Fleet />} />
            <Route path="customers"  element={<Customers />} />
            <Route path="analytics"  element={<Analytics />} />
            <Route path="settings"   element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

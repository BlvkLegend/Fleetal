import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Simulated current driver session — in a real app this would come from auth
// DRV-003 = Bola Fashola (to demo driver-scoped view)
export const DRIVER_SESSION = { driverId: 'DRV-003', driverName: 'Bola Fashola' };

export const useUIStore = create(
  persist(
    (set, get) => ({
      theme: 'light',
      sidebarOpen: false,       // mobile sidebar
      notifications: [],
      commandOpen: false,
      role: 'admin',            // admin | dispatcher | driver | viewer
      workspaceMode: 'seeded',  // 'seeded' | 'empty'

      toggleTheme: () => {
        const next = get().theme === 'light' ? 'dark' : 'light';
        set({ theme: next });
        document.documentElement.classList.toggle('dark', next === 'dark');
      },
      setSidebarOpen: (v) => set({ sidebarOpen: v }),
      toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
      setCommandOpen: (v) => set({ commandOpen: v }),
      setRole: (role) => set({ role }),
      setWorkspaceMode: (mode) => set({ workspaceMode: mode }),

      addNotification: (notif) =>
        set(s => ({
          notifications: [
            { ...notif, id: Date.now(), read: false, ts: new Date().toISOString() },
            ...s.notifications,
          ].slice(0, 30),
        })),
      markAllRead: () =>
        set(s => ({ notifications: s.notifications.map(n => ({ ...n, read: true })) })),
      dismissNotification: (id) =>
        set(s => ({ notifications: s.notifications.filter(n => n.id !== id) })),
    }),
    {
      name: 'fleetal-ui',
      partialize: (s) => ({ theme: s.theme, role: s.role, workspaceMode: s.workspaceMode }),
    }
  )
);

// Apply persisted theme immediately on load
const { theme } = useUIStore.getState();
document.documentElement.classList.toggle('dark', theme === 'dark');

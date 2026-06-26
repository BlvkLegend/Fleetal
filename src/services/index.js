// Fleetal services layer — localStorage CRUD with role-aware filtering

function delay(ms = 100) { return new Promise(r => setTimeout(r, ms)); }

function getStore(key) {
  try { return JSON.parse(localStorage.getItem(`fleetal_${key}`)) || []; }
  catch { return []; }
}
function setStore(key, data) {
  localStorage.setItem(`fleetal_${key}`, JSON.stringify(data));
}

// ─── Deliveries ────────────────────────────────────────────────────────────
export const deliveryService = {
  async getAll(filters = {}) {
    await delay();
    let items = getStore('deliveries');

    // ROLE ISOLATION: driver role only sees own deliveries
    if (filters.driverId) {
      items = items.filter(d => d.driverId === filters.driverId);
    }
    if (filters.status)   items = items.filter(d => d.status === filters.status);
    if (filters.priority) items = items.filter(d => d.priority === filters.priority);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(d =>
        d.id.toLowerCase().includes(q) ||
        d.customerName.toLowerCase().includes(q) ||
        d.driverName.toLowerCase().includes(q) ||
        d.trackingNumber.toLowerCase().includes(q)
      );
    }
    if (filters.sort) {
      const [field, dir] = filters.sort.split(':');
      items = [...items].sort((a, b) => {
        const av = a[field] ?? ''; const bv = b[field] ?? '';
        return dir === 'desc' ? (bv > av ? 1 : -1) : (av > bv ? 1 : -1);
      });
    }
    return items;
  },

  async getById(id) {
    await delay(60);
    return getStore('deliveries').find(d => d.id === id) || null;
  },

  async create(data) {
    await delay(180);
    const items = getStore('deliveries');
    const newItem = {
      ...data,
      id: `DEL-${String(items.length + 1).padStart(4, '0')}`,
      trackingNumber: `FL${Math.floor(Math.random() * 9000000 + 1000000)}`,
      createdAt: new Date().toISOString(),
    };
    setStore('deliveries', [newItem, ...items]);
    return newItem;
  },

  async update(id, data) {
    await delay(140);
    const items = getStore('deliveries').map(d => d.id === id ? { ...d, ...data } : d);
    setStore('deliveries', items);
    return items.find(d => d.id === id);
  },

  async delete(id) {
    await delay(100);
    setStore('deliveries', getStore('deliveries').filter(d => d.id !== id));
  },
};

// ─── Drivers ────────────────────────────────────────────────────────────────
export const driverService = {
  async getAll(filters = {}) {
    await delay();
    let items = getStore('drivers');
    if (filters.status) items = items.filter(d => d.status === filters.status);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q) ||
        d.zone.toLowerCase().includes(q)
      );
    }
    return items;
  },

  async getById(id) {
    await delay(60);
    return getStore('drivers').find(d => d.id === id) || null;
  },

  async create(data) {
    await delay(180);
    const items = getStore('drivers');
    const newItem = {
      ...data,
      id: `DRV-${String(items.length + 1).padStart(3, '0')}`,
      joinDate: new Date().toISOString().slice(0, 10),
      deliveries: 0,
      rating: 5.0,
      onTime: 100,
    };
    setStore('drivers', [...items, newItem]);
    return newItem;
  },

  async update(id, data) {
    await delay(140);
    const items = getStore('drivers').map(d => d.id === id ? { ...d, ...data } : d);
    setStore('drivers', items);
    return items.find(d => d.id === id);
  },

  async delete(id) {
    await delay(100);
    setStore('drivers', getStore('drivers').filter(d => d.id !== id));
  },
};

// ─── Vehicles ────────────────────────────────────────────────────────────────
export const vehicleService = {
  async getAll(filters = {}) {
    await delay();
    let items = getStore('vehicles');
    if (filters.status) items = items.filter(v => v.status === filters.status);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(v =>
        v.plate.toLowerCase().includes(q) ||
        v.make.toLowerCase().includes(q) ||
        v.type.toLowerCase().includes(q)
      );
    }
    return items;
  },

  async update(id, data) {
    await delay(140);
    const items = getStore('vehicles').map(v => v.id === id ? { ...v, ...data } : v);
    setStore('vehicles', items);
    return items.find(v => v.id === id);
  },
};

// ─── Customers ───────────────────────────────────────────────────────────────
export const customerService = {
  async getAll(filters = {}) {
    await delay();
    let items = getStore('customers');
    if (filters.tier)   items = items.filter(c => c.tier === filters.tier);
    if (filters.status) items = items.filter(c => c.status === filters.status);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(c =>
        c.company.toLowerCase().includes(q) ||
        c.contact.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
      );
    }
    if (filters.sort) {
      const [field, dir] = filters.sort.split(':');
      items = [...items].sort((a, b) => {
        const av = a[field] ?? ''; const bv = b[field] ?? '';
        return dir === 'desc' ? (bv > av ? 1 : -1) : (av > bv ? 1 : -1);
      });
    }
    return items;
  },

  async create(data) {
    await delay(180);
    const items = getStore('customers');
    const newItem = {
      ...data,
      id: `CST-${String(items.length + 1).padStart(3, '0')}`,
      joinDate: new Date().toISOString().slice(0, 10),
      totalShipments: 0,
      totalSpend: 0,
      activeContracts: 0,
      rating: 5.0,
    };
    setStore('customers', [...items, newItem]);
    return newItem;
  },

  async update(id, data) {
    await delay(140);
    const items = getStore('customers').map(c => c.id === id ? { ...c, ...data } : c);
    setStore('customers', items);
    return items.find(c => c.id === id);
  },

  async delete(id) {
    await delay(100);
    setStore('customers', getStore('customers').filter(c => c.id !== id));
  },
};

// ─── Analytics ───────────────────────────────────────────────────────────────
export const analyticsService = {
  async get() {
    await delay(160);
    return getStore('analytics') || {};
  },
};

// ─── Activities ──────────────────────────────────────────────────────────────
export const activityService = {
  async getAll(filters = {}) {
    await delay(80);
    let items = getStore('activities');
    // Driver role: only their own activity
    if (filters.driverId) {
      items = items.filter(a => a.driverId === filters.driverId);
    }
    return items;
  },

  async add(item) {
    const items = getStore('activities');
    const newItem = { ...item, id: `ACT-${Date.now()}`, timestamp: new Date().toISOString() };
    setStore('activities', [newItem, ...items.slice(0, 49)]);
    return newItem;
  },
};

// ─── Dashboard stats ─────────────────────────────────────────────────────────
export const statsService = {
  async get(filters = {}) {
    await delay(80);
    let deliveries = getStore('deliveries');
    const drivers  = getStore('drivers');
    const vehicles = getStore('vehicles');
    const customers= getStore('customers');

    // Driver role: only their deliveries
    if (filters.driverId) {
      deliveries = deliveries.filter(d => d.driverId === filters.driverId);
    }

    const today = new Date().toDateString();
    return {
      totalDeliveries:  deliveries.length,
      todayDeliveries:  deliveries.filter(d => new Date(d.createdAt).toDateString() === today).length,
      inTransit:        deliveries.filter(d => d.status === 'in-transit').length,
      delivered:        deliveries.filter(d => d.status === 'delivered').length,
      pending:          deliveries.filter(d => d.status === 'pending').length,
      failed:           deliveries.filter(d => d.status === 'failed').length,
      activeDrivers:    drivers.filter(d => d.status === 'active').length,
      totalDrivers:     drivers.length,
      activeVehicles:   vehicles.filter(v => v.status === 'active').length,
      totalVehicles:    vehicles.length,
      totalCustomers:   customers.length,
      activeCustomers:  customers.filter(c => c.status === 'active').length,
      revenue:          deliveries.filter(d => d.status === 'delivered').reduce((s, d) => s + (d.value * 0.08), 0),
      onTimeRate:       91.4,
    };
  },
};

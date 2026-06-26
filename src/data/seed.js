import { format, subDays, addDays, subHours } from 'date-fns';

const NAMES = [
  'Emeka Okafor','Chioma Adeyemi','Bola Fashola','Ngozi Eze','Kunle Adesanya',
  'Amaka Obi','Tunde Bakare','Funke Okonkwo','Segun Adeleke','Yetunde Bello',
  'Femi Alade','Uju Nwosu','Dapo Martins','Kemi Ojo','Ola Adewale',
];
const COMPANIES = [
  'Dangote Group','MTN Nigeria','Zenith Bank','Access Bank','First Bank',
  'Lafarge Africa','Nestle Nigeria','Unilever Nigeria','Nigerian Breweries','Julius Berger',
  'Total Energies','Airtel Nigeria','Seplat Energy','Conoil','PZ Cussons',
  'Guinness Nigeria','Flour Mills','BUA Cement','Coronation Insurance','Stanbic IBTC',
];
const STREETS = ['Marina','Broad Street','Ozumba Mbadiwe','Admiralty Way','Adeola Odeku','Akin Adesola','Saka Tinubu','Campbell Street'];
const ZONES   = ['Lagos Island','Victoria Island','Lekki','Ikeja','Surulere','Apapa','Yaba','Ikorodu','Oshodi','Maryland','Gbagada','Festac'];
const VTYPES  = ['Box Truck','Refrigerated Van','Flatbed Truck','Mini Van','Pickup Truck'];
const MAKES   = ['Mercedes-Benz','Isuzu','MAN','Scania','DAF','Volvo','Toyota','Ford'];
const STATUSES = ['delivered','delivered','delivered','in-transit','in-transit','pending','failed','returned'];

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function rn(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function seeded(n, base = 42) {
  // Simple deterministic-ish value so regeneration is consistent
  return ((n * 1664525 + base) & 0x7fffffff) % 100;
}

export function generateDrivers() {
  return NAMES.map((name, i) => ({
    id: `DRV-${String(i + 1).padStart(3, '0')}`,
    name,
    avatar: null,
    phone: `+234 80${rn(10,99)} ${rn(100,999)} ${rn(1000,9999)}`,
    email: `${name.split(' ')[0].toLowerCase()}@fleetal.ng`,
    status: i < 11 ? 'active' : i < 13 ? 'on-leave' : 'inactive',
    rating: +(3.5 + (seeded(i, 7) / 100) * 1.5).toFixed(1),
    deliveries: rn(120, 890),
    onTime: rn(82, 99),
    license: `LAG-${rn(1000000,9999999)}`,
    licenseExpiry: format(addDays(new Date(), rn(30, 730)), 'yyyy-MM-dd'),
    vehicleId: `VEH-${String(i + 1).padStart(3, '0')}`,
    joinDate: format(subDays(new Date(), rn(180, 1460)), 'yyyy-MM-dd'),
    zone: ZONES[i % ZONES.length],
  }));
}

export function generateVehicles() {
  return Array.from({ length: 15 }, (_, i) => ({
    id: `VEH-${String(i + 1).padStart(3, '0')}`,
    plate: `LAG-${rn(100,999)}-${String.fromCharCode(65 + i)}${String.fromCharCode(65 + rn(0,25))}`,
    make: MAKES[i % MAKES.length],
    type: VTYPES[i % VTYPES.length],
    year: rn(2017, 2023),
    status: i < 10 ? 'active' : i < 13 ? 'maintenance' : 'inactive',
    driverId: `DRV-${String(i + 1).padStart(3, '0')}`,
    mileage: rn(12000, 180000),
    capacity: [1000, 2000, 3500, 5000, 8000][i % 5],
    fuelLevel: rn(15, 95),
    lastService: format(subDays(new Date(), rn(10, 120)), 'yyyy-MM-dd'),
    nextService: format(addDays(new Date(), rn(10, 90)), 'yyyy-MM-dd'),
    insurance: format(addDays(new Date(), rn(30, 365)), 'yyyy-MM-dd'),
  }));
}

export function generateCustomers() {
  return COMPANIES.map((company, i) => ({
    id: `CST-${String(i + 1).padStart(3, '0')}`,
    company,
    contact: NAMES[i % NAMES.length],
    email: `logistics@${company.toLowerCase().replace(/[\s']/g, '-').replace(/[^a-z0-9-]/g, '')}.ng`,
    phone: `+234 70${rn(10,99)} ${rn(100,999)} ${rn(1000,9999)}`,
    address: `${rn(1,200)} ${rand(STREETS)}, ${ZONES[i % ZONES.length]}, Lagos`,
    tier: i < 5 ? 'enterprise' : i < 13 ? 'business' : 'starter',
    totalShipments: rn(45, 890),
    totalSpend: rn(800000, 18000000),
    activeContracts: rn(1, 6),
    status: i < 17 ? 'active' : 'inactive',
    joinDate: format(subDays(new Date(), rn(90, 900)), 'yyyy-MM-dd'),
    rating: +(3.8 + (seeded(i, 13) / 100) * 1.2).toFixed(1),
  }));
}

export function generateDeliveries(customers, drivers) {
  // Each driver gets roughly 4 deliveries for realistic scoping
  return Array.from({ length: 60 }, (_, i) => {
    const driverIdx = i % drivers.length;
    const driver = drivers[driverIdx];
    const customer = customers[i % customers.length];
    const status = i < 8 ? 'in-transit' : STATUSES[i % STATUSES.length];
    const created = subDays(new Date(), rn(0, 30));
    const scheduled = addDays(created, rn(1, 3));
    return {
      id: `DEL-${String(i + 1).padStart(4, '0')}`,
      trackingNumber: `FL${rn(1000000,9999999)}`,
      customerId: customer.id,
      customerName: customer.company,
      driverId: driver.id,        // explicit link for role isolation
      driverName: driver.name,
      origin: `${rn(1,200)} ${rand(STREETS)}, Lagos Island`,
      destination: `${rn(1,200)} ${rand(STREETS)}, ${rand(ZONES)}, Lagos`,
      status,
      priority: ['high','normal','normal','normal','low'][i % 5],
      weight: [120,245,380,56,870,1200,450,93,630,780][i % 10],
      value: rn(50000, 2500000),
      scheduledDate: format(scheduled, 'yyyy-MM-dd'),
      createdAt: format(created, "yyyy-MM-dd'T'HH:mm:ss"),
      deliveredAt: status === 'delivered' ? format(addDays(scheduled, rn(-1,1)), "yyyy-MM-dd'T'HH:mm:ss") : null,
      distance: rn(8, 120),
      notes: '',
      signature: status === 'delivered',
    };
  });
}

export function generateActivities(deliveries, drivers) {
  const types = ['delivery_created','delivery_completed','driver_assigned','status_update','vehicle_alert','customer_added'];
  return Array.from({ length: 50 }, (_, i) => {
    const type = types[i % types.length];
    const delivery = deliveries[i % deliveries.length];
    const driver = drivers[i % drivers.length];
    const titles = {
      delivery_created:   'New delivery created',
      delivery_completed: 'Delivery completed',
      driver_assigned:    'Driver assigned',
      status_update:      'Status updated',
      vehicle_alert:      'Vehicle alert',
      customer_added:     'New customer onboarded',
    };
    const descs = {
      delivery_created:   `${delivery.id} booked for ${delivery.customerName}`,
      delivery_completed: `${delivery.id} delivered to ${delivery.destination.split(',')[0]}`,
      driver_assigned:    `${driver.name} assigned to ${delivery.id}`,
      status_update:      `${delivery.id} marked as ${delivery.status}`,
      vehicle_alert:      `Low fuel warning on ${driver.vehicleId}`,
      customer_added:     `${COMPANIES[i % COMPANIES.length]} onboarded`,
    };
    return {
      id: `ACT-${i}`,
      type,
      driverId: delivery.driverId,  // for driver-scoped filtering
      title: titles[type],
      description: descs[type],
      timestamp: subHours(new Date(), i * 0.6 + Math.random()).toISOString(),
    };
  });
}

export function generateAnalytics() {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const current = new Date().getMonth();
  return {
    monthly: months.slice(0, current + 1).map((month, i) => ({
      month,
      deliveries: rn(180, 520),
      revenue: rn(3200000, 9800000),
      onTime: rn(82, 97),
      failed: rn(3, 18),
    })),
    zonePerf: ZONES.slice(0, 8).map(zone => ({
      zone,
      deliveries: rn(40, 200),
      avgDays: +(1.2 + Math.random() * 2.8).toFixed(1),
    })),
    statusDist: [
      { name: 'Delivered',  value: 68, color: '#10b981' },
      { name: 'In Transit', value: 14, color: '#14b8a6' },
      { name: 'Pending',    value: 10, color: '#f59e0b' },
      { name: 'Failed',     value: 5,  color: '#ef4444' },
      { name: 'Returned',   value: 3,  color: '#a8a29e' },
    ],
    weeklyTrend: Array.from({ length: 14 }, (_, i) => ({
      day: format(subDays(new Date(), 13 - i), 'MMM d'),
      deliveries: rn(20, 80),
      revenue: rn(400000, 1200000),
    })),
  };
}

export function seedStorage() {
  const existing = localStorage.getItem('fleetal_seeded');
  if (existing) {
    return {
      drivers:    JSON.parse(localStorage.getItem('fleetal_drivers') || '[]'),
      vehicles:   JSON.parse(localStorage.getItem('fleetal_vehicles') || '[]'),
      customers:  JSON.parse(localStorage.getItem('fleetal_customers') || '[]'),
      deliveries: JSON.parse(localStorage.getItem('fleetal_deliveries') || '[]'),
      activities: JSON.parse(localStorage.getItem('fleetal_activities') || '[]'),
      analytics:  JSON.parse(localStorage.getItem('fleetal_analytics') || '{}'),
    };
  }
  const drivers    = generateDrivers();
  const vehicles   = generateVehicles();
  const customers  = generateCustomers();
  const deliveries = generateDeliveries(customers, drivers);
  const activities = generateActivities(deliveries, drivers);
  const analytics  = generateAnalytics();

  localStorage.setItem('fleetal_drivers',    JSON.stringify(drivers));
  localStorage.setItem('fleetal_vehicles',   JSON.stringify(vehicles));
  localStorage.setItem('fleetal_customers',  JSON.stringify(customers));
  localStorage.setItem('fleetal_deliveries', JSON.stringify(deliveries));
  localStorage.setItem('fleetal_activities', JSON.stringify(activities));
  localStorage.setItem('fleetal_analytics',  JSON.stringify(analytics));
  localStorage.setItem('fleetal_seeded', '1');

  return { drivers, vehicles, customers, deliveries, activities, analytics };
}

export function clearStorage() {
  ['drivers','vehicles','customers','deliveries','activities','analytics','seeded']
    .forEach(k => localStorage.removeItem(`fleetal_${k}`));
}

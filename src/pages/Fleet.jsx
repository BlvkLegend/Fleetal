import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Truck, AlertTriangle, Fuel } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { vehicleService } from '../services';
import { Table, Pagination } from '../components/ui/Table';
import { Badge, Empty, ProgressBar } from '../components/ui/primitives';
import { Select } from '../components/ui/Modal';
import { useTableState, useNotify } from '../hooks';
import { paginate, cn } from '../lib/utils';

function FuelCell({ level }) {
  const color = level < 25 ? 'red' : level < 50 ? 'amber' : 'teal';
  return (
    <div className="w-24">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-warm-500 dark:text-warm-400 tabular-nums">{level}%</span>
        {level < 25 && <AlertTriangle size={11} className="text-red-500" />}
      </div>
      <ProgressBar value={level} color={color} />
    </div>
  );
}

function ServiceCell({ date }) {
  const days = differenceInDays(parseISO(date), new Date());
  const isOverdue = days < 0;
  const isSoon = days >= 0 && days <= 14;
  return (
    <div>
      <p className={cn('text-xs font-medium tabular-nums',
        isOverdue ? 'text-red-600 dark:text-red-400' :
        isSoon ? 'text-amber-600 dark:text-amber-400' :
        'text-warm-600 dark:text-warm-400'
      )}>
        {format(parseISO(date), 'dd MMM yyyy')}
      </p>
      <p className="text-[10px] text-warm-400 mt-0.5">
        {isOverdue ? `${-days}d overdue` : days === 0 ? 'Today' : `in ${days}d`}
      </p>
    </div>
  );
}

function SummaryChip({ label, value, colorClass }) {
  return (
    <div className={cn('card px-4 py-3 flex items-center gap-3', colorClass)}>
      <span className="text-2xl font-bold">{value}</span>
      <span className="text-sm font-medium opacity-90">{label}</span>
    </div>
  );
}

export function Fleet() {
  const qc = useQueryClient();
  const notify = useNotify();
  const { search, setSearch, sort, handleSort, sortField, sortDir, page, setPage, perPage } = useTableState('plate:asc');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: allVehicles = [], isLoading } = useQuery({
    queryKey: ['vehicles', search, statusFilter],
    queryFn: () => vehicleService.getAll({ search, status: statusFilter || undefined }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => vehicleService.update(id, data),
    onSuccess: () => { qc.invalidateQueries(['vehicles']); notify('success', 'Vehicle updated', 'Status changed.'); },
  });

  const summary = {
    active:      allVehicles.filter(v => v.status === 'active').length,
    maintenance: allVehicles.filter(v => v.status === 'maintenance').length,
    lowFuel:     allVehicles.filter(v => v.fuelLevel < 25).length,
    serviceDue:  allVehicles.filter(v => differenceInDays(parseISO(v.nextService), new Date()) <= 14).length,
  };

  const sorted = [...allVehicles].sort((a, b) => {
    const av = a[sortField] ?? ''; const bv = b[sortField] ?? '';
    return sortDir === 'desc' ? (bv > av ? 1 : -1) : (av > bv ? 1 : -1);
  });
  const { items, total, pages } = paginate(sorted, page, perPage);

  const columns = [
    {
      key: 'plate', label: 'Plate / ID', sortable: true,
      render: (v, row) => (
        <div>
          <p className="font-mono font-bold text-warm-800 dark:text-warm-200 text-sm">{v}</p>
          <p className="text-[10px] text-warm-400 font-mono mt-0.5">{row.id}</p>
        </div>
      ),
    },
    {
      key: 'make', label: 'Vehicle', sortable: true,
      render: (v, row) => (
        <div>
          <p className="text-sm font-medium text-warm-700 dark:text-warm-300">{v} {row.type}</p>
          <p className="text-xs text-warm-400">{row.year}</p>
        </div>
      ),
    },
    { key: 'status', label: 'Status', render: v => <Badge status={v} /> },
    { key: 'mileage', label: 'Mileage', sortable: true,
      render: v => <span className="tabular-nums text-sm">{v?.toLocaleString()} km</span> },
    { key: 'fuelLevel', label: 'Fuel', sortable: true, render: v => <FuelCell level={v} /> },
    { key: 'nextService', label: 'Next service', sortable: true, render: v => <ServiceCell date={v} /> },
    { key: 'capacity', label: 'Capacity',
      render: v => <span className="text-xs text-warm-500">{v?.toLocaleString()} kg</span> },
    {
      key: '_status', label: 'Set status', width: 140,
      render: (_, row) => (
        <Select
          className="w-full text-xs py-1.5"
          value={row.status}
          onChange={e => updateMutation.mutate({ id: row.id, data: { status: e.target.value } })}
        >
          <option value="active">Active</option>
          <option value="maintenance">Maintenance</option>
          <option value="inactive">Inactive</option>
        </Select>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 max-w-[1600px]">
      <div>
        <h2 className="text-base sm:text-lg font-bold text-warm-900 dark:text-warm-100">Fleet Management</h2>
        <p className="text-xs sm:text-sm text-warm-500 mt-0.5">{total} vehicles in registry</p>
      </div>

      {/* Summary chips */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryChip label="Active"       value={summary.active}      colorClass="bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400" />
        <SummaryChip label="Maintenance"  value={summary.maintenance}  colorClass="bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400" />
        <SummaryChip label="Low fuel"     value={summary.lowFuel}     colorClass="bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400" />
        <SummaryChip label="Service due"  value={summary.serviceDue}  colorClass="bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400" />
      </div>

      <div className="card p-3 sm:p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1" style={{ minWidth: 180 }}>
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400" />
          <input className="input pl-8 text-sm" placeholder="Search plate, make, type..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select className="w-36 text-sm" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="maintenance">Maintenance</option>
          <option value="inactive">Inactive</option>
        </Select>
      </div>

      <div className="card overflow-hidden">
        <Table columns={columns} data={items} loading={isLoading} onSort={handleSort} sortField={sortField} sortDir={sortDir} />
        {!isLoading && total === 0 && <Empty icon={Truck} title="No vehicles found" />}
        {!isLoading && total > 0 && <Pagination page={page} pages={pages} total={total} perPage={perPage} onChange={setPage} />}
      </div>
    </div>
  );
}

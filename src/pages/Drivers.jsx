import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Plus, Search, UserCheck, MoreHorizontal, Trash2, Edit, Star, Phone, Mail } from 'lucide-react';
import { driverService } from '../services';
import { Table, Pagination } from '../components/ui/Table';
import { Badge, Spinner, Empty, Avatar, ProgressBar } from '../components/ui/primitives';
import { Modal, Field, Select, ConfirmDialog } from '../components/ui/Modal';
import { Dropdown } from '../components/ui/Dropdown';
import { useTableState, useModal, useNotify, useConfirm } from '../hooks';
import { paginate } from '../lib/utils';
import { useUIStore } from '../store/ui';
import { useState } from 'react';

const ZONES = ['Lagos Island','Victoria Island','Lekki','Ikeja','Surulere','Apapa','Yaba','Ikorodu','Maryland','Gbagada'];

function DriverForm({ initial, onSave, onClose, loading }) {
  const [form, setForm] = useState(
    initial || { name: '', phone: '', email: '', license: '', licenseExpiry: '', status: 'active', zone: ZONES[0] }
  );
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-4">
      <Field label="Full name" required>
        <input className="input" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="e.g. Emeka Okafor" />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Phone number" required>
          <input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} required placeholder="+234 80x xxxx xxxx" />
        </Field>
        <Field label="Email address">
          <input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="driver@fleetal.ng" />
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="License number">
          <input className="input" value={form.license} onChange={e => set('license', e.target.value)} placeholder="LAG-xxxxxxx" />
        </Field>
        <Field label="License expiry">
          <input className="input" type="date" value={form.licenseExpiry} onChange={e => set('licenseExpiry', e.target.value)} />
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Zone">
          <Select value={form.zone} onChange={e => set('zone', e.target.value)}>
            {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
          </Select>
        </Field>
        <Field label="Status">
          <Select value={form.status} onChange={e => set('status', e.target.value)}>
            <option value="active">Active</option>
            <option value="on-leave">On Leave</option>
            <option value="inactive">Inactive</option>
          </Select>
        </Field>
      </div>
      <div className="flex justify-end gap-3 pt-1">
        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading && <Spinner size={13} />}
          {initial ? 'Save changes' : 'Add driver'}
        </button>
      </div>
    </form>
  );
}

export function Drivers() {
  const qc = useQueryClient();
  const notify = useNotify();
  const role = useUIStore(s => s.role);
  const canEdit   = role === 'admin' || role === 'dispatcher';
  const canDelete = role === 'admin';

  const { search, setSearch, sort, handleSort, sortField, sortDir, page, setPage, perPage } = useTableState('name:asc');
  const [statusFilter, setStatusFilter] = useState('');
  const modal = useModal();
  const { open: confirmOpen, message: confirmMsg, confirm, respond } = useConfirm();

  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    if (searchParams.get('new') === '1') { modal.openWith(null); setSearchParams({}); }
  }, []);

  const { data: allDrivers = [], isLoading } = useQuery({
    queryKey: ['drivers', search, statusFilter],
    queryFn: () => driverService.getAll({ search, status: statusFilter || undefined }),
  });

  const createMutation = useMutation({
    mutationFn: driverService.create,
    onSuccess: () => { qc.invalidateQueries(['drivers']); qc.invalidateQueries(['stats']); notify('success', 'Driver added', 'New driver profile created.'); modal.close(); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => driverService.update(id, data),
    onSuccess: () => { qc.invalidateQueries(['drivers']); notify('success', 'Driver updated'); modal.close(); },
  });
  const deleteMutation = useMutation({
    mutationFn: driverService.delete,
    onSuccess: () => { qc.invalidateQueries(['drivers']); qc.invalidateQueries(['stats']); notify('success', 'Removed', 'Driver profile deleted.'); },
  });

  async function handleDelete(id) {
    const yes = await confirm('Remove this driver? Their delivery history will remain.');
    if (yes) deleteMutation.mutate(id);
  }

  const sorted = [...allDrivers].sort((a, b) => {
    const av = a[sortField] ?? ''; const bv = b[sortField] ?? '';
    return sortDir === 'desc' ? (bv > av ? 1 : -1) : (av > bv ? 1 : -1);
  });
  const { items, total, pages } = paginate(sorted, page, perPage);

  const columns = [
    {
      key: 'name', label: 'Driver', sortable: true,
      render: (v, row) => (
        <div className="flex items-center gap-3">
          <Avatar name={v} size={36} />
          <div className="min-w-0">
            <p className="font-semibold text-warm-800 dark:text-warm-200 text-sm leading-snug truncate">{v}</p>
            <p className="text-xs text-warm-400 font-mono">{row.id}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'contact', label: 'Contact',
      render: (_, row) => (
        <div className="space-y-0.5">
          <p className="text-xs text-warm-600 dark:text-warm-400 flex items-center gap-1.5">
            <Phone size={10} className="flex-shrink-0" />{row.phone}
          </p>
          {row.email && (
            <p className="text-xs text-warm-400 flex items-center gap-1.5 truncate max-w-[160px]">
              <Mail size={10} className="flex-shrink-0" />{row.email}
            </p>
          )}
        </div>
      ),
    },
    { key: 'zone', label: 'Zone', sortable: true,
      render: v => <span className="text-xs font-medium text-warm-600 dark:text-warm-400">{v}</span> },
    { key: 'status', label: 'Status', render: v => <Badge status={v} /> },
    {
      key: 'rating', label: 'Rating', sortable: true,
      render: v => (
        <div className="flex items-center gap-1.5">
          <Star size={12} className="text-amber-400 fill-amber-400 flex-shrink-0" />
          <span className="text-sm font-semibold text-warm-800 dark:text-warm-200">{v}</span>
        </div>
      ),
    },
    {
      key: 'onTime', label: 'On-time', sortable: true,
      render: v => (
        <div className="w-24">
          <div className="flex justify-between mb-1">
            <span className="text-xs font-medium text-warm-600 dark:text-warm-400">{v}%</span>
          </div>
          <ProgressBar value={v} color={v >= 90 ? 'teal' : v >= 75 ? 'amber' : 'red'} />
        </div>
      ),
    },
    { key: 'deliveries', label: 'Jobs', sortable: true,
      render: v => <span className="tabular-nums font-semibold text-warm-700 dark:text-warm-300">{v}</span> },
    {
      key: '_actions', label: '', width: 56,
      render: (_, row) => (
        <Dropdown
          align="right"
          width="w-40"
          trigger={
            <button className="p-1.5 rounded-lg hover:bg-warm-100 dark:hover:bg-warm-700 text-warm-400 hover:text-warm-600 transition-colors">
              <MoreHorizontal size={15} />
            </button>
          }
          items={[
            ...(canEdit ? [{ label: 'Edit', icon: Edit, onClick: () => modal.openWith(row) }] : []),
            ...(canDelete ? [{ divider: true }, { label: 'Delete', icon: Trash2, danger: true, onClick: () => handleDelete(row.id) }] : []),
          ].filter(Boolean)}
        />
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 max-w-[1600px]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-warm-900 dark:text-warm-100">Drivers</h2>
          <p className="text-xs sm:text-sm text-warm-500 mt-0.5">{total} registered drivers</p>
        </div>
        {canEdit && (
          <button className="btn-primary text-xs sm:text-sm" onClick={() => modal.openWith(null)}>
            <Plus size={14} />Add driver
          </button>
        )}
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-2">
        {['active','on-leave','inactive'].map(s => {
          const count = allDrivers.filter(d => d.status === s).length;
          return (
            <button
              key={s}
              onClick={() => { setStatusFilter(statusFilter === s ? '' : s); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-teal-600 text-white'
                  : 'bg-warm-100 dark:bg-warm-800 text-warm-600 dark:text-warm-400 hover:bg-warm-200 dark:hover:bg-warm-700'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)} ({count})
            </button>
          );
        })}
      </div>

      <div className="card p-3 sm:p-4">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400" />
          <input
            className="input pl-8 text-sm"
            placeholder="Search by name, ID, or zone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <Table
          columns={columns}
          data={items}
          loading={isLoading}
          onSort={handleSort}
          sortField={sortField}
          sortDir={sortDir}
        />
        {!isLoading && total === 0 && (
          <Empty icon={UserCheck} title="No drivers found" description="Try a different search, or add a new driver." />
        )}
        {!isLoading && total > 0 && (
          <Pagination page={page} pages={pages} total={total} perPage={perPage} onChange={setPage} />
        )}
      </div>

      <Modal open={modal.open} onClose={modal.close} title={modal.data ? 'Edit driver' : 'Add driver'} size="md">
        <DriverForm
          initial={modal.data}
          onSave={form => modal.data ? updateMutation.mutate({ id: modal.data.id, data: form }) : createMutation.mutate(form)}
          onClose={modal.close}
          loading={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        message={confirmMsg}
        onConfirm={() => respond(true)}
        onCancel={() => respond(false)}
      />
    </div>
  );
}

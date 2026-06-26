import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Plus, Search, Users, MoreHorizontal, Trash2, Edit, Building2 } from 'lucide-react';
import { customerService } from '../services';
import { Table, Pagination } from '../components/ui/Table';
import { Badge, Empty } from '../components/ui/primitives';
import { Modal, Field, Select, ConfirmDialog } from '../components/ui/Modal';
import { Dropdown } from '../components/ui/Dropdown';
import { useTableState, useModal, useNotify, useConfirm } from '../hooks';
import { paginate, fmtCurrency, STATUS_CONFIG } from '../lib/utils';
import { useUIStore } from '../store/ui';

const TIERS = ['enterprise','business','starter'];

function CustomerForm({ initial, onSave, onClose, loading }) {
  const [form, setForm] = useState(
    initial || { company: '', contact: '', email: '', phone: '', address: '', tier: 'business', status: 'active' }
  );
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Company name" required>
          <input className="input" value={form.company} onChange={e => set('company', e.target.value)} required placeholder="e.g. Dangote Group" />
        </Field>
        <Field label="Contact person">
          <input className="input" value={form.contact} onChange={e => set('contact', e.target.value)} placeholder="Full name" />
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Email">
          <input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="logistics@company.ng" />
        </Field>
        <Field label="Phone">
          <input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+234 70x..." />
        </Field>
      </div>
      <Field label="Address">
        <input className="input" value={form.address} onChange={e => set('address', e.target.value)} placeholder="Street, zone, Lagos" />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Account tier">
          <Select value={form.tier} onChange={e => set('tier', e.target.value)}>
            {TIERS.map(t => <option key={t} value={t}>{STATUS_CONFIG[t]?.label}</option>)}
          </Select>
        </Field>
        <Field label="Status">
          <Select value={form.status} onChange={e => set('status', e.target.value)}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
        </Field>
      </div>
      <div className="flex justify-end gap-3 pt-1">
        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {initial ? 'Save changes' : 'Add customer'}
        </button>
      </div>
    </form>
  );
}

export function Customers() {
  const qc = useQueryClient();
  const notify = useNotify();
  const role = useUIStore(s => s.role);
  const canEdit   = role === 'admin' || role === 'dispatcher';
  const canDelete = role === 'admin';

  const { search, setSearch, sort, handleSort, sortField, sortDir, page, setPage, perPage } = useTableState('company:asc');
  const [tierFilter, setTierFilter] = useState('');
  const modal = useModal();
  const { open: confirmOpen, message: confirmMsg, confirm, respond } = useConfirm();

  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    if (searchParams.get('new') === '1') { modal.openWith(null); setSearchParams({}); }
  }, []);

  const { data: allCustomers = [], isLoading } = useQuery({
    queryKey: ['customers', search, tierFilter, sort],
    queryFn: () => customerService.getAll({ search, tier: tierFilter || undefined, sort }),
  });

  const createMutation = useMutation({
    mutationFn: customerService.create,
    onSuccess: () => { qc.invalidateQueries(['customers']); qc.invalidateQueries(['stats']); notify('success', 'Customer added', 'New account created.'); modal.close(); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => customerService.update(id, data),
    onSuccess: () => { qc.invalidateQueries(['customers']); notify('success', 'Customer updated'); modal.close(); },
  });
  const deleteMutation = useMutation({
    mutationFn: customerService.delete,
    onSuccess: () => { qc.invalidateQueries(['customers']); qc.invalidateQueries(['stats']); notify('success', 'Removed'); },
  });

  async function handleDelete(id) {
    const yes = await confirm('Remove this customer account?');
    if (yes) deleteMutation.mutate(id);
  }

  const sorted = [...allCustomers].sort((a, b) => {
    const av = a[sortField] ?? ''; const bv = b[sortField] ?? '';
    return sortDir === 'desc' ? (bv > av ? 1 : -1) : (av > bv ? 1 : -1);
  });
  const { items, total, pages } = paginate(sorted, page, perPage);

  const tierCounts = TIERS.map(t => ({ tier: t, count: allCustomers.filter(c => c.tier === t).length }));

  const columns = [
    {
      key: 'company', label: 'Company', sortable: true,
      render: (v, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/50 flex items-center justify-center flex-shrink-0">
            <Building2 size={14} className="text-teal-600 dark:text-teal-400" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-warm-800 dark:text-warm-200 text-sm leading-snug truncate">{v}</p>
            <p className="text-[10px] text-warm-400 font-mono">{row.id}</p>
          </div>
        </div>
      ),
    },
    { key: 'contact', label: 'Contact',
      render: v => <span className="text-sm text-warm-600 dark:text-warm-400">{v}</span> },
    { key: 'tier', label: 'Tier', render: v => <Badge status={v} /> },
    { key: 'status', label: 'Status', render: v => <Badge status={v} /> },
    { key: 'totalShipments', label: 'Shipments', sortable: true,
      render: v => <span className="tabular-nums font-semibold text-warm-700 dark:text-warm-300">{v}</span> },
    { key: 'totalSpend', label: 'Total spend', sortable: true,
      render: v => <span className="tabular-nums text-sm font-medium text-warm-700 dark:text-warm-300">{fmtCurrency(v, true)}</span> },
    { key: 'activeContracts', label: 'Contracts',
      render: v => <span className="tabular-nums">{v}</span> },
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
          ]}
        />
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 max-w-[1600px]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-warm-900 dark:text-warm-100">Customers</h2>
          <p className="text-xs sm:text-sm text-warm-500 mt-0.5">{total} accounts</p>
        </div>
        {canEdit && (
          <button className="btn-primary text-xs sm:text-sm" onClick={() => modal.openWith(null)}>
            <Plus size={14} />Add customer
          </button>
        )}
      </div>

      {/* Tier tiles */}
      <div className="grid grid-cols-3 gap-3">
        {tierCounts.map(({ tier, count }) => (
          <button
            key={tier}
            onClick={() => { setTierFilter(tierFilter === tier ? '' : tier); setPage(1); }}
            className={`card p-3 sm:p-4 text-left transition-all hover:shadow-md ${tierFilter === tier ? 'ring-2 ring-teal-500 shadow-sm' : 'hover:ring-1 hover:ring-warm-300 dark:hover:ring-warm-600'}`}
          >
            <Badge status={tier} />
            <p className="text-xl sm:text-2xl font-bold text-warm-900 dark:text-warm-100 mt-2 tabular-nums">{count}</p>
            <p className="text-xs text-warm-400 mt-0.5">accounts</p>
          </button>
        ))}
      </div>

      <div className="card p-3 sm:p-4 flex flex-wrap gap-3">
        <div className="relative flex-1" style={{ minWidth: 180 }}>
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400" />
          <input className="input pl-8 text-sm" placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select className="w-36 text-sm" value={tierFilter} onChange={e => { setTierFilter(e.target.value); setPage(1); }}>
          <option value="">All tiers</option>
          {TIERS.map(t => <option key={t} value={t}>{STATUS_CONFIG[t]?.label}</option>)}
        </Select>
      </div>

      <div className="card overflow-hidden">
        <Table columns={columns} data={items} loading={isLoading} onSort={handleSort} sortField={sortField} sortDir={sortDir} />
        {!isLoading && total === 0 && <Empty icon={Users} title="No customers found" />}
        {!isLoading && total > 0 && <Pagination page={page} pages={pages} total={total} perPage={perPage} onChange={setPage} />}
      </div>

      <Modal open={modal.open} onClose={modal.close} title={modal.data ? 'Edit customer' : 'Add customer'} size="md">
        <CustomerForm
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

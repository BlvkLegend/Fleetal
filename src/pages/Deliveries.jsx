import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Plus, Search, Download, Package, MoreHorizontal, Trash2, Edit, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { deliveryService } from '../services';
import { Table, Pagination } from '../components/ui/Table';
import { Badge, Spinner, Empty, Skeleton } from '../components/ui/primitives';
import { Modal, Field, Select, ConfirmDialog } from '../components/ui/Modal';
import { Dropdown } from '../components/ui/Dropdown';
import { useTableState, useModal, useNotify, useConfirm } from '../hooks';
import { paginate, STATUS_CONFIG, fmtCurrency } from '../lib/utils';
import { useUIStore, DRIVER_SESSION } from '../store/ui';

const STATUSES   = ['delivered','in-transit','pending','failed','returned'];
const PRIORITIES = ['high','normal','low'];

function DeliveryForm({ initial, onSave, onClose, loading }) {
  const [form, setForm] = useState(
    initial || { status: 'pending', priority: 'normal', weight: '', value: '', origin: '', destination: '', driverName: '', customerName: '', notes: '' }
  );
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Customer" required>
          <input className="input" value={form.customerName} onChange={e => set('customerName', e.target.value)} required placeholder="Company name" />
        </Field>
        <Field label="Driver" required>
          <input className="input" value={form.driverName} onChange={e => set('driverName', e.target.value)} required placeholder="Assigned driver" />
        </Field>
      </div>
      <Field label="Origin address" required>
        <input className="input" value={form.origin} onChange={e => set('origin', e.target.value)} required placeholder="Pickup location" />
      </Field>
      <Field label="Destination address" required>
        <input className="input" value={form.destination} onChange={e => set('destination', e.target.value)} required placeholder="Drop-off location" />
      </Field>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Status">
          <Select value={form.status} onChange={e => set('status', e.target.value)}>
            {STATUSES.map(s => <option key={s} value={s}>{STATUS_CONFIG[s]?.label || s}</option>)}
          </Select>
        </Field>
        <Field label="Priority">
          <Select value={form.priority} onChange={e => set('priority', e.target.value)}>
            {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </Select>
        </Field>
        <Field label="Weight (kg)">
          <input className="input" type="number" min="0" value={form.weight} onChange={e => set('weight', e.target.value)} placeholder="0" />
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Value (NGN)">
          <input className="input" type="number" min="0" value={form.value} onChange={e => set('value', e.target.value)} placeholder="0" />
        </Field>
        <Field label="Scheduled date">
          <input className="input" type="date" value={form.scheduledDate || ''} onChange={e => set('scheduledDate', e.target.value)} />
        </Field>
      </div>
      <Field label="Notes">
        <textarea className="input resize-none" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Optional notes..." />
      </Field>
      <div className="flex justify-end gap-3 pt-1">
        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading && <Spinner size={13} />}
          {initial ? 'Save changes' : 'Create delivery'}
        </button>
      </div>
    </form>
  );
}

function DetailRow({ label, children }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-warm-400 uppercase tracking-wider mb-1">{label}</p>
      <div className="text-sm text-warm-800 dark:text-warm-200">{children}</div>
    </div>
  );
}

export function Deliveries() {
  const qc = useQueryClient();
  const notify = useNotify();
  const role = useUIStore(s => s.role);
  const isDriver = role === 'driver';
  const canEdit   = role === 'admin' || role === 'dispatcher';
  const canDelete = role === 'admin';

  const { search, setSearch, sort, handleSort, sortField, sortDir, page, setPage, perPage } = useTableState('createdAt:desc');
  const [statusFilter, setStatusFilter]     = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const modal       = useModal();
  const detailModal = useModal();
  const { open: confirmOpen, message: confirmMsg, confirm, respond } = useConfirm();

  // Auto-open new form if ?new=1
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    if (searchParams.get('new') === '1') { modal.openWith(null); setSearchParams({}); }
  }, []);

  const queryFilters = {
    search,
    sort,
    status:   statusFilter   || undefined,
    priority: priorityFilter || undefined,
    driverId: isDriver ? DRIVER_SESSION.driverId : undefined,
  };

  const { data: allDeliveries = [], isLoading } = useQuery({
    queryKey: ['deliveries', queryFilters],
    queryFn: () => deliveryService.getAll(queryFilters),
  });

  const createMutation = useMutation({
    mutationFn: deliveryService.create,
    onSuccess: () => { qc.invalidateQueries(['deliveries']); qc.invalidateQueries(['stats']); notify('success', 'Delivery created', 'New shipment has been added.'); modal.close(); },
    onError: () => notify('error', 'Error', 'Could not create delivery.'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => deliveryService.update(id, data),
    onSuccess: () => { qc.invalidateQueries(['deliveries']); notify('success', 'Saved', 'Delivery updated.'); modal.close(); },
  });

  const deleteMutation = useMutation({
    mutationFn: deliveryService.delete,
    onSuccess: () => { qc.invalidateQueries(['deliveries']); qc.invalidateQueries(['stats']); notify('success', 'Deleted', 'Delivery removed.'); },
  });

  async function handleDelete(id) {
    const yes = await confirm('Delete this delivery? This action cannot be undone.');
    if (yes) deleteMutation.mutate(id);
  }

  const { items, total, pages } = paginate(allDeliveries, page, perPage);
  const activeFilters = [search, statusFilter, priorityFilter].filter(Boolean).length;

  const columns = [
    {
      key: 'id', label: 'ID', sortable: true, width: 130,
      render: v => (
        <span className="font-mono text-xs font-semibold text-warm-700 dark:text-warm-300 bg-warm-100 dark:bg-warm-800 px-2 py-0.5 rounded-md">
          {v}
        </span>
      ),
    },
    { key: 'customerName', label: 'Customer', sortable: true,
      render: v => <span className="font-medium text-warm-800 dark:text-warm-200">{v}</span> },
    { key: 'driverName', label: 'Driver' },
    { key: 'status', label: 'Status', render: v => <Badge status={v} /> },
    { key: 'priority', label: 'Priority', render: v => <Badge status={v} /> },
    { key: 'weight', label: 'Weight', render: v => v ? `${v} kg` : '—' },
    { key: 'scheduledDate', label: 'Scheduled', sortable: true,
      render: v => v ? <span className="tabular-nums text-xs">{format(new Date(v), 'dd MMM yy')}</span> : '—' },
    {
      key: '_actions', label: '', width: 56,
      render: (_, row) => (
        <Dropdown
          align="right"
          width="w-44"
          trigger={
            <button className="p-1.5 rounded-lg hover:bg-warm-100 dark:hover:bg-warm-700 text-warm-400 hover:text-warm-600 transition-colors">
              <MoreHorizontal size={15} />
            </button>
          }
          items={[
            { label: 'View details', icon: Eye, onClick: () => detailModal.openWith(row) },
            ...(canEdit ? [{ label: 'Edit', icon: Edit, onClick: () => modal.openWith(row) }] : []),
            ...(canDelete ? [{ divider: true }, { label: 'Delete', icon: Trash2, danger: true, onClick: () => handleDelete(row.id) }] : []),
          ]}
        />
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 max-w-[1600px]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-warm-900 dark:text-warm-100">Deliveries</h2>
          <p className="text-xs sm:text-sm text-warm-500 mt-0.5">
            {isLoading ? '...' : `${total} shipment${total !== 1 ? 's' : ''}${isDriver ? ' assigned to you' : ''}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isDriver && (
            <button className="btn-secondary text-xs sm:text-sm">
              <Download size={13} />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}
          {canEdit && (
            <button className="btn-primary text-xs sm:text-sm" onClick={() => modal.openWith(null)}>
              <Plus size={14} />
              <span className="hidden xs:inline">New delivery</span>
              <span className="xs:hidden">New</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="card p-3 sm:p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-0" style={{ minWidth: 180 }}>
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400" />
          <input
            className="input pl-8 text-sm"
            placeholder="Search ID, customer, tracking..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Select className="w-36 text-sm" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{STATUS_CONFIG[s]?.label}</option>)}
        </Select>
        <Select className="w-32 text-sm" value={priorityFilter} onChange={e => { setPriorityFilter(e.target.value); setPage(1); }}>
          <option value="">All priorities</option>
          {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
        </Select>
        {activeFilters > 0 && (
          <button
            className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors whitespace-nowrap"
            onClick={() => { setSearch(''); setStatusFilter(''); setPriorityFilter(''); }}
          >
            Clear {activeFilters > 1 ? `(${activeFilters})` : ''}
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <Table
          columns={columns}
          data={items}
          loading={isLoading}
          onSort={handleSort}
          sortField={sortField}
          sortDir={sortDir}
          onRowClick={row => detailModal.openWith(row)}
        />
        {!isLoading && total === 0 && (
          <Empty
            icon={Package}
            title={activeFilters > 0 ? 'No deliveries match your filters' : 'No deliveries yet'}
            description={activeFilters > 0 ? 'Try adjusting your search or filters.' : 'Create a new delivery to get started.'}
            action={canEdit && activeFilters === 0 ? (
              <button className="btn-primary" onClick={() => modal.openWith(null)}>
                <Plus size={14} />New delivery
              </button>
            ) : null}
          />
        )}
        {!isLoading && total > 0 && (
          <Pagination page={page} pages={pages} total={total} perPage={perPage} onChange={setPage} />
        )}
      </div>

      {/* Create / Edit modal */}
      <Modal
        open={modal.open}
        onClose={modal.close}
        title={modal.data ? 'Edit delivery' : 'New delivery'}
        subtitle={modal.data ? `Editing ${modal.data.id}` : 'Create a new shipment record'}
        size="lg"
      >
        <DeliveryForm
          initial={modal.data}
          onSave={form => modal.data
            ? updateMutation.mutate({ id: modal.data.id, data: form })
            : createMutation.mutate(form)
          }
          onClose={modal.close}
          loading={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>

      {/* Detail modal */}
      <Modal
        open={detailModal.open}
        onClose={detailModal.close}
        title={`Delivery ${detailModal.data?.id}`}
        subtitle={`Tracking: ${detailModal.data?.trackingNumber}`}
      >
        {detailModal.data && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <DetailRow label="Status"><Badge status={detailModal.data.status} /></DetailRow>
              <DetailRow label="Priority"><Badge status={detailModal.data.priority} /></DetailRow>
              <DetailRow label="Customer">{detailModal.data.customerName}</DetailRow>
              <DetailRow label="Driver">{detailModal.data.driverName}</DetailRow>
              <DetailRow label="Weight">{detailModal.data.weight ? `${detailModal.data.weight} kg` : '—'}</DetailRow>
              <DetailRow label="Value">{detailModal.data.value ? fmtCurrency(detailModal.data.value) : '—'}</DetailRow>
              <DetailRow label="Distance">{detailModal.data.distance ? `${detailModal.data.distance} km` : '—'}</DetailRow>
              <DetailRow label="Signature">{detailModal.data.signature ? 'Collected' : 'Pending'}</DetailRow>
            </div>
            <DetailRow label="Origin">{detailModal.data.origin}</DetailRow>
            <DetailRow label="Destination">{detailModal.data.destination}</DetailRow>
            <DetailRow label="Scheduled date">{detailModal.data.scheduledDate || '—'}</DetailRow>
            {detailModal.data.deliveredAt && (
              <DetailRow label="Delivered at">
                {format(new Date(detailModal.data.deliveredAt), 'dd MMM yyyy HH:mm')}
              </DetailRow>
            )}
            {detailModal.data.notes && <DetailRow label="Notes">{detailModal.data.notes}</DetailRow>}
            {canEdit && (
              <div className="flex justify-end pt-2">
                <button className="btn-secondary text-sm" onClick={() => { detailModal.close(); modal.openWith(detailModal.data); }}>
                  <Edit size={13} />Edit delivery
                </button>
              </div>
            )}
          </div>
        )}
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

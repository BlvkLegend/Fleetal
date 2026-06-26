import { useState, useCallback, useEffect, useRef } from 'react';
import { useUIStore } from '../store/ui';

export function useNotify() {
  const addNotification = useUIStore(s => s.addNotification);
  return useCallback((type, title, message) => {
    addNotification({ type, title, message, toast: true });
  }, [addNotification]);
}

export function useTableState(defaultSort = '') {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState(defaultSort);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({});
  const perPage = 10;

  const handleSort = useCallback((field) => {
    setSort(prev => {
      const [pf, pd] = prev.split(':');
      return pf === field ? `${field}:${pd === 'asc' ? 'desc' : 'asc'}` : `${field}:asc`;
    });
    setPage(1);
  }, []);

  const setFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value || undefined }));
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearch('');
    setPage(1);
  }, []);

  const [sortField, sortDir] = sort.split(':');

  return {
    search, setSearch: (v) => { setSearch(v); setPage(1); },
    sort, handleSort, sortField, sortDir: sortDir || 'asc',
    page, setPage, perPage,
    filters, setFilter, clearFilters,
  };
}

export function useModal(initial = false) {
  const [open, setOpen] = useState(initial);
  const [data, setData] = useState(null);
  const openWith = useCallback((d = null) => { setData(d); setOpen(true); }, []);
  const close = useCallback(() => { setOpen(false); setTimeout(() => setData(null), 250); }, []);
  return { open, data, openWith, close };
}

export function useConfirm() {
  const [state, setState] = useState({ open: false, message: '', onConfirm: null });
  const confirm = useCallback((message) => new Promise(resolve => {
    setState({ open: true, message, onConfirm: resolve });
  }), []);
  const respond = useCallback((yes) => {
    state.onConfirm?.(yes);
    setState({ open: false, message: '', onConfirm: null });
  }, [state]);
  return { ...state, confirm, respond };
}

export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function useKeyPress(key, handler) {
  useEffect(() => {
    const fn = (e) => {
      if (e.key === key) handler(e);
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [key, handler]);
}

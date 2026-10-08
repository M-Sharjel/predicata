import { useEffect, useState } from 'react';

export function useMedia(query: string): boolean {
  const [m, setM] = useState(() => (typeof window !== 'undefined' ? window.matchMedia(query).matches : false));
  useEffect(() => {
    const mq = window.matchMedia(query);
    const h = () => setM(mq.matches);
    h();
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, [query]);
  return m;
}

export function usePagination<T>(items: T[], pageSize: number) {
  const [page, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(items.length / pageSize));
  const safe = Math.min(page, pages);
  useEffect(() => {
    if (page > pages) setPage(pages);
  }, [page, pages]);
  return { page: safe, pages, setPage, slice: items.slice((safe - 1) * pageSize, safe * pageSize), total: items.length };
}

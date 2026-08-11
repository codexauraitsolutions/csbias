import { useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 10;

// Client-side pagination — every admin list endpoint returns its full
// collection in one call, so we just slice it 10-at-a-time here rather than
// adding page params across the whole API.
export function usePagination(items) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil((items?.length || 0) / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [safePage, page]);

  const pageItems = useMemo(() => {
    if (!items) return null;
    const start = (safePage - 1) * PAGE_SIZE;
    return items.slice(start, start + PAGE_SIZE);
  }, [items, safePage]);

  return { page: safePage, setPage, totalPages, pageItems };
}

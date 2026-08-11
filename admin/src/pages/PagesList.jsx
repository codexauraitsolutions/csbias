import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";
import ConfirmDeleteButton from "../components/ConfirmDeleteButton.jsx";
import Pagination from "../components/Pagination.jsx";
import { usePagination } from "../lib/usePagination.js";

export default function PagesList() {
  const [pages, setPages] = useState(null);
  const [search, setSearch] = useState("");
  const filtered = pages
    ? pages.filter((p) => p.title.toLowerCase().includes(search.trim().toLowerCase()))
    : [];
  const { page, setPage, totalPages, pageItems } = usePagination(filtered);
  function load() {
    api.pages.list().then(setPages);
  }
  useEffect(load, []);

  async function handleDelete(id) {
    await api.pages.remove(id);
    load();
  }

  if (!pages) return <p>Loading…</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Pages</h1>
        <Link to="/pages/new" className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">
          + New Page
        </Link>
      </div>
      <input
        placeholder="Search pages by title…"
        className="w-full border rounded px-3 py-2 bg-white mb-4"
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
      />
      <div className="bg-white rounded-lg shadow divide-y">
        {pageItems.map((p) => (
          <div key={p.id} className="flex items-center justify-between px-5 py-3">
            <div>
              <p className="font-medium">{p.title}</p>
              <p className="text-xs text-gray-400">/{p.slug} · {p.status}</p>
            </div>
            <div className="flex gap-3 text-sm">
              <Link to={`/pages/${p.id}`} className="text-indigo-600 hover:underline">Edit</Link>
              <ConfirmDeleteButton onConfirm={() => handleDelete(p.id)} />
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="px-5 py-8 text-center text-gray-400">No pages found.</p>}
      </div>
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}

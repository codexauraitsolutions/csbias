import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import ConfirmDeleteButton from "../components/ConfirmDeleteButton.jsx";
import Pagination from "../components/Pagination.jsx";
import { usePagination } from "../lib/usePagination.js";

export default function FormsList() {
  const [submissions, setSubmissions] = useState(null);
  const [search, setSearch] = useState("");
  const filtered = submissions
    ? submissions.filter((s) => s.formName.toLowerCase().includes(search.trim().toLowerCase()))
    : [];
  const { page, setPage, totalPages, pageItems } = usePagination(filtered);

  function load() {
    api.forms.list().then(setSubmissions);
  }
  useEffect(load, []);

  async function handleDelete(id) {
    await api.forms.remove(id);
    load();
  }

  if (!submissions) return <p>Loading…</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Form Submissions</h1>
      <input
        placeholder="Search by form name…"
        className="w-full border rounded px-3 py-2 bg-white mb-4"
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
      />
      <div className="bg-white rounded-lg shadow divide-y">
        {pageItems.map((s) => (
          <div key={s.id} className="px-5 py-3">
            <div className="flex items-center justify-between">
              <p className="font-medium">{s.formName}</p>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">{new Date(s.createdAt).toLocaleString()}</span>
                <ConfirmDeleteButton onConfirm={() => handleDelete(s.id)} />
              </div>
            </div>
            <pre className="text-xs text-gray-600 mt-2 whitespace-pre-wrap">{JSON.stringify(s.data, null, 2)}</pre>
          </div>
        ))}
        {filtered.length === 0 && <p className="px-5 py-8 text-center text-gray-400">No submissions found.</p>}
      </div>
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}

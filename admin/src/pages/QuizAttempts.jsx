import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../lib/api.js";
import Pagination from "../components/Pagination.jsx";
import { usePagination } from "../lib/usePagination.js";

export default function QuizAttempts() {
  const { id } = useParams();
  const [attempts, setAttempts] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.quizzes.attempts(id).then(setAttempts);
  }, [id]);

  const filtered = attempts
    ? attempts.filter((a) => {
        const q = search.trim().toLowerCase();
        return !q || a.userName.toLowerCase().includes(q) || a.userEmail.toLowerCase().includes(q);
      })
    : [];
  const { page, setPage, totalPages, pageItems } = usePagination(filtered);

  if (!attempts) return <p>Loading…</p>;

  return (
    <div>
      <Link to={`/quizzes/${id}`} className="text-sm text-indigo-600 hover:underline">← Back to Quiz</Link>
      <h1 className="text-2xl font-bold mt-3 mb-6">Quiz Results</h1>
      <input
        placeholder="Search by name or email…"
        className="w-full border rounded px-3 py-2 bg-white mb-4"
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
      />
      <div className="bg-white rounded-lg shadow divide-y">
        {pageItems.map((a) => (
          <div key={a.id} className="flex items-center justify-between px-5 py-3">
            <div>
              <p className="font-medium">{a.userName} <span className="text-gray-400 font-normal">({a.userEmail})</span></p>
              <p className="text-xs text-gray-400">{new Date(a.submittedAt).toLocaleString()}</p>
            </div>
            <p className="font-semibold text-indigo-600">{a.score} / {a.totalPoints}</p>
          </div>
        ))}
        {filtered.length === 0 && <p className="px-5 py-8 text-center text-gray-400">No attempts found.</p>}
      </div>
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}

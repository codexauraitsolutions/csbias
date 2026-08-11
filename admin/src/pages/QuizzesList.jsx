import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";
import ConfirmDeleteButton from "../components/ConfirmDeleteButton.jsx";
import Pagination from "../components/Pagination.jsx";
import { usePagination } from "../lib/usePagination.js";

export default function QuizzesList() {
  const [quizzes, setQuizzes] = useState(null);
  const [search, setSearch] = useState("");
  const filtered = quizzes
    ? quizzes.filter((q) => q.title.toLowerCase().includes(search.trim().toLowerCase()))
    : [];
  const { page, setPage, totalPages, pageItems } = usePagination(filtered);
  function load() {
    api.quizzes.list().then(setQuizzes);
  }
  useEffect(load, []);

  async function handleDelete(id) {
    await api.quizzes.remove(id);
    load();
  }

  if (!quizzes) return <p>Loading…</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Quiz</h1>
        <Link to="/quizzes/new" className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">
          + New Quiz
        </Link>
      </div>
      <input
        placeholder="Search quizzes by title…"
        className="w-full border rounded px-3 py-2 bg-white mb-4"
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
      />
      <div className="bg-white rounded-lg shadow divide-y">
        {pageItems.map((quiz) => (
          <div key={quiz.id} className="flex items-center justify-between px-5 py-3">
            <div>
              <p className="font-medium">{quiz.title}</p>
              <p className="text-xs text-gray-400">
                {quiz.status} · {quiz._count.questions} questions · {quiz._count.attempts} attempts
              </p>
            </div>
            <div className="flex gap-3 text-sm">
              <Link to={`/quizzes/${quiz.id}`} className="text-indigo-600 hover:underline">Edit</Link>
              <Link to={`/quizzes/${quiz.id}/attempts`} className="text-indigo-600 hover:underline">Results</Link>
              <ConfirmDeleteButton onConfirm={() => handleDelete(quiz.id)} />
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="px-5 py-8 text-center text-gray-400">No quizzes found.</p>}
      </div>
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}

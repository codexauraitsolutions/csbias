import { Link } from "react-router-dom";
import { useFetch } from "../lib/useFetch.js";
import { api } from "../lib/api.js";

export default function Quizzes() {
  const { data: quizzes, loading, error } = useFetch(() => api.quizzes.list(), []);

  if (loading) return <p>Loading quizzes…</p>;
  if (error) return <p className="text-red-600">Failed to load quizzes: {error.message}</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Quizzes</h1>
      <div className="grid sm:grid-cols-2 gap-6">
        {quizzes.map((quiz) => (
          <Link key={quiz.id} to={`/quizzes/${quiz.slug}`} className="border rounded-lg p-5 hover:shadow-md transition">
            <h2 className="font-semibold">{quiz.title}</h2>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{quiz.description}</p>
            <p className="text-xs text-gray-400 mt-2">
              {quiz._count.questions} questions
              {quiz.timeLimitSec ? ` · ${Math.round(quiz.timeLimitSec / 60)} min` : ""}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

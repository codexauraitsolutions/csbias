import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useFetch } from "../lib/useFetch.js";
import { api } from "../lib/api.js";

export default function QuizTake() {
  const { slug } = useParams();
  const { data: quiz, loading, error } = useFetch(() => api.quizzes.get(slug), [slug]);

  const [started, setStarted] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [answers, setAnswers] = useState({});
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const startedAtRef = useRef(null);

  useEffect(() => {
    if (!started || !quiz?.timeLimitSec || result) return;
    setSecondsLeft(quiz.timeLimitSec);
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started]);

  if (loading) return <p>Loading…</p>;
  if (error) return <p className="text-red-600">Quiz not found.</p>;

  function handleStart(e) {
    e.preventDefault();
    startedAtRef.current = new Date().toISOString();
    setStarted(true);
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const res = await api.quizzes.submit(slug, {
        userName,
        userEmail,
        answers,
        startedAt: startedAtRef.current,
      });
      setResult(res);
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="max-w-xl mx-auto text-center py-16">
        <h1 className="text-2xl font-bold">Quiz complete</h1>
        <p className="text-4xl font-bold text-indigo-600 mt-4">
          {result.score} / {result.totalPoints}
        </p>
        <Link to="/quizzes" className="inline-block mt-6 text-indigo-600 hover:underline">
          ← Back to Quizzes
        </Link>
      </div>
    );
  }

  if (!started) {
    return (
      <form onSubmit={handleStart} className="max-w-md mx-auto space-y-4">
        <h1 className="text-2xl font-bold">{quiz.title}</h1>
        {quiz.description && <p className="text-gray-600">{quiz.description}</p>}
        <p className="text-sm text-gray-500">
          {quiz.questions.length} questions
          {quiz.timeLimitSec ? ` · ${Math.round(quiz.timeLimitSec / 60)} minute time limit` : ""}
        </p>
        <input
          required
          placeholder="Your name"
          className="w-full border rounded px-3 py-2"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
        <input
          required
          type="email"
          placeholder="Email"
          className="w-full border rounded px-3 py-2"
          value={userEmail}
          onChange={(e) => setUserEmail(e.target.value)}
        />
        <button className="bg-indigo-600 text-white px-6 py-2 rounded-md font-medium hover:bg-indigo-700">
          Start Quiz
        </button>
      </form>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{quiz.title}</h1>
        {secondsLeft !== null && (
          <span className="text-sm font-medium text-red-600">
            {String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:{String(secondsLeft % 60).padStart(2, "0")}
          </span>
        )}
      </div>

      <div className="space-y-6">
        {quiz.questions.map((q, i) => (
          <div key={q.id} className="border rounded-lg p-5">
            <p className="font-medium">
              {i + 1}. {q.question}
            </p>
            <div className="mt-3 space-y-2">
              {q.options.map((opt) => (
                <label key={opt.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    checked={answers[q.id] === opt.id}
                    onChange={() => setAnswers({ ...answers, [q.id]: opt.id })}
                  />
                  <span>{opt.text}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="mt-6 bg-indigo-600 text-white px-6 py-2 rounded-md font-medium hover:bg-indigo-700 disabled:opacity-50"
      >
        {submitting ? "Submitting…" : "Submit Quiz"}
      </button>
    </div>
  );
}

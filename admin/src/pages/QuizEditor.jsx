import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { api } from "../lib/api.js";
import QuestionForm from "../components/QuestionForm.jsx";
import ConfirmDeleteButton from "../components/ConfirmDeleteButton.jsx";

const EMPTY_QUIZ = { title: "", description: "", timeLimitSec: "", status: "draft" };

export default function QuizEditor() {
  const { id } = useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_QUIZ);
  const [questions, setQuestions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null); // null | "new" | question object

  async function loadQuiz() {
    if (isNew) return;
    const quiz = await api.quizzes.get(id);
    setForm(quiz);
    setQuestions(quiz.questions);
  }

  useEffect(() => {
    loadQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleSave(status) {
    setSaving(true);
    setError(null);
    try {
      const payload = { ...form, status, timeLimitSec: form.timeLimitSec ? Number(form.timeLimitSec) : null };
      if (isNew) {
        const created = await api.quizzes.create(payload);
        navigate(`/quizzes/${created.id}`);
      } else {
        await api.quizzes.update(id, payload);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveQuestion(data) {
    if (editingQuestion === "new") {
      const created = await api.quizzes.addQuestion(id, { ...data, order: questions.length });
      setQuestions([...questions, created]);
    } else {
      const updated = await api.quizzes.updateQuestion(editingQuestion.id, data);
      setQuestions(questions.map((q) => (q.id === updated.id ? updated : q)));
    }
    setEditingQuestion(null);
  }

  async function handleDeleteQuestion(questionId) {
    await api.quizzes.removeQuestion(questionId);
    setQuestions(questions.filter((q) => q.id !== questionId));
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-6">{isNew ? "New Quiz" : "Edit Quiz"}</h1>
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <input placeholder="Title" className="w-full border rounded px-3 py-2 text-lg font-medium" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea placeholder="Description" rows={2} className="w-full border rounded px-3 py-2" value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input placeholder="Time limit (seconds, optional)" type="number" className="w-full border rounded px-3 py-2" value={form.timeLimitSec || ""} onChange={(e) => setForm({ ...form, timeLimitSec: e.target.value })} />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex gap-3">
            <button onClick={() => handleSave("draft")} disabled={saving} className="px-4 py-2 rounded-md border font-medium hover:bg-gray-50 disabled:opacity-50">Save Draft</button>
            <button onClick={() => handleSave("published")} disabled={saving} className="px-4 py-2 rounded-md bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50">Publish</button>
            {!isNew && <Link to={`/quizzes/${id}/attempts`} className="ml-auto text-indigo-600 text-sm self-center hover:underline">View Results →</Link>}
          </div>
        </div>
      </div>

      {!isNew && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Questions</h2>
            <button onClick={() => setEditingQuestion("new")} className="text-sm text-indigo-600 hover:underline">+ Add Question</button>
          </div>

          <div className="space-y-3">
            {questions.map((q) => (
              <div key={q.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex items-start justify-between">
                  <p className="font-medium">{q.question}</p>
                  <div className="flex gap-3 text-sm shrink-0 ml-4">
                    <button onClick={() => setEditingQuestion(q)} className="text-indigo-600 hover:underline">Edit</button>
                    <ConfirmDeleteButton onConfirm={() => handleDeleteQuestion(q.id)} />
                  </div>
                </div>
                <ul className="mt-2 text-sm text-gray-600 space-y-1">
                  {q.options?.map((opt) => (
                    <li key={opt.id} className={opt.id === q.correctOption ? "text-green-600 font-medium" : ""}>
                      {opt.id === q.correctOption ? "✓ " : "· "}
                      {opt.text}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {questions.length === 0 && <p className="text-gray-400 text-sm">No questions yet.</p>}
          </div>

          {editingQuestion && (
            <QuestionForm
              initial={editingQuestion === "new" ? null : editingQuestion}
              onCancel={() => setEditingQuestion(null)}
              onSave={handleSaveQuestion}
            />
          )}
        </div>
      )}
    </div>
  );
}

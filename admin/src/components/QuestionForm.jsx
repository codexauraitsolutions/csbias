import { useState } from "react";

function newOption(i) {
  return { id: `opt-${Date.now()}-${i}`, text: "" };
}

export default function QuestionForm({ initial, onCancel, onSave }) {
  const [question, setQuestion] = useState(initial?.question || "");
  const [options, setOptions] = useState(initial?.options?.length ? initial.options : [newOption(0), newOption(1)]);
  const [correctOption, setCorrectOption] = useState(initial?.correctOption || "");
  const [saving, setSaving] = useState(false);

  function updateOptionText(id, text) {
    setOptions(options.map((o) => (o.id === id ? { ...o, text } : o)));
  }

  function addOption() {
    setOptions([...options, newOption(options.length)]);
  }

  function removeOption(id) {
    setOptions(options.filter((o) => o.id !== id));
    if (correctOption === id) setCorrectOption("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({ question, options, correctOption });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-4 mt-3 space-y-3 border-2 border-indigo-100">
      <textarea
        required
        placeholder="Question text"
        rows={2}
        className="w-full border rounded px-3 py-2"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />

      <div className="space-y-2">
        {options.map((opt) => (
          <div key={opt.id} className="flex items-center gap-2">
            <input
              type="radio"
              name="correct"
              checked={correctOption === opt.id}
              onChange={() => setCorrectOption(opt.id)}
              title="Mark as correct answer"
            />
            <input
              required
              placeholder="Option text"
              className="flex-1 border rounded px-3 py-1.5"
              value={opt.text}
              onChange={(e) => updateOptionText(opt.id, e.target.value)}
            />
            {options.length > 2 && (
              <button type="button" onClick={() => removeOption(opt.id)} className="text-red-600 text-sm">
                Remove
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addOption} className="text-indigo-600 text-sm hover:underline">
          + Add Option
        </button>
      </div>

      {!correctOption && <p className="text-amber-600 text-sm">Select the radio button next to the correct answer.</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving || !correctOption}
          className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Question"}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md border text-sm font-medium hover:bg-gray-50">
          Cancel
        </button>
      </div>
    </form>
  );
}

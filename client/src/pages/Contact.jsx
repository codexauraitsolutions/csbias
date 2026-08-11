import { useState } from "react";
import { api } from "../lib/api.js";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("sending");
    try {
      await api.forms.submit("contact", form);
      setStatus("sent");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-3xl font-bold mb-6">Contact / Admission Enquiry</h1>

      {status === "sent" ? (
        <p className="text-green-700 bg-green-50 border border-green-200 rounded p-4">
          Thanks — we've received your message and will get back to you soon.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            required
            placeholder="Full name"
            className="w-full border rounded px-3 py-2"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            required
            type="email"
            placeholder="Email"
            className="w-full border rounded px-3 py-2"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            placeholder="Phone"
            className="w-full border rounded px-3 py-2"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <textarea
            required
            placeholder="Message"
            rows={4}
            className="w-full border rounded px-3 py-2"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />
          <button
            type="submit"
            disabled={status === "sending"}
            className="bg-indigo-600 text-white px-6 py-2 rounded-md font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {status === "sending" ? "Sending…" : "Send"}
          </button>
          {status === "error" && <p className="text-red-600 text-sm">Something went wrong — please try again.</p>}
        </form>
      )}
    </div>
  );
}

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
    <div>
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-3">CONTACT US</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Embrace Your Journey with CSB IAS ACADEMY — For Further Inquiries, Please Reach Out to Us.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">
        <div>
          <h2 className="text-xl font-bold mb-1">We're Here To Help!</h2>
          <p className="text-gray-500 mb-6">Our Experts Are Just a Call Away!</p>

          <div className="space-y-5">
            <div>
              <p className="text-sm font-semibold text-gray-500">Call us directly</p>
              <p className="font-medium">+91-9966436875, +91-6309078111</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">Address</p>
              <p className="font-medium">
                CSB IAS ACADEMY Balalatha's Tushara Building, Near Sub-Registrar Office Ashok Nagar, Hyderabad,
                Telangana - 500080
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">Email</p>
              <p className="font-medium">
                info@csbias.com
                <br />
                csbiasacademy@gmail.com
                <br />
                csbiassocial@gmail.com
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold mb-4">We're Here to Help You Succeed!</h2>

          {status === "sent" ? (
            <p className="text-green-700 bg-green-50 border border-green-200 rounded p-4">
              Thanks — we've received your message and will get back to you soon.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                required
                placeholder="Name"
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
                placeholder="phone number"
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
              <p className="text-xs text-gray-400">
                By clicking next, you consent us to us using your provided contact information to communicate with
                you over SMS/RCS/VOICE/WHATSAPP/etc. channels with you regarding our services and update Privacy
                Policy.
              </p>
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
      </div>
    </div>
  );
}

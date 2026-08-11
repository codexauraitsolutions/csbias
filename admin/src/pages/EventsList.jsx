import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";
import ConfirmDeleteButton from "../components/ConfirmDeleteButton.jsx";
import Pagination from "../components/Pagination.jsx";
import { usePagination } from "../lib/usePagination.js";

export default function EventsList() {
  const [events, setEvents] = useState(null);
  const [search, setSearch] = useState("");
  const filtered = events
    ? events.filter((e) => e.title.toLowerCase().includes(search.trim().toLowerCase()))
    : [];
  const { page, setPage, totalPages, pageItems } = usePagination(filtered);
  function load() {
    api.events.list().then(setEvents);
  }
  useEffect(load, []);

  async function handleDelete(id) {
    await api.events.remove(id);
    load();
  }

  if (!events) return <p>Loading…</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Events</h1>
        <Link to="/events/new" className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">
          + New Event
        </Link>
      </div>
      <input
        placeholder="Search events by title…"
        className="w-full border rounded px-3 py-2 bg-white mb-4"
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
      />
      <div className="bg-white rounded-lg shadow divide-y">
        {pageItems.map((event) => (
          <div key={event.id} className="flex items-center justify-between px-5 py-3">
            <div>
              <p className="font-medium">{event.title}</p>
              <p className="text-xs text-gray-400">
                {new Date(event.startAt).toLocaleString()} · {event.status}
              </p>
            </div>
            <div className="flex gap-3 text-sm">
              <Link to={`/events/${event.id}`} className="text-indigo-600 hover:underline">Edit</Link>
              <ConfirmDeleteButton onConfirm={() => handleDelete(event.id)} />
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="px-5 py-8 text-center text-gray-400">No events found.</p>}
      </div>
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}

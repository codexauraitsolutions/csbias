import { useFetch } from "../lib/useFetch.js";
import { api } from "../lib/api.js";
import { sanitizeHtml } from "../lib/sanitize.js";

export default function Events() {
  const { data: events, loading, error } = useFetch(() => api.events.list(), []);

  if (loading) return <p>Loading events…</p>;
  if (error) return <p className="text-red-600">Failed to load events: {error.message}</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Upcoming Events</h1>
      <div className="space-y-4">
        {events.length === 0 && <p className="text-gray-500">No upcoming events right now.</p>}
        {events.map((event) => (
          <div key={event.id} className="border rounded-lg p-5">
            <p className="text-sm text-indigo-600 font-medium">
              {new Date(event.startAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
            </p>
            <h2 className="font-semibold text-lg mt-1">{event.title}</h2>
            {event.location && <p className="text-sm text-gray-500 mt-1">{event.location}</p>}
            {event.description && (
              <div className="prose prose-sm max-w-none mt-3" dangerouslySetInnerHTML={{ __html: sanitizeHtml(event.description) }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

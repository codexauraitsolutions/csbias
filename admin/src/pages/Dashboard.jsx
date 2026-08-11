import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";
import { useAuth } from "../lib/AuthContext.jsx";

// Same order as the sidebar nav (admin/src/components/Layout.jsx) — mirrors
// the website's own nav order, with sections that have no website-nav
// counterpart pushed to the end. Every admin section gets a card here.
const CARDS = [
  { label: "Homepage Slider", key: "slides", to: "/slides", fetch: api.slides.list },
  { label: "Homepage Content", key: "highlights", to: "/highlights", fetch: api.highlights.list },
  { label: "Current Affairs", key: "posts", to: "/posts", fetch: api.posts.list },
  { label: "Courses", key: "courses", to: "/courses", fetch: api.courses.list },
  { label: "Videos", key: "videos", to: "/videos", fetch: api.videos.list },
  { label: "Events", key: "events", to: "/events", fetch: api.events.list },
  { label: "Quiz", key: "quizzes", to: "/quizzes", fetch: api.quizzes.list },
  { label: "Pages", key: "pages", to: "/pages", fetch: api.pages.list },
  { label: "Form Submissions", key: "forms", to: "/forms", fetch: api.forms.list },
  { label: "Testimonials", key: "testimonials", to: "/testimonials", fetch: api.testimonials.list },
  { label: "FAQs", key: "faqs", to: "/faqs", fetch: api.faqs.list },
  { label: "Media", key: "media", to: "/media", fetch: api.media.list },
];

export default function Dashboard() {
  const { hasAccess } = useAuth();
  const [counts, setCounts] = useState({});
  const visibleCards = CARDS.filter((c) => hasAccess(c.key));

  useEffect(() => {
    // allSettled, not all — one restricted section 403ing shouldn't blank out
    // the counts for sections this admin actually has access to.
    Promise.allSettled(visibleCards.map((c) => c.fetch())).then((results) => {
      const next = {};
      results.forEach((r, i) => {
        if (r.status === "fulfilled") next[visibleCards[i].key] = r.value.length;
      });
      setCounts(next);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {visibleCards.map((c) => (
          <Link key={c.key} to={c.to} className="bg-white rounded-lg shadow p-5 hover:shadow-md transition">
            <p className="text-3xl font-bold text-indigo-600">{counts[c.key] ?? "…"}</p>
            <p className="text-sm text-gray-500 mt-1">{c.label}</p>
          </Link>
        ))}
        {visibleCards.length === 0 && (
          <p className="col-span-full text-gray-400">You don't have access to any sections yet — ask a super admin.</p>
        )}
      </div>
    </div>
  );
}

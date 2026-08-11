import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../lib/AuthContext.jsx";

// Served from admin/public — a static app asset, not a Media Library upload,
// so it can never be swept up by the uploads-cleanup script (which only
// knows about files referenced from the database).
const LOGO_URL = "/logo.png";

// Order mirrors the public website's own nav bar (Home -> Current Affairs/Blog
// -> Courses -> Videos -> Events -> Quiz -> Gallery/About Us -> Contact Us),
// so admins can find a section by where its tab sits on the live site.
// Homepage Slider/Content lead since they feed the Home tab. Sections with no
// direct website-nav counterpart (Testimonials, FAQs, Media) sort last.
const NAV = [
  { to: "/", label: "Dashboard", resource: null },
  { to: "/slides", label: "Homepage Slider", resource: "slides" },
  { to: "/highlights", label: "Homepage Content", resource: "highlights" },
  { to: "/posts", label: "Current Affairs", resource: "posts" },
  { to: "/courses", label: "Courses", resource: "courses" },
  { to: "/videos", label: "Videos", resource: "videos" },
  { to: "/events", label: "Events", resource: "events" },
  { to: "/quizzes", label: "Quiz", resource: "quizzes" },
  { to: "/pages", label: "Pages", resource: "pages" },
  { to: "/forms", label: "Form Submissions", resource: "forms" },
  { to: "/testimonials", label: "Testimonials", resource: "testimonials" },
  { to: "/faqs", label: "FAQs", resource: "faqs" },
  { to: "/media", label: "Media", resource: "media" },
];

export default function Layout() {
  const { admin, logout, hasAccess } = useAuth();
  const visibleNav = NAV.filter((item) => !item.resource || hasAccess(item.resource));

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 bg-gray-900 text-gray-200 flex flex-col">
        <div className="px-4 py-5 border-b border-gray-800">
          <img src={LOGO_URL} alt="CSB IAS Academy" className="h-8 bg-white rounded px-2 py-1" />
        </div>
        <nav className="flex-1 py-4">
          {visibleNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `block px-4 py-2 text-sm ${isActive ? "bg-indigo-600 text-white" : "hover:bg-gray-800"}`
              }
            >
              {item.label}
            </NavLink>
          ))}
          {admin?.role === "super_admin" && (
            <>
              <div className="border-t border-gray-800 my-2" />
              <NavLink
                to="/users"
                className={({ isActive }) =>
                  `block px-4 py-2 text-sm ${isActive ? "bg-indigo-600 text-white" : "hover:bg-gray-800"}`
                }
              >
                Admin Users
              </NavLink>
            </>
          )}
        </nav>
        <div className="p-4 border-t border-gray-800 text-sm">
          <p className="text-gray-400 truncate">{admin?.email}</p>
          <p className="text-gray-500 text-xs">{admin?.role === "super_admin" ? "Super Admin" : "Admin"}</p>
          <NavLink to="/change-password" className="block mt-2 text-indigo-400 hover:text-indigo-300">
            Change password
          </NavLink>
          <button onClick={logout} className="mt-2 text-red-400 hover:text-red-300">
            Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 bg-gray-50 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

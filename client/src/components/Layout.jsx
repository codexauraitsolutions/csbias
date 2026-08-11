import { Link, Outlet } from "react-router-dom";
import Footer from "./Footer.jsx";

// Served from client/public — a static app asset, not a Media Library
// upload, so it's never at risk from the uploads-cleanup script.
const LOGO_URL = "/logo.png";

const NAV = [
  { to: "/", label: "Home" },
  {
    to: "/blog?category=current-affairs",
    label: "Current Affairs",
    items: [
      { label: "Prelims", to: "/blog?category=prelims" },
      { label: "Mains", to: "/blog?category=mains" },
      { label: "Daily Current Affairs", to: "/blog?category=daily-current-affairs" },
      { label: "Monthly Magazines", to: "/blog?category=monthly-magazines" },
      { label: "Important Notes", to: "/blog?category=important-notes" },
    ],
  },
  {
    label: "Courses",
    items: [
      { label: "General Studies PCM", to: "/courses?type=general_studies_pcm" },
      { label: "Degree + Civils", to: "/courses?type=degree_civils" },
      { label: "Mission Ekalavya", to: "/courses?type=mission_ekalavya" },
      { label: "Test Series", to: "/courses?type=test_series" },
    ],
  },
  { to: "/videos", label: "Videos" },
  { to: "/events", label: "Events" },
  { to: "/quizzes", label: "Quiz" },
  { to: "/page/gallery", label: "Gallery" },
  {
    to: "/page/about-us",
    label: "About Us",
    items: [{ label: "Our Awards", to: "/page/our-awards" }],
  },
  { to: "/contact", label: "Contact Us" },
];

function NavItem({ item }) {
  if (!item.items) {
    return (
      <Link to={item.to} className="hover:text-indigo-700">
        {item.label}
      </Link>
    );
  }

  const chevron = (
    <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
      <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z" />
    </svg>
  );

  return (
    <div className="relative group">
      {item.to ? (
        <Link to={item.to} className="hover:text-indigo-700 flex items-center gap-1">
          {item.label}
          {chevron}
        </Link>
      ) : (
        <button className="hover:text-indigo-700 flex items-center gap-1">
          {item.label}
          {chevron}
        </button>
      )}
      <div className="absolute left-0 top-full hidden group-hover:block bg-white border rounded-md shadow-lg py-2 min-w-[220px] z-20">
        {item.items.map((sub) => (
          <Link key={sub.to} to={sub.to} className="block px-4 py-2 text-sm hover:bg-indigo-50 hover:text-indigo-700">
            {sub.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-4">
          <Link to="/">
            <img src={LOGO_URL} alt="CSB IAS Academy" className="h-10" />
          </Link>
          <nav className="flex gap-6 text-sm font-medium items-center">
            {NAV.map((item) => (
              <NavItem key={item.label} item={item} />
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

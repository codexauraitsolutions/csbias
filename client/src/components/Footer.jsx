import { Link } from "react-router-dom";
import { useFetch } from "../lib/useFetch.js";
import { api } from "../lib/api.js";

// Served from client/public — see components/Layout.jsx for why this isn't
// a Media Library / uploads path.
const LOGO_URL = "/logo.png";

const SOCIAL_LINKS = [
  { label: "YouTube", href: "http://www.youtube.com/@balalathamadam" },
  { label: "Facebook", href: "https://www.facebook.com/profile.php?id=100063546678172" },
  { label: "WhatsApp", href: "https://shorturl.at/cgtxG" },
  { label: "Instagram", href: "https://www.instagram.com/balalathamallavarapu/" },
  { label: "Telegram", href: "https://t.me/Balalathascsbiasacademy" },
  { label: "X", href: "https://x.com/MissionEkalavya" },
];

const QUICK_LINKS = [
  { label: "Home", to: "/" },
  { label: "About Us", to: "/page/about-us" },
  { label: "Courses", to: "/courses" },
  { label: "Current Affairs", to: "/blog?category=current-affairs" },
  { label: "Monthly Magazines", to: "/blog?category=monthly-magazines" },
  { label: "FAQs", to: "/#faq" },
];

const COURSE_LINKS = [
  { label: "Degree + IAS Integrated Program", to: "/courses?type=degree_civils" },
  { label: "Mission Ekalavya", to: "/courses?type=mission_ekalavya" },
  { label: "Prelims & Mains Test Series", to: "/courses?type=test_series" },
  { label: "General Studies PCM", to: "/courses?type=general_studies_pcm" },
];

function FooterLink({ item }) {
  return item.to ? (
    <Link to={item.to} className="hover:text-white">
      {item.label}
    </Link>
  ) : (
    <a href={item.href} target="_blank" rel="noopener noreferrer" className="hover:text-white">
      {item.label}
    </a>
  );
}

export default function Footer() {
  const { data: branches } = useFetch(() => api.highlights.list("locations"), []);

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <img src={LOGO_URL} alt="CSB IAS Academy" className="h-10 mb-4 bg-white rounded px-2 py-1" />
          <p className="text-sm">
            CSB IAS ACADEMY is committed to shaping future Civil Servants through expert guidance, comprehensive
            study materials, regular test series, and personalized mentorship.
          </p>
          <div className="flex gap-3 mt-4 flex-wrap">
            {SOCIAL_LINKS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs border border-gray-700 rounded px-2 py-1 hover:text-white hover:border-gray-500"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            {QUICK_LINKS.map((l) => (
              <li key={l.label}>
                <FooterLink item={l} />
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-3">Our Courses</h3>
          <ul className="space-y-2 text-sm">
            {COURSE_LINKS.map((l) => (
              <li key={l.label}>
                <FooterLink item={l} />
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-3">Visit Our Branches</h3>
          <ul className="space-y-3 text-sm">
            {branches?.map((b) => (
              <li key={b.id}>
                {b.title && <p className="text-white">{b.title}</p>}
                {b.description && <p className="whitespace-pre-line">{b.description}</p>}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 py-4 text-center text-xs space-x-4">
        <span>© {new Date().getFullYear()} CSB IAS ACADEMY. All Rights Reserved.</span>
        <Link to="/page/privacy" className="hover:text-white">
          Privacy Policy
        </Link>
        <Link to="/page/terms" className="hover:text-white">
          Terms and Condition
        </Link>
      </div>
    </footer>
  );
}

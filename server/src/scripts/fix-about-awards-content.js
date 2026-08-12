// One-off content fix: rebuilds the About Us and Our Awards Page.content
// with real grid/card layout (inline styles, since this HTML is stored in
// the DB and rendered via dangerouslySetInnerHTML — Tailwind classes here
// would never make it into the compiled/purged CSS bundle). Matches the
// live site's structure: Vision/Mission/Values 3-col, stats 4-col,
// Why Choose Us 2-col, and the awards photo grid (same calc()-based
// 3-column pattern already proven working on the Gallery page).
import "dotenv/config";
import { prisma } from "../lib/prisma.js";

const aboutUs = `
<div style="text-align:center; margin-bottom:32px;">
  <p style="color:#4f46e5; font-weight:600; letter-spacing:1px; margin-bottom:8px;">WELCOME TO CSB IAS ACADEMY</p>
  <h1 style="font-size:2rem; font-weight:700; margin-bottom:16px;">Inspiring Dreams, Building Futures</h1>
  <p style="max-width:700px; margin:0 auto; color:#4b5563;">Here we believe in the limitless potential of every aspirant. We are here to shatter the misconceptions surrounding the Civil Services Examination. No matter where you come from or what your background is, if you have the dedication and passion. Success in this prestigious examination is within your reach.</p>
</div>

<div style="display:flex; flex-wrap:wrap; align-items:center; gap:24px; margin:32px 0; padding:24px; background:#f9fafb; border-radius:12px;">
  <img src="/uploads/2025/02/csbias-bala-latha-madam.webp" alt="Bala Latha Madam" style="width:160px; height:160px; border-radius:50%; object-fit:cover; flex-shrink:0;" />
  <div style="flex:1; min-width:220px;">
    <h5 style="font-weight:700; margin-bottom:4px;">BALA LATHA MADAM</h5>
    <p style="color:#6b7280; margin-bottom:12px;">2 times Civils Ranker (2004, 2016)</p>
    <p style="font-style:italic; color:#374151;">&ldquo;Your dream of becoming an IAS officer isn&rsquo;t just a goal&mdash;it&rsquo;s a journey. At CSB IAS Academy, we walk that journey with you, every step of the way.&rdquo;</p>
  </div>
</div>

<div style="display:flex; flex-wrap:wrap; gap:8px; margin:32px 0;">
  <div style="width:calc((100% - 16px)/3); flex-shrink:0; text-align:center; padding:20px; border:1px solid #e5e7eb; border-radius:12px; box-sizing:border-box;">
    <h4 style="font-weight:700; margin-bottom:12px; color:#4f46e5;">Our Vision</h4>
    <p style="color:#4b5563; font-size:0.9rem;">To establish CSB IAS Academy as the leading institute for nurturing and empowering students to achieve their civil services aspirations.</p>
  </div>
  <div style="width:calc((100% - 16px)/3); flex-shrink:0; text-align:center; padding:20px; border:1px solid #e5e7eb; border-radius:12px; box-sizing:border-box;">
    <h4 style="font-weight:700; margin-bottom:12px; color:#4f46e5;">Our Mission</h4>
    <p style="color:#4b5563; font-size:0.9rem;">To mentor, guide, and support UPSC aspirants with a structured approach, equipping them with the knowledge, skills, and confidence needed to succeed.</p>
  </div>
  <div style="width:calc((100% - 16px)/3); flex-shrink:0; text-align:center; padding:20px; border:1px solid #e5e7eb; border-radius:12px; box-sizing:border-box;">
    <h4 style="font-weight:700; margin-bottom:12px; color:#4f46e5;">Our Values</h4>
    <p style="color:#4b5563; font-size:0.9rem;">We uphold transparency, integrity, and excellence, fostering a learning environment where every student of CSB IAS Academy feels proud and motivated to reach their full potential.</p>
  </div>
</div>

<div style="display:flex; flex-wrap:wrap; gap:8px; margin:32px 0; text-align:center; background:#eef2ff; border-radius:12px; padding:24px; box-sizing:border-box;">
  <div style="width:calc((100% - 24px)/4); flex-shrink:0;">
    <p style="font-size:1.75rem; font-weight:700; color:#4f46e5; margin-bottom:2px;">50K</p>
    <p style="color:#4b5563; font-size:0.85rem;">Student enrolled</p>
  </div>
  <div style="width:calc((100% - 24px)/4); flex-shrink:0;">
    <p style="font-size:1.75rem; font-weight:700; color:#4f46e5; margin-bottom:2px;">30K</p>
    <p style="color:#4b5563; font-size:0.85rem;">Class completed</p>
  </div>
  <div style="width:calc((100% - 24px)/4); flex-shrink:0;">
    <p style="font-size:1.75rem; font-weight:700; color:#4f46e5; margin-bottom:2px;">90%</p>
    <p style="color:#4b5563; font-size:0.85rem;">Satisfaction rate</p>
  </div>
  <div style="width:calc((100% - 24px)/4); flex-shrink:0;">
    <p style="font-size:1.75rem; font-weight:700; color:#4f46e5; margin-bottom:2px;">200K</p>
    <p style="color:#4b5563; font-size:0.85rem;">Top instructors</p>
  </div>
</div>

<h2 style="text-align:center; font-size:1.5rem; font-weight:700; margin:32px 0 20px;">Why Choose Us</h2>
<div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:32px;">
  <div style="width:calc((100% - 8px)/2); flex-shrink:0; padding:20px; border:1px solid #e5e7eb; border-radius:12px; box-sizing:border-box;">
    <h4 style="font-weight:700; margin-bottom:8px;">20+ Years of Excellence</h4>
    <p style="color:#4b5563; font-size:0.9rem;">Over 20 years of UPSC coaching experience, a proven track record of success, and a commitment to helping you achieve your dream of becoming an IAS officer.</p>
  </div>
  <div style="width:calc((100% - 8px)/2); flex-shrink:0; padding:20px; border:1px solid #e5e7eb; border-radius:12px; box-sizing:border-box;">
    <h4 style="font-weight:700; margin-bottom:8px;">Achieve Your IAS Dream</h4>
    <p style="color:#4b5563; font-size:0.9rem;">Join our academy and become an IAS officer&mdash;where 150+ rankers have trained and succeeded.</p>
  </div>
  <div style="width:calc((100% - 8px)/2); flex-shrink:0; padding:20px; border:1px solid #e5e7eb; border-radius:12px; box-sizing:border-box;">
    <h4 style="font-weight:700; margin-bottom:8px;">Happy Students</h4>
    <p style="color:#4b5563; font-size:0.9rem;">Proudly nurturing a community of 10,000+ happy students, united by success and excellence.</p>
  </div>
  <div style="width:calc((100% - 8px)/2); flex-shrink:0; padding:20px; border:1px solid #e5e7eb; border-radius:12px; box-sizing:border-box;">
    <h4 style="font-weight:700; margin-bottom:8px;">Creating a Positive Impact</h4>
    <p style="color:#4b5563; font-size:0.9rem;">Making a difference in society with a positive impact on over 5 lakh lives and counting.</p>
  </div>
</div>

<div style="text-align:center; background:#111827; color:#fff; border-radius:12px; padding:40px 20px;">
  <p style="text-transform:uppercase; letter-spacing:1px; color:#a5b4fc; margin-bottom:8px; font-size:0.85rem;">Book A Free Counseling Session</p>
  <h2 style="font-size:1.4rem; font-weight:700; margin-bottom:12px;">Take the First Step Toward Your UPSC Dream!</h2>
  <p style="color:#d1d5db; max-width:600px; margin:0 auto 20px; font-size:0.9rem;">Join CSB IAS Academy and turn your aspirations into achievements with expert guidance and proven strategies. Whether you&rsquo;re just starting or need the right push to reach the finish line, we are here to support your success.</p>
  <a href="/contact" style="display:inline-block; background:#4f46e5; color:#fff; padding:10px 24px; border-radius:8px; font-weight:600; text-decoration:none;">GET STARTED</a>
</div>
`;

const awards = [
  {
    src: "/uploads/2025/03/WhatsApp_Image_2024-04-27_at_17_46_40.jpeg",
    caption: "Felicitated by Honourable Telangana CM Revanth Reddy on Occasion of Sripada Rao Award Ceremony - 2024",
  },
  {
    src: "/uploads/2025/03/JAGAN.png",
    caption: "Felicitation by Hon'ble AP Chief Minister Shri. Y S Jagan Mohan Reddy, at Ugadi Puraskar, 2023",
  },
  {
    src: "/uploads/2025/03/harish_raoooo.png",
    caption: "Felicitating our 2021 Rankers by Hon'ble Telanaga Finance Minister Shri. Harish Rao Garu",
  },
  {
    src: "/uploads/2025/03/governor.png",
    caption:
      "Hon'ble Governor of Telangana Dr.(Smt) Tamilisai Soundararajan Presenting Education and Youth Empowerment Award (2023)",
  },
  {
    src: "/uploads/2025/03/chandra_babu.png",
    caption: "Felicitation by Hon'ble Ap Chief Minister Shri. Nara Chandrababu Naidu, on Securing Air-167, 2016",
  },
  {
    src: "/uploads/2025/03/award.png",
    caption: "Felicitations Hon'ble Himachal pradesh Governor Sri Bandaru Dattatreya On Women's Day at Raj Bhavan",
  },
];

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

const ourAwards = `
<div style="display:flex; flex-wrap:wrap; gap:16px;">
${awards
  .map(
    (a) => `  <figure style="width:calc((100% - 32px)/3); flex-shrink:0; margin:0; box-sizing:border-box;">
    <img src="${a.src}" alt="${escapeHtml(a.caption)}" style="width:100%; aspect-ratio:4/3; object-fit:cover; border-radius:8px; display:block;" />
    <figcaption style="font-size:0.8rem; color:#4b5563; margin-top:8px; text-align:center;">${escapeHtml(a.caption)}</figcaption>
  </figure>`
  )
  .join("\n")}
</div>
`;

await prisma.page.update({ where: { slug: "about-us" }, data: { content: aboutUs } });
await prisma.page.update({ where: { slug: "our-awards" }, data: { content: ourAwards } });
console.log("Updated about-us and our-awards content.");
await prisma.$disconnect();

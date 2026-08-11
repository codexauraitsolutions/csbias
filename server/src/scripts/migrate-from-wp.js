// One-time data migration: WordPress (wp_*) -> new Prisma/MySQL schema.
//
// Prerequisites:
//   1. Import the WordPress .sql dump into a *staging* MySQL database (do not
//      point this at production). Set WP_DATABASE_URL in server/.env to that DB.
//   2. `npm run prisma:migrate` in server/ so the new schema tables exist in
//      DATABASE_URL first.
//
// Usage: npm run migrate:wp --workspace=server
import "dotenv/config";
import mysql from "mysql2/promise";
import slugify from "slugify";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { RESOURCES } from "../lib/auth.js";

const wpUrl = process.env.WP_DATABASE_URL;
if (!wpUrl) throw new Error("Set WP_DATABASE_URL in server/.env before running this script");

const wp = await mysql.createConnection(wpUrl);

// WordPress stores post_title (and similar plain-text fields) with HTML entities
// encoded, e.g. "Prelims &amp; Mains". Decode them for fields the frontend renders
// as plain text — HTML fields (content/description) don't need this since the
// browser decodes entities natively when it parses the markup.
function decodeEntities(str) {
  if (!str) return str;
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)));
}

function uniqueSlug(base, seen) {
  let slug = slugify(base || "untitled", { lower: true, strict: true }) || "untitled";
  slug = slug.slice(0, 180); // keep URL slugs sane and safely under the column's unique-index limit
  let candidate = slug;
  let i = 2;
  while (seen.has(candidate)) candidate = `${slug}-${i++}`;
  seen.add(candidate);
  return candidate;
}

// The PDF Embedder Gutenberg block is dynamic/server-rendered: WordPress saves
// `<!-- wp:pdfemb/pdf-embedder-viewer {"pdfID":..,"url":".."} /-->` (sometimes with
// no attributes at all) instead of real markup, so the raw post_content we copy
// out has an invisible HTML comment where a PDF viewer used to be. Replace it with
// a real <iframe> embed, resolving the file via the attachment's guid when only
// pdfID is present. Where WordPress saved neither (no plugin table exists in this
// export to recover it from), leave a visible note instead of silently dropping it.
async function resolvePdfEmbeds(content) {
  if (!content || !content.includes("wp:pdfemb")) return content;

  const blockRegex = /<!--\s*wp:pdfemb\/pdf-embedder-viewer(?:\s+(\{[^}]*\}))?\s*\/-->/g;
  let result = "";
  let lastIndex = 0;

  for (const match of content.matchAll(blockRegex)) {
    result += content.slice(lastIndex, match.index);
    lastIndex = match.index + match[0].length;

    let url = null;
    if (match[1]) {
      try {
        const attrs = JSON.parse(match[1]);
        url = attrs.url || null;
        if (!url && attrs.pdfID) {
          const [[attachment]] = await wp.query("SELECT guid FROM wp_posts WHERE ID = ?", [attrs.pdfID]);
          url = attachment?.guid ?? null;
        }
      } catch {
        // malformed attribute JSON — falls through to the "could not be recovered" note below
      }
    }

    result += url
      ? `<div class="pdf-embed" style="margin:1.5em 0;"><iframe src="https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true" width="100%" height="600" style="border:1px solid #ddd;border-radius:8px;"></iframe><p><a href="${url}" target="_blank" rel="noopener noreferrer">Download PDF</a></p></div>`
      : `<p><em>[PDF attachment could not be recovered from the WordPress export — please re-attach]</em></p>`;
  }
  result += content.slice(lastIndex);
  return result;
}

async function thumbnailUrl(postId) {
  const [[meta]] = await wp.query(
    "SELECT meta_value FROM wp_postmeta WHERE post_id = ? AND meta_key = '_thumbnail_id' LIMIT 1",
    [postId]
  );
  if (!meta) return null;
  const [[attachment]] = await wp.query("SELECT guid FROM wp_posts WHERE ID = ?", [meta.meta_value]);
  return attachment?.guid ?? null;
}

async function migratePosts() {
  const [rows] = await wp.query(
    "SELECT ID, post_title, post_excerpt, post_content, post_status, post_date, post_name FROM wp_posts WHERE post_type = 'post' AND post_status IN ('publish','draft')"
  );
  const seenSlugs = new Set();
  let count = 0;

  for (const row of rows) {
    const [terms] = await wp.query(
      `SELECT t.name, t.slug FROM wp_term_relationships tr
       JOIN wp_term_taxonomy tt ON tt.term_taxonomy_id = tr.term_taxonomy_id
       JOIN wp_terms t ON t.term_id = tt.term_id
       WHERE tr.object_id = ? AND tt.taxonomy = 'category'`,
      [row.ID]
    );

    const categories = await Promise.all(
      terms.map((t) =>
        prisma.category.upsert({
          where: { slug: t.slug },
          update: { name: decodeEntities(t.name) },
          create: { name: decodeEntities(t.name), slug: t.slug },
        })
      )
    );

    const data = {
      title: decodeEntities(row.post_title),
      slug: row.post_name ? uniqueSlug(row.post_name, seenSlugs) : uniqueSlug(row.post_title, seenSlugs),
      excerpt: decodeEntities(row.post_excerpt) || null,
      content: await resolvePdfEmbeds(row.post_content),
      featuredImg: await thumbnailUrl(row.ID),
      status: row.post_status === "publish" ? "published" : "draft",
      publishedAt: row.post_status === "publish" ? row.post_date : null,
      categories: { set: categories.map((c) => ({ id: c.id })) },
    };
    await prisma.post.upsert({
      where: { wpPostId: row.ID },
      update: data,
      create: { wpPostId: row.ID, ...data, categories: { connect: categories.map((c) => ({ id: c.id })) } },
    });
    count++;
  }
  console.log(`Migrated ${count} blog posts`);
}

// Each WP category consistently reused one template image across nearly every
// post in it (e.g. all "Daily Current Affairs" posts share the same cover
// photo) — not an explicit WP feature, just an editorial habit, but real
// enough in the data to use as the auto-filled Featured Image when an admin
// picks that category on a new post. Derived from our own migrated posts
// (not WP directly) since it's the most-common value, not a single field.
async function deriveCategoryDefaultImages() {
  const categories = await prisma.category.findMany({ include: { posts: { select: { featuredImg: true } } } });
  let count = 0;

  for (const category of categories) {
    const tally = new Map();
    for (const { featuredImg } of category.posts) {
      if (!featuredImg) continue;
      tally.set(featuredImg, (tally.get(featuredImg) || 0) + 1);
    }
    if (tally.size === 0) continue;

    const [mostCommonImage] = [...tally.entries()].sort((a, b) => b[1] - a[1])[0];
    if (mostCommonImage !== category.defaultImage) {
      await prisma.category.update({ where: { id: category.id }, data: { defaultImage: mostCommonImage } });
      count++;
    }
  }
  console.log(`Set default images for ${count} categories`);
}

async function migratePages() {
  const [rows] = await wp.query(
    "SELECT ID, post_title, post_content, post_status, post_name FROM wp_posts WHERE post_type = 'page' AND post_status IN ('publish','draft')"
  );
  const seenSlugs = new Set();
  let count = 0;

  for (const row of rows) {
    const data = {
      title: decodeEntities(row.post_title),
      slug: row.post_name ? uniqueSlug(row.post_name, seenSlugs) : uniqueSlug(row.post_title, seenSlugs),
      content: await resolvePdfEmbeds(row.post_content),
      status: row.post_status === "publish" ? "published" : "draft",
    };
    await prisma.page.upsert({
      where: { wpPostId: row.ID },
      update: data,
      create: { wpPostId: row.ID, ...data },
    });
    count++;
  }
  console.log(`Migrated ${count} pages`);
}

// The "Courses" nav dropdown links to 4 dedicated course post types, not the
// generic "course" CPT alone — each row's own post_type becomes courseType so
// the frontend dropdown/filter can group by it the same way the WP menu did.
const COURSE_POST_TYPES = ["course", "lp_course", "general_studies_pcm", "test_series", "mission_ekalavya", "degree_civils"];

async function migrateCourses() {
  const [rows] = await wp.query(
    `SELECT ID, post_title, post_excerpt, post_content, post_status, post_name, post_type FROM wp_posts WHERE post_type IN (${COURSE_POST_TYPES.map(() => "?").join(",")}) AND post_status IN ('publish','draft')`,
    COURSE_POST_TYPES
  );
  const seenSlugs = new Set();
  let count = 0;

  for (const row of rows) {
    const data = {
      title: decodeEntities(row.post_title),
      slug: row.post_name ? uniqueSlug(row.post_name, seenSlugs) : uniqueSlug(row.post_title, seenSlugs),
      summary: decodeEntities(row.post_excerpt) || null,
      description: await resolvePdfEmbeds(row.post_content),
      thumbnail: await thumbnailUrl(row.ID),
      courseType: ["course", "lp_course"].includes(row.post_type) ? null : row.post_type,
      status: row.post_status === "publish" ? "published" : "draft",
    };
    await prisma.course.upsert({
      where: { wpPostId: row.ID },
      update: data,
      create: { wpPostId: row.ID, ...data },
    });
    count++;
  }
  console.log(`Migrated ${count} courses`);
}

async function migrateQuizzes() {
  const [quizRows] = await wp.query("SELECT * FROM wp_aysquiz_quizes");
  const seenSlugs = new Set();

  for (const q of quizRows) {
    const quizData = {
      title: decodeEntities(q.title),
      slug: uniqueSlug(q.title, seenSlugs),
      description: decodeEntities(q.description) || null,
      status: q.published ? "published" : "draft",
    };
    const quiz = await prisma.quiz.upsert({
      where: { wpQuizId: q.id },
      update: quizData,
      create: { wpQuizId: q.id, ...quizData, createdAt: q.create_date || new Date() },
    });

    // question_ids is a delimited list (comma or JSON array depending on AYS version)
    let questionIds = [];
    try {
      questionIds = JSON.parse(q.question_ids);
    } catch {
      questionIds = String(q.question_ids || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    let order = 0;
    for (const qid of questionIds) {
      const [[question]] = await wp.query("SELECT * FROM wp_aysquiz_questions WHERE id = ?", [qid]);
      if (!question) continue;

      const [answers] = await wp.query(
        "SELECT id, answer, correct, ordering FROM wp_aysquiz_answers WHERE question_id = ? ORDER BY ordering ASC",
        [qid]
      );
      const correct = answers.find((a) => a.correct);

      const questionData = {
        quizId: quiz.id,
        question: decodeEntities(question.question),
        options: answers.map((a) => ({ id: String(a.id), text: decodeEntities(a.answer) })),
        correctOption: correct ? String(correct.id) : "",
        order: order++,
      };
      await prisma.quizQuestion.upsert({
        where: { wpQuestionId: question.id },
        update: questionData,
        create: { wpQuestionId: question.id, ...questionData },
      });
    }
  }
  console.log(`Migrated ${quizRows.length} quizzes`);
}

async function migrateEvents() {
  const [rows] = await wp.query(
    `SELECT e.event_id, e.post_id, e.start_date, e.end_date, p.post_title, p.post_content, p.post_status, p.post_name
     FROM wp_tec_events e JOIN wp_posts p ON p.ID = e.post_id`
  );
  const seenSlugs = new Set();

  for (const row of rows) {
    const data = {
      title: decodeEntities(row.post_title),
      slug: row.post_name ? uniqueSlug(row.post_name, seenSlugs) : uniqueSlug(row.post_title, seenSlugs),
      description: row.post_content ? await resolvePdfEmbeds(row.post_content) : null,
      startAt: new Date(row.start_date),
      endAt: row.end_date ? new Date(row.end_date) : null,
      status: row.post_status === "publish" ? "published" : "draft",
    };
    await prisma.event.upsert({
      where: { wpEventId: row.event_id },
      update: data,
      create: { wpEventId: row.event_id, ...data },
    });
  }
  console.log(`Migrated ${rows.length} events`);
}

// The homepage hero banner is an Elementor "Slides" widget (background-image
// slides, no separate media-library attachments) buried in the front page's
// _elementor_data JSON blob — not a WP post type, so there's nothing to join
// against. We resolve the static front page from wp_options and pull its first
// Slides widget out of the widget tree.
function findElementorWidgets(nodes, widgetType, out) {
  for (const node of nodes) {
    if (node.widgetType === widgetType) out.push(node);
    if (node.elements) findElementorWidgets(node.elements, widgetType, out);
  }
}

let cachedHomepageWidgetTree;
async function getHomepageWidgetTree() {
  if (cachedHomepageWidgetTree !== undefined) return cachedHomepageWidgetTree;

  const [[frontPageOpt]] = await wp.query("SELECT option_value FROM wp_options WHERE option_name = 'page_on_front'");
  const frontPageId = frontPageOpt ? Number(frontPageOpt.option_value) : null;
  if (!frontPageId) {
    console.log("No static front page configured — skipping homepage content migration");
    return (cachedHomepageWidgetTree = null);
  }

  const [[elementorMeta]] = await wp.query(
    "SELECT meta_value FROM wp_postmeta WHERE post_id = ? AND meta_key = '_elementor_data'",
    [frontPageId]
  );
  if (!elementorMeta) {
    console.log("Homepage has no Elementor data — skipping homepage content migration");
    return (cachedHomepageWidgetTree = null);
  }

  try {
    return (cachedHomepageWidgetTree = JSON.parse(elementorMeta.meta_value));
  } catch {
    console.log("Homepage Elementor data was not valid JSON — skipping homepage content migration");
    return (cachedHomepageWidgetTree = null);
  }
}

async function migrateSlides() {
  const widgetTree = await getHomepageWidgetTree();
  if (!widgetTree) return;

  const slidesWidgets = [];
  findElementorWidgets(widgetTree, "slides", slidesWidgets);
  if (slidesWidgets.length === 0) {
    console.log("No Elementor Slides widget found on the homepage — skipping slider migration");
    return;
  }

  const rawSlides = slidesWidgets[0].settings?.slides || [];
  let order = 0;
  let count = 0;
  for (const s of rawSlides) {
    const imageUrl = s.background_image?.url;
    if (!imageUrl) continue;

    const existing = await prisma.slide.findFirst({ where: { imageUrl } });
    if (!existing) {
      await prisma.slide.create({
        data: { imageUrl, linkUrl: s.button_link?.url || null, order, status: "published" },
      });
      count++;
    }
    order++;
  }
  console.log(`Migrated ${count} new homepage slides`);
}

// "Latest Updates" marquee ticker — an elementskit-content-ticker widget with a
// clean list of {icon, text, link} items.
async function migrateLatestUpdates() {
  const widgetTree = await getHomepageWidgetTree();
  if (!widgetTree) return;

  const tickers = [];
  findElementorWidgets(widgetTree, "elementskit-content-ticker", tickers);
  if (tickers.length === 0) return;

  const items = tickers[0].settings?.ekit_content_ticker_text_list || [];
  let count = 0;
  for (const [i, item] of items.entries()) {
    const title = decodeEntities(item.ekit_content_ticker_text?.trim());
    if (!title) continue;

    const existing = await prisma.homeHighlight.findFirst({ where: { group: "latest_updates", title } });
    if (!existing) {
      await prisma.homeHighlight.create({
        data: {
          group: "latest_updates",
          title,
          imageUrl: item.ekit_content_ticker_image_choose?.url || null,
          linkUrl: item.ekit_content_ticker_text_url?.url || null,
          order: i,
          status: "published",
        },
      });
      count++;
    }
  }
  console.log(`Migrated ${count} new "Latest Updates" ticker items`);
}

// "Why Choose Us" / exam-stages / branch-locations icon boxes. WordPress mixes
// all of these into one repeating elementskit-icon-box widget type with no
// group label of its own, so we bucket by position to match the homepage's
// actual visual sections (9 feature items, then 3 exam-stage items, then 6
// branch/contact items).
// Maps this homepage's specific icon-font references to the classes defined in
// client/src/lib/icon-fonts.css, which self-hosts the actual WordPress theme/
// plugin font files (thim-ekits, elementskit/ekiticons) pulled from the export.
// mdi/icofont icons are substituted with the closest Font Awesome equivalent
// rather than shipping two more whole icon-font libraries for one glyph each.
const ICON_CLASS_MAP = {
  "thim-ekits-fonts:tk tk-learning1": "tk tk-learning1",
  "thim-ekits-fonts:tk tk-exam": "tk tk-exam",
  "ekiticons:icon icon-Rating": "ek icon-Rating",
  "ekiticons:icon icon-page-list": "ek icon-page-list",
  "ekiticons:icon icon-Document-Search": "ek icon-Document-Search",
  "ekiticons:icon icon-star": "ek icon-star",
  "fa-solid:fas fa-chalkboard": "fa fa-chalkboard",
  "skb_cife-icofont-icon:icofont icofont-recycle": "fa fa-recycle",
  "skb_cife-materialdesign-icon:mdi mdi-account-group": "fa fa-users",
};

async function migrateHomeHighlights() {
  const widgetTree = await getHomepageWidgetTree();
  if (!widgetTree) return;

  const boxes = [];
  findElementorWidgets(widgetTree, "elementskit-icon-box", boxes);
  if (boxes.length === 0) return;

  const groupFor = (i) => (i < 9 ? "why_choose_us" : i < 12 ? "exam_stages" : "locations");

  let count = 0;
  for (const [i, box] of boxes.entries()) {
    const s = box.settings || {};
    const title = decodeEntities(s.ekit_icon_box_title_text?.trim()) || null;
    const description = decodeEntities(s.ekit_icon_box_description_text?.trim()) || null;
    if (!title && !description) continue;

    const multi = s.ekit_icon_box_header_icons;
    const iconKey = multi ? `${multi.library}:${multi.value}` : null;

    const group = groupFor(i);
    const existing = await prisma.homeHighlight.findFirst({ where: { group, title, description } });
    if (!existing) {
      await prisma.homeHighlight.create({
        data: {
          group,
          title,
          description,
          imageUrl: s.ekit_icon_box_header_image?.url?.includes("placeholder.png")
            ? null
            : s.ekit_icon_box_header_image?.url || null,
          iconClass: iconKey ? ICON_CLASS_MAP[iconKey] || null : null,
          variant: s.ekit_icon_box_icon_primary_color === "#FFFFFF" ? "dark" : "light",
          order: i,
          status: "published",
        },
      });
      count++;
    }
  }
  console.log(`Migrated ${count} new homepage highlight items (why-choose-us / exam stages / locations)`);
}

// "Why Choose CSB IAS ACADEMY?" stat cards (20+ Years of Excellence, 10,000+
// Happy Students, etc.) — a ucaddon_icon_carousel widget with HTML-wrapped content.
// Icons here use Material Design Icons / Line Awesome, both substituted with
// the closest Font Awesome equivalent (same reasoning as ICON_CLASS_MAP above —
// not worth two more whole font libraries for 4 icons).
const STATS_ICON_MAP = {
  "skb_cife-materialdesign-icon:mdi mdi-account-star-outline": "fa fa-award",
  "skb_cife-materialdesign-icon:mdi mdi-account-tie-outline": "fa fa-user-tie",
  "skb_cife-lineawesome-icon: las la-users": "fa fa-users",
  "skb_cife-materialdesign-icon:mdi mdi-star-face": "fa fa-star",
};

async function migrateStats() {
  const widgetTree = await getHomepageWidgetTree();
  if (!widgetTree) return;

  const carousels = [];
  findElementorWidgets(widgetTree, "ucaddon_icon_carousel", carousels);
  if (carousels.length === 0) return;

  const items = carousels[0].settings?.uc_items || [];
  let count = 0;
  for (const [i, item] of items.entries()) {
    const title = decodeEntities(item.title?.trim());
    if (!title) continue;
    const description = decodeEntities(item.content?.replace(/<\/?p>/g, "").trim()) || null;
    const iconKey = item.icon ? `${item.icon.library}:${item.icon.value}` : null;

    const existing = await prisma.homeHighlight.findFirst({ where: { group: "stats", title } });
    if (!existing) {
      await prisma.homeHighlight.create({
        data: {
          group: "stats",
          title,
          description,
          iconClass: iconKey ? STATS_ICON_MAP[iconKey] || null : null,
          order: i,
          status: "published",
        },
      });
      count++;
    }
  }
  console.log(`Migrated ${count} new "Why Choose Us" stat cards`);
}

// "Comprehensive UPSC Study Materials" section — 9 subject cards (Indian Polity,
// Governance, History, Geography, etc.), an elementskit-image-box widget.
async function migrateStudyMaterials() {
  const widgetTree = await getHomepageWidgetTree();
  if (!widgetTree) return;

  const boxes = [];
  findElementorWidgets(widgetTree, "elementskit-image-box", boxes);
  if (boxes.length === 0) return;

  let count = 0;
  for (const [i, box] of boxes.entries()) {
    const s = box.settings || {};
    const title = decodeEntities(s.ekit_image_box_title_text?.trim()) || null;
    const description = decodeEntities(s.ekit_image_box_description_text?.trim()) || null;
    if (!title && !description) continue;

    const existing = await prisma.homeHighlight.findFirst({ where: { group: "study_materials", title } });
    if (!existing) {
      await prisma.homeHighlight.create({
        data: {
          group: "study_materials",
          title,
          description,
          imageUrl: s.ekit_image_box_image?.url || null,
          order: i,
          status: "published",
        },
      });
      count++;
    }
  }
  console.log(`Migrated ${count} new study material subject cards`);
}

async function migrateTestimonials() {
  const widgetTree = await getHomepageWidgetTree();
  if (!widgetTree) return;

  const widgets = [];
  findElementorWidgets(widgetTree, "elementskit-testimonial", widgets);
  if (widgets.length === 0) return;

  const items = widgets[0].settings?.ekit_testimonial_data || [];
  let count = 0;
  for (const [i, item] of items.entries()) {
    const name = decodeEntities(item.client_name?.trim());
    if (!name) continue;

    const existing = await prisma.testimonial.findFirst({ where: { name, review: decodeEntities(item.review) } });
    if (!existing) {
      await prisma.testimonial.create({
        data: {
          name,
          designation: decodeEntities(item.designation) || null,
          review: decodeEntities(item.review) || "",
          photoUrl: item.client_photo?.url || null,
          linkUrl: item.link?.url || null,
          order: i,
          status: "published",
        },
      });
      count++;
    }
  }
  console.log(`Migrated ${count} new testimonials`);
}

async function migrateFaqs() {
  const widgetTree = await getHomepageWidgetTree();
  if (!widgetTree) return;

  const widgets = [];
  findElementorWidgets(widgetTree, "elementskit-faq", widgets);
  if (widgets.length === 0) return;

  let order = 0;
  let count = 0;
  for (const widget of widgets) {
    const items = widget.settings?.ekit_faq_content_items || [];
    for (const item of items) {
      const question = decodeEntities(item.ekit_faq_title?.trim());
      if (!question) continue;

      const existing = await prisma.faq.findFirst({ where: { question } });
      if (!existing) {
        await prisma.faq.create({
          data: {
            question,
            answer: decodeEntities(item.ekit_faq_content) || "",
            order: order,
            status: "published",
          },
        });
        count++;
      }
      order++;
    }
  }
  console.log(`Migrated ${count} new FAQ items`);
}

// Real WordPress admin/editor accounts (wp_users + wp_usermeta capabilities),
// not a made-up login. WordPress hashes passwords with phpass, a one-way
// scheme incompatible with — and weaker than — bcrypt, so the original
// password can't be recovered or carried over. Each migrated account instead
// gets a fresh, randomly generated password, written to a local-only file
// (never printed here, so it never ends up in a chat transcript or log).
async function migrateAdminUsers() {
  const [users] = await wp.query("SELECT ID, user_login, user_email FROM wp_users");
  if (users.length === 0) return;

  const credentials = [];
  let count = 0;

  for (const u of users) {
    const [[metaRow]] = await wp.query(
      "SELECT meta_value FROM wp_usermeta WHERE user_id = ? AND meta_key LIKE '%capabilities'",
      [u.ID]
    );
    const capabilities = metaRow?.meta_value || "";
    if (!/administrator|editor/.test(capabilities)) continue; // skip subscriber-only accounts

    const existing = await prisma.adminUser.findUnique({ where: { email: u.user_email } });
    if (existing) continue; // never overwrite a password someone may already be using

    // Real WP capability, not our new super_admin/admin split — every migrated
    // account lands as "admin" with full permissions by default (matching the
    // broad access they already had on WordPress). The site owner can shrink
    // any of these to specific sections afterward from the Users page.
    const tempPassword = crypto.randomBytes(9).toString("base64url"); // 12 random chars
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    await prisma.adminUser.create({
      data: { name: u.user_login, email: u.user_email, passwordHash, role: "admin", permissions: RESOURCES },
    });
    credentials.push({ email: u.user_email, tempPassword, role: "admin" });
    count++;
  }

  if (credentials.length > 0) {
    const outPath = path.resolve("ADMIN_CREDENTIALS.local.txt");
    const lines = credentials.map((c) => `${c.email}  (${c.role})  temp password: ${c.tempPassword}`);
    fs.writeFileSync(
      outPath,
      `Generated ${new Date().toISOString()} — share these with each person, then delete this file.\nEach person should change their password after first login.\n\n${lines.join("\n")}\n`
    );
    console.log(`Created ${count} admin accounts from wp_users. Temporary passwords written to ${outPath} (not shown here).`);
  } else {
    console.log("No new admin accounts to create (already migrated or no eligible wp_users).");
  }
}

try {
  await migrateAdminUsers();
  await migratePosts();
  await deriveCategoryDefaultImages();
  await migratePages();
  await migrateCourses();
  await migrateQuizzes();
  await migrateEvents();
  await migrateSlides();
  await migrateLatestUpdates();
  await migrateHomeHighlights();
  await migrateStats();
  await migrateStudyMaterials();
  await migrateTestimonials();
  await migrateFaqs();
  console.log("Migration complete.");
  console.log(
    "Next: copy wp-content/uploads/* into server/uploads, then run `npm run import:media --workspace=server`."
  );
} finally {
  await wp.end();
  await prisma.$disconnect();
}

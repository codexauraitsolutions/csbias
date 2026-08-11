// One-off migration: pulls the "sby_videos" custom post type (a cache table
// written by the Smash Balloon YouTube Feed plugin) out of the WordPress
// export and into HomeHighlight(group="videos"), so the channel's real
// video list is admin-manageable data instead of screen-scraped HTML.
//
// Usage: node src/scripts/migrate-videos.js
import "dotenv/config";
import mysql from "mysql2/promise";
import { prisma } from "../lib/prisma.js";

const wpUrl = process.env.WP_DATABASE_URL;
if (!wpUrl) throw new Error("Set WP_DATABASE_URL in server/.env before running this script");

const wp = await mysql.createConnection(wpUrl);

function decodeEntities(str) {
  return (str || "")
    .replace(/&amp;/g, "&")
    .replace(/&#8217;/g, "’")
    .replace(/&#8211;/g, "–")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}

async function main() {
  const [rows] = await wp.query(`
    SELECT p.ID, p.post_title, p.post_date,
      MAX(CASE WHEN m.meta_key = 'sby_video_id' THEN m.meta_value END) AS video_id
    FROM wp_posts p
    JOIN wp_postmeta m ON m.post_id = p.ID
    WHERE p.post_type = 'sby_videos'
    GROUP BY p.ID
    HAVING video_id IS NOT NULL AND video_id != ''
    ORDER BY p.post_date DESC
  `);

  await prisma.homeHighlight.deleteMany({ where: { group: "videos" } });

  let order = 0;
  for (const row of rows) {
    await prisma.homeHighlight.create({
      data: {
        group: "videos",
        title: decodeEntities(row.post_title).slice(0, 300),
        imageUrl: `https://i.ytimg.com/vi/${row.video_id}/hqdefault.jpg`,
        linkUrl: `https://www.youtube.com/watch?v=${row.video_id}`,
        order: order++,
        status: "published",
      },
    });
  }

  console.log(`Migrated ${rows.length} videos into HomeHighlight(group="videos").`);
}

try {
  await main();
} finally {
  await wp.end();
  await prisma.$disconnect();
}

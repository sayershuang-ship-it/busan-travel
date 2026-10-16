// 產生 public/data/routes.json（commit 進 repo，頁面執行時不依賴 OSRM）
//   node scripts/build-routes.mjs           只抓缺的段落
//   node scripts/build-routes.mjs --refresh 全部重抓
//   node scripts/build-routes.mjs --check   不連網，只列出缺的段落（prebuild 用）
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { trip } from '../src/data/itinerary.js';
import { buildTimeline } from '../src/lib/live/timeline.js';
import { buildSegments } from '../src/lib/live/segments.js';
import { fetchRoute } from '../src/lib/live/osrm.js';

const OUT = new URL('../public/data/routes.json', import.meta.url);
const args = new Set(process.argv.slice(2));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const tl = buildTimeline(trip);
const drive = [...new Map(buildSegments(tl).filter((s) => s.mode === 'drive').map((s) => [s.key, s])).values()];
const label = (s) => `Day ${s.day}「${tl[s.fromSeq].title}」→「${tl[s.toSeq].title}」`;

let old = {};
try { old = JSON.parse(await readFile(OUT, 'utf8')).routes ?? {}; } catch { /* 第一次產生 */ }

if (args.has('--check')) {
  const missing = drive.filter((s) => !old[s.key]);
  console.log(`routes.json：${drive.length - missing.length}／${drive.length} 段開車路線已就緒`);
  for (const s of missing) console.warn(`  缺路線（頁面會畫直線）：${label(s)}`);
  process.exit(0);
}

const routes = {};
const failed = [];
for (const s of drive) {
  if (!args.has('--refresh') && old[s.key]) { routes[s.key] = old[s.key]; continue; }
  const r = await fetchRoute(s.from, s.to);
  if (r) routes[s.key] = r; else failed.push(s);
  await sleep(1100); // 公用伺服器，一秒最多一次
}

await mkdir(new URL('./', OUT), { recursive: true });
await writeFile(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), source: 'router.project-osrm.org driving', routes }) + '\n');
console.log(`OSRM 路線：成功 ${Object.keys(routes).length}／${drive.length} 段`);
for (const s of failed) console.warn(`  ✗ 失敗（頁面會畫直線）：${label(s)}`);

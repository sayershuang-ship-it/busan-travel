// 行程時間軸：activity 的 "HH:MM" 一律是首爾時間，除非該筆有 utcOffset（桃園起飛是台灣時間）
const SEOUL = '+09:00';
const SEOUL_MS = 9 * 3600 * 1000;
const DAY_MS = 24 * 3600 * 1000;
const pad = (n) => String(n).padStart(2, '0');

export function dayDate(startDate, day) {
  const d = new Date(`${startDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + day - 1);
  return d.toISOString().slice(0, 10);
}

export function buildTimeline(trip) {
  return trip.days
    .flatMap((d) => d.activities.map((a, index) => ({
      ...a,
      day: d.day,
      index,
      startMs: Date.parse(`${dayDate(trip.startDate, d.day)}T${a.time}:00${a.utcOffset ?? SEOUL}`),
    })))
    .map((s, seq) => ({ ...s, seq }));
}

export function findNowNext(timeline, tMs) {
  let i = -1;
  for (let k = 0; k < timeline.length; k++) if (timeline[k].startMs <= tMs) i = k;
  return { now: timeline[i] ?? null, next: timeline[i + 1] ?? null };
}

export function parseSeoulLocal(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(s ?? '');
  if (!m || +m[2] > 12 || +m[3] > 31 || +m[4] > 23 || +m[5] > 59) return null;
  const ms = Date.parse(`${s}:00${SEOUL}`);
  return Number.isNaN(ms) ? null : ms;
}

export function tripRange(trip) {
  const first = dayDate(trip.startDate, 1);
  const last = dayDate(trip.startDate, trip.days.length);
  return { startMs: Date.parse(`${first}T00:00:00${SEOUL}`), endMs: Date.parse(`${last}T23:59:59${SEOUL}`) };
}

export function dayOf(trip, tMs) {
  const n = Math.floor((tMs - tripRange(trip).startMs) / DAY_MS) + 1;
  return Math.min(Math.max(n, 1), trip.days.length);
}

export function formatSeoul(ms) {
  const d = new Date(ms + SEOUL_MS);
  return `${pad(d.getUTCMonth() + 1)}/${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

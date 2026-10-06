/* TripTools — 共用前端資料層：計畫覆寫、訂單彙整、ICS 匯出、分享連結 */
(function () {
  const PLAN_KEY = 'busan-plan-v1';
  const BOOKINGS_KEY = 'busan-bookings-v1';
  const META_KEY = 'busan-tripmeta-v1';

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }

  /* ---------- 計畫覆寫（My Plan overlay） ---------- */

  function loadPlan(baseDays) {
    try {
      const raw = localStorage.getItem(PLAN_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && Array.isArray(saved.days)) return clone(saved.days);
      }
    } catch { /* corrupted state falls back to base */ }
    return clone(baseDays);
  }

  function savePlan(days) {
    localStorage.setItem(PLAN_KEY, JSON.stringify({ version: 1, days, updatedAt: new Date().toISOString() }));
  }

  function resetPlan() { localStorage.removeItem(PLAN_KEY); }

  function hasCustomPlan() { return !!localStorage.getItem(PLAN_KEY); }

  function dayTotal(day) {
    return (day.activities || []).reduce((s, a) => s + (Number(a.budget) || 0), 0);
  }

  function planTotal(days) { return days.reduce((s, d) => s + dayTotal(d), 0); }

  /* ---------- 旅程設定覆寫（Trip meta overlay） ---------- */

  // 回傳有效的旅程設定：預設用內建範本（釜山），開過新旅程則用使用者設定
  function loadMeta(baseTrip) {
    const base = {
      title: baseTrip.title, subtitle: baseTrip.subtitle, dates: baseTrip.dates,
      travelers: baseTrip.travelers, budget: baseTrip.budget * (baseTrip.krwPerTwd || 1),
      startDate: baseTrip.startDate, timezone: baseTrip.timezone || 'Asia/Seoul',
      custom: false,
    };
    try {
      const saved = JSON.parse(localStorage.getItem(META_KEY));
      if (saved && saved.title) return { ...base, ...saved, custom: true };
    } catch { /* fall back to base */ }
    return base;
  }

  function saveMeta(meta) { localStorage.setItem(META_KEY, JSON.stringify(meta)); }

  function resetMeta() { localStorage.removeItem(META_KEY); }

  const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

  // 依 目的地/開始日/天數/人數/預算 產生全新旅程骨架（meta + 空白 days）
  function buildTripSkeleton(opts) {
    const start = new Date(opts.startDate + 'T00:00:00');
    const count = Math.min(Math.max(1, opts.dayCount | 0), 30);
    const days = [];
    for (let i = 0; i < count; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      days.push({
        day: i + 1,
        date: `${d.getMonth() + 1}/${d.getDate()} (${WEEKDAYS[d.getDay()]})`,
        title: i === 0 ? '抵達日' : (i === count - 1 && count > 1 ? '返程日' : '自由安排'),
        subtitle: '',
        activities: [],
      });
    }
    const end = new Date(start);
    end.setDate(end.getDate() + count - 1);
    const nights = count - 1;
    const meta = {
      title: `${opts.destination}${count}天${nights > 0 ? nights + '夜' : ''}自由行`,
      subtitle: opts.subtitle || '',
      dates: `${start.getFullYear()}/${start.getMonth() + 1}/${start.getDate()} (${WEEKDAYS[start.getDay()]}) → ${end.getMonth() + 1}/${end.getDate()} (${WEEKDAYS[end.getDay()]})`,
      travelers: Math.max(1, opts.travelers | 0),
      budget: Math.max(0, Number(opts.budget) || 0),
      startDate: opts.startDate,
      timezone: opts.timezone || 'Asia/Seoul',
    };
    return { meta, days };
  }

  /* ---------- 訂單彙整（Bookings） ---------- */

  function loadBookings() {
    try { return JSON.parse(localStorage.getItem(BOOKINGS_KEY)) || []; }
    catch { return []; }
  }

  function saveBookings(list) {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(list));
  }

  // 從貼上的確認信文字抽出航班/飯店/訂位資訊（啟發式，僅供草稿，需人工確認）
  function parseBookingText(text) {
    const t = String(text || '');
    const draft = { type: 'other', title: '', date: '', time: '', ref: '', note: '' };

    // 航班號：兩碼航空公司代碼 + 2-4 位數字（BR106, CI 194, JL5730）
    const flight = t.match(/\b([A-Z]{2})\s?(\d{2,4})\b/);
    // 訂位代號：6 位英數（至少含一個字母），常見標籤附近優先
    const refLabeled = t.match(/(?:訂位代號|予約番号|確認番号|Booking\s*(?:reference|code)|Confirmation\s*(?:code|number)|PNR|Record\s*locator)[^A-Z0-9]{0,10}([A-Z0-9]{5,8})/i);
    const refBare = t.match(/\b(?=[A-Z0-9]{6}\b)(?=[A-Z0-9]*[A-Z])[A-Z0-9]{6}\b/);
    // 日期：2026/07/17、2026-07-17、7月17日、Jul 17
    const dateISO = t.match(/\b(20\d{2})[\/\-年.](\d{1,2})[\/\-月.](\d{1,2})/);
    const dateCJK = t.match(/(\d{1,2})月(\d{1,2})日/);
    // 時間 HH:MM
    const time = t.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
    const isHotel = /ホテル|hotel|飯店|旅館|チェックイン|check[\s-]?in|宿泊|泊/i.test(t);
    const isTrain = /新幹線|JR|列車|train|乗車券|指定席/i.test(t);

    if (flight && !isHotel) {
      draft.type = 'flight';
      draft.title = `航班 ${flight[1]}${flight[2]}`;
    } else if (isHotel) {
      draft.type = 'hotel';
      const name = t.match(/([^\s「」\n]{2,20}(?:ホテル|ﾎﾃﾙ|Hotel|飯店|旅館)[^\s\n]{0,12})/i);
      draft.title = name ? name[1] : '住宿預訂';
    } else if (isTrain) {
      draft.type = 'train';
      draft.title = '鐵路車票';
    }

    if (dateISO) {
      draft.date = `${dateISO[1]}-${String(dateISO[2]).padStart(2, '0')}-${String(dateISO[3]).padStart(2, '0')}`;
    } else if (dateCJK) {
      draft.date = `2026-${String(dateCJK[1]).padStart(2, '0')}-${String(dateCJK[2]).padStart(2, '0')}`;
    }
    if (time) draft.time = `${String(time[1]).padStart(2, '0')}:${time[2]}`;
    const ref = refLabeled ? refLabeled[1] : (refBare ? refBare[0] : '');
    if (ref && !(flight && ref === `${flight[1]}${flight[2]}`)) draft.ref = ref.toUpperCase();

    draft.note = t.trim().slice(0, 120);
    return draft;
  }

  /* ---------- .ics 匯出 ---------- */

  function icsEscape(s) { return String(s).replace(/[\\;,\n]/g, c => '\\' + c); }

  function parseTime(t) {
    if (/^\d{1,2}:\d{2}/.test(t)) {
      const [h, m] = t.split(':').map(x => parseInt(x, 10));
      return { h, m };
    }
    if (/午前|上午/.test(t)) return { h: 9, m: 0 };
    if (/午後|下午/.test(t)) return { h: 13, m: 0 };
    return null;
  }

  function addMinutes(hm, mins) {
    const total = hm.h * 60 + hm.m + mins;
    return { h: Math.floor(total / 60) % 24, m: total % 60 };
  }

  function fmtHM(hm) { return String(hm.h).padStart(2, '0') + String(hm.m).padStart(2, '0'); }

  function buildICS(trip, days) {
    const lines = [
      'BEGIN:VCALENDAR', 'VERSION:2.0',
      'PRODID:-//TravelPlanner//busan-travel//ZH',
      'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
      `X-WR-CALNAME:${icsEscape(trip.title)}`,
      `X-WR-TIMEZONE:${trip.timezone}`,
    ];
    const base = new Date(trip.startDate + 'T00:00:00');
    (days || trip.days).forEach((day, di) => {
      const d = new Date(base);
      d.setDate(d.getDate() + di);
      const ymd = d.toISOString().slice(0, 10).replace(/-/g, '');
      day.activities.forEach((act, i) => {
        const start = parseTime(act.time);
        if (!start) return;
        const next = day.activities[i + 1];
        const end = (next && parseTime(next.time)) || addMinutes(start, 60);
        lines.push('BEGIN:VEVENT');
        lines.push(`DTSTART;TZID=${trip.timezone}:${ymd}T${fmtHM(start)}00`);
        lines.push(`DTEND;TZID=${trip.timezone}:${ymd}T${fmtHM(end)}00`);
        lines.push(`SUMMARY:${icsEscape((act.icon || '') + ' ' + act.title)}`);
        lines.push(`DESCRIPTION:${icsEscape((act.desc || '') + (act.budget ? ' (₩' + Number(act.budget).toLocaleString() + ')' : ''))}`);
        lines.push(`UID:${ymd}-${i}@busan-travel`);
        lines.push('END:VEVENT');
      });
    });
    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
  }

  /* ---------- 分享連結（URL hash） ---------- */

  function encodeShare(obj) {
    return btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
  }

  function decodeShare(str) {
    try { return JSON.parse(decodeURIComponent(escape(atob(str)))); }
    catch { return null; }
  }

  /* ---------- 檔案下載 ---------- */

  function download(filename, content, mime) {
    const blob = new Blob([content], { type: mime || 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  window.TripTools = {
    PLAN_KEY, BOOKINGS_KEY, META_KEY,
    esc, clone,
    loadPlan, savePlan, resetPlan, hasCustomPlan, dayTotal, planTotal,
    loadMeta, saveMeta, resetMeta, buildTripSkeleton,
    loadBookings, saveBookings, parseBookingText,
    buildICS, encodeShare, decodeShare, download,
  };
})();

# 動態行程地圖（/live）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> 核准後此檔複製到 `docs/superpowers/plans/2026-10-15-live-trip-map.md`，交給新的 Opus 5.5 session 執行。

**Goal:** 新增 `/live` 頁面，讓 6 人團一眼看出「現在在哪一站、下一站在哪個方向、多遠、車程多久、幾點出發」，出發前可拉時間軸預覽，旅途中用手機時間＋GPS 即時跟著走。

**Architecture:** 純計算邏輯放在 `src/lib/live/*.js`（無框架、可在 Node 與瀏覽器共用、用 `node --test` 測）。道路路線由 `scripts/build-routes.mjs` 呼叫 OSRM 一次產生 `public/data/routes.json` 並 commit；頁面執行時只讀這個檔，缺的段落才即時補抓，抓不到畫直線。`src/pages/live.astro` 用 Leaflet（改由 npm 同源打包，離線第一次造訪後可用）畫地圖，下半部大字卡片。

**Tech Stack:** Astro 5（static）、Leaflet 1.9（npm）、OpenStreetMap 地磚、OSRM 公用伺服器（只在產生路線時用）、Node 22 內建 `node:test`。

**Spec:** `docs/superpowers/specs/2026-10-15-live-trip-map-design.md`

## Context

現有 `/map`（實際用 Google Maps API）與 `Day.astro`（Leaflet）只畫站點與直線，看不出時間、方向、現在在哪。行程資料 `src/data/itinerary.js` 的 activities 沒有座標，`trip.locations[]` 的座標多為約略值，直接拿來算方向會指錯。本計畫先補齊並驗證每站座標，再做純函式、路線產生器、頁面。

## Global Constraints

- 地圖：**Leaflet + OpenStreetMap**；不使用 Google Maps API。
- 路線：OSRM 真實道路路線，**在產生腳本時抓好並 commit，頁面載入不依賴 OSRM**；失敗或離線回退直線，不能壞掉。
- OSRM 只用 driving profile；步行路段不用 OSRM，畫直線並標示。
- OSRM `durationS` 是無車流時間：卡片一律顯示「約」並加 **30% 緩衝**（本計畫的決定，頁面上寫明）。取 spec 範圍上限，因為參考文章（波比看世界 2026 釜山攻略）提醒假日海雲台、廣安里非常容易塞車，Day 2 是週日、正好整天在這一帶。
- 時區 `Asia/Seoul`（固定 +09:00，無日光節約）；`trip.startDate` = `2026-10-31`。第一筆「桃園機場起飛 02:50」是台灣時間（+08:00）。
- 網址 `/live`，支援 `?day=1|2|3` 與 `?t=2026-11-01T14:30`（首爾當地時間）。
- 長輩友善：字級至少 18px、卡片主要字 24px 以上、對比 4.5:1 以上、按鈕至少 48px、不只靠顏色傳達資訊、滑桿可用鍵盤操作。
- 導航按鈕：Google Map 與 Naver Map 兩個（資料已有 `gmap`、`nmap`），Naver 放主要按鈕（參考文章也說 Google Maps 在韓國無法精準導航）。叫車文案寫「Kakao T／k.ride」（k.ride 是 Kakao 給外國旅客的繁中版）。
- **不修改** `src/pages/map.astro`、`src/layouts/Day.astro`、`trip.locations`、`trip.dailyRoutes`（只新增 `/live`）。
- 不做：行程編輯、重排、叫車、即時路況、多人共享位置、OSM 地磚預抓。
- 每個 activity 座標都要有來源紀錄（`coordSrc`），不留約略值。行程沒指定的店家（Day 2 밀면、Day 3 烤肉的男子）由實作者查證後指定一家，連同 title／desc／連結一起改（使用者已同意）。
- 現有程式風格：純 JS ESM、2 空格縮排、單引號、中文註解精簡；文案用繁體中文、全形標點。

## File Structure

| 檔案 | 責任 |
|---|---|
| `src/lib/live/geo.js`（新） | Haversine 距離、初始方位角、8 方位文字、距離格式化 |
| `src/lib/live/timeline.js`（新） | 把 `trip` 攤平成帶絕對時間的時間軸、找現在／下一站、解析 `?t=`、行程時間範圍、首爾時間格式化 |
| `src/lib/live/segments.js`（新） | 相鄰兩站切成路段，判斷 drive／walk／flight，產生路段 key |
| `src/lib/live/osrm.js`（新） | OSRM 網址、回應解析、帶逾時的抓取、執行時補抓缺的段落 |
| `src/lib/live/card.js`（新） | 由時間、GPS、路段算出卡片要顯示的文字（view model） |
| `src/lib/live/map.js`（新） | Leaflet 圖層：當日路線、站點、自己位置、方向箭頭 |
| `scripts/build-routes.mjs`（新） | 產生／檢查 `public/data/routes.json` |
| `public/data/routes.json`（新，產物，commit） | 每個 drive 路段的 GeoJSON、距離、時間 |
| `src/pages/live.astro`（新） | 頁面版面、模式切換、預覽滑桿、定位、把上面模組接起來 |
| `tests/live/*.test.mjs`（新） | 各模組單元測試 |
| `src/data/itinerary.js`（改） | 每個 activity 加 `lat`、`lng`、`coordSrc`；桃園那筆加 `utcOffset`；指定 밀면、烤肉的男子店家 |
| `src/components/Nav.astro`（改） | 主導覽加「即時」 |
| `public/sw.js`（改） | 快取 `/live/`、`/data/routes.json`，版本升到 `busan-v4` |
| `package.json`（改） | 加 `leaflet` 依賴，`test`、`routes`、`prebuild` 指令 |

---

### Task 1: 測試環境與 geo.js

**Files:**
- Modify: `package.json`
- Create: `src/lib/live/geo.js`
- Test: `tests/live/geo.test.mjs`

**Interfaces:**
- Produces: `distanceM(a, b) → number`（公尺）、`bearingDeg(a, b) → number`（0–360，北為 0、順時針）、`compass8(deg) → '北'|'東北'|'東'|'東南'|'南'|'西南'|'西'|'西北'`、`formatDistance(m) → string`。`a`、`b` 皆為 `{ lat, lng }`。

- [ ] **Step 1: 加 test 指令**

`package.json` 的 `scripts` 加一行：

```json
"test": "node --test \"tests/**/*.test.mjs\"",
```

- [ ] **Step 2: 寫失敗的測試** `tests/live/geo.test.mjs`

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { distanceM, bearingDeg, compass8, formatDistance } from '../../src/lib/live/geo.js';

test('distanceM：赤道上經度差 1 度約 111.2 公里', () => {
  const d = distanceM({ lat: 0, lng: 0 }, { lat: 0, lng: 1 });
  assert.ok(Math.abs(d - 111195) < 50, `got ${d}`);
});

test('distanceM：西面到廣安里約 5.4 公里', () => {
  const d = distanceM({ lat: 35.1575, lng: 129.0600 }, { lat: 35.1534, lng: 129.1189 });
  assert.ok(d > 5300 && d < 5450, `got ${d}`);
});

test('bearingDeg：正北、正東、正南、正西', () => {
  const o = { lat: 0, lng: 0 };
  assert.ok(Math.abs(bearingDeg(o, { lat: 1, lng: 0 }) - 0) < 0.01);
  assert.ok(Math.abs(bearingDeg(o, { lat: 0, lng: 1 }) - 90) < 0.01);
  assert.ok(Math.abs(bearingDeg(o, { lat: -1, lng: 0 }) - 180) < 0.01);
  assert.ok(Math.abs(bearingDeg(o, { lat: 0, lng: -1 }) - 270) < 0.01);
});

test('compass8：邊界值', () => {
  assert.equal(compass8(0), '北');
  assert.equal(compass8(22), '北');
  assert.equal(compass8(23), '東北');
  assert.equal(compass8(90), '東');
  assert.equal(compass8(135), '東南');
  assert.equal(compass8(200), '南');
  assert.equal(compass8(225), '西南');
  assert.equal(compass8(270), '西');
  assert.equal(compass8(337), '西北');
  assert.equal(compass8(338), '北');
});

test('西面到廣安里在東方', () => {
  const deg = bearingDeg({ lat: 35.1575, lng: 129.0600 }, { lat: 35.1534, lng: 129.1189 });
  assert.equal(compass8(deg), '東');
});

test('formatDistance：1000 公尺以上用公里一位小數', () => {
  assert.equal(formatDistance(350.4), '350 公尺');
  assert.equal(formatDistance(999.6), '1.0 公里');
  assert.equal(formatDistance(2345), '2.3 公里');
});
```

- [ ] **Step 3: 跑測試確認失敗**

Run: `npm test`
Expected: FAIL，`Cannot find module .../src/lib/live/geo.js`

- [ ] **Step 4: 實作** `src/lib/live/geo.js`

```js
// 距離與方位：導航卡片用，皆為直線（大圓）計算
const R = 6371000;
const rad = (d) => (d * Math.PI) / 180;

export function distanceM(a, b) {
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// 初始方位角，北為 0、順時針
export function bearingDeg(a, b) {
  const p1 = rad(a.lat);
  const p2 = rad(b.lat);
  const dl = rad(b.lng - a.lng);
  const y = Math.sin(dl) * Math.cos(p2);
  const x = Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

const DIRS = ['北', '東北', '東', '東南', '南', '西南', '西', '西北'];
export const compass8 = (deg) => DIRS[Math.round(deg / 45) % 8];

export function formatDistance(m) {
  const r = Math.round(m);
  return r >= 1000 ? `${(r / 1000).toFixed(1)} 公里` : `${r} 公尺`;
}
```

- [ ] **Step 5: 跑測試確認通過**

Run: `npm test`
Expected: PASS（6 tests）

- [ ] **Step 6: Commit**

```bash
git add package.json src/lib/live/geo.js tests/live/geo.test.mjs
git commit -m "feat(live): 新增距離與方位計算模組"
```

---

### Task 2: 每個 activity 補上驗證過的座標

**Files:**
- Modify: `src/data/itinerary.js`（day1／day2／day3 陣列與檔案上方的 helper）
- Test: `tests/live/itinerary-coords.test.mjs`

**Interfaces:**
- Produces: 每個 activity 多三個欄位 `lat: number`、`lng: number`、`coordSrc: string`；`day1[0]`（桃園機場起飛）多 `utcOffset: '+08:00'`。後續任務以 `a.lat`、`a.lng` 讀取。

**這是全計畫最重要的一步：方向與距離全靠它。寫完程式前先完成。**

- [ ] **Step 1: 寫失敗的測試** `tests/live/itinerary-coords.test.mjs`

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { trip } from '../../src/data/itinerary.js';

const all = trip.days.flatMap((d) => d.activities.map((a) => ({ ...a, day: d.day })));
// 釜山＋金海一帶；桃園機場例外
const inBusan = (a) => a.lat > 34.9 && a.lat < 35.4 && a.lng > 128.7 && a.lng < 129.35;
const inTaoyuan = (a) => Math.abs(a.lat - 25.08) < 0.05 && Math.abs(a.lng - 121.23) < 0.05;

test('每個 activity 都有數字座標與來源', () => {
  for (const a of all) {
    assert.equal(typeof a.lat, 'number', `${a.title} 缺 lat`);
    assert.equal(typeof a.lng, 'number', `${a.title} 缺 lng`);
    assert.ok(typeof a.coordSrc === 'string' && a.coordSrc.length > 10, `${a.title} 缺 coordSrc`);
  }
});

test('座標落在合理範圍', () => {
  for (const a of all) {
    assert.ok(inBusan(a) || inTaoyuan(a), `${a.title} 座標 ${a.lat},${a.lng} 不在釜山或桃園`);
  }
});

test('只有第一筆是桃園，且標了台灣時區', () => {
  const tw = all.filter(inTaoyuan);
  assert.equal(tw.length, 1);
  assert.equal(tw[0].title, '桃園機場起飛');
  assert.equal(tw[0].utcOffset, '+08:00');
});

test('沒有留下「尚未指定」或「沒查到」的店家', () => {
  for (const a of all) {
    assert.ok(!/尚未指定|分店地址我沒查到/.test(a.desc), `${a.title} 還沒指定店家`);
  }
});
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `npm test`
Expected: FAIL，`桃園機場起飛 缺 lat`

- [ ] **Step 3: 查證座標（不寫程式，產出一張表）**

對以下每個地點，用內建瀏覽器開 Google Maps 搜尋（`https://www.google.com/maps/search/?api=1&query=<韓文名或地址>`），點進正確的店家，從網址列的 `!3d<lat>!4d<lng>`（優先）或 `@<lat>,<lng>` 取座標，取到小數 5 位；再開 Naver Map 同一家確認是同一棟樓（Naver 是韓國實際導航工具，兩邊位置差超過 50 公尺時以 Naver 標示的入口為準，並在來源註明）。遇到 cookie／同意視窗選最少權限的選項。**每筆記下：座標、來源網站、查詢日期、店家正式名稱。**

需查的地點（同一地點只查一次）：

| 代號 | 地點 | 搜尋字 |
|---|---|---|
| TPE | 桃園機場第一航廈 | Taoyuan International Airport Terminal 1 |
| PUS | 金海國際機場國際線航廈 | 김해국제공항 국제선 |
| HOTEL | Hotel BELLUS 西面 | 부산진구 중앙대로691번길 14-9 |
| GUKBAP | 포항돼지국밥 서면점 | 포항돼지국밥 서면점 서면로68번길 27 |
| SPA | 新世界 Centum City Spa Land 入口 | 신세계 센텀시티 스파랜드 |
| CENTUM | 新世界 Centum City 百貨 | 신세계 센텀시티 |
| COSTCO | 好市多金海店 | 코스트코 김해점 |
| JAGALCHI | 札嘎其市場（下車處） | 자갈치시장 |
| SINDONGA | 新東亞市場 | 자갈치 신동아시장 |
| BIFF | BIFF 廣場 씨앗호떡 | BIFF광장 씨앗호떡 |
| WH | Working Holiday 廣安里 | 워킹홀리데이 광안해변로 235 |
| OY | Olive Young 廣安里店 | 올리브영 광안리점 |
| MILMYEON | **指定一家** 밀면：在廣安里到海雲台市場之間（水營區／海雲台區），Naver 評分高、11 月週日中午有營業、6 人坐得下；寫下店名、地址 | 밀면 수영구／해운대 밀면 |
| HMARKET | 海雲台市場 | 해운대시장 |
| MIPO | 海岸列車美浦站 | 해운대블루라인파크 미포정거장 |
| DIART | DIART 咖啡 | 디아트커피 청사포로128번길 12 |
| AMSO | 海雲台母牛肋排家 | 해운대암소갈비집 |
| XSKY | Busan X the SKY（LCT） | 부산엑스더스카이 |
| EGG | Egg Drop 西面樂天後門店 | 에그드랍 서면롯데후문점 |
| LOTTE | 樂天百貨釜山本店 | 롯데백화점 부산본점 |
| GOGI | **指定一家** 고기굽는남자 西面分店（找不到西面分店就改西面另一家有專人代烤、午餐有開的熟成豬肉店）；寫下店名、地址 | 고기굽는남자 서면 |
| ARTE | Arte Museum 釜山 | 아르떼뮤지엄 부산 영도구 해양로247번길 29 |
| SAMJIN | 三進魚板影島本店 | 삼진어묵 본점 |
| SONGDO | 松島海上纜車 松林公園站 | 송도해상케이블카 송림공원 탑승장 |
| KALGUKSU | 기장손칼국수 西面 | 기장손칼국수 서면로 56 |

查到的明顯錯誤（例如現有約略值差超過 300 公尺）在最後回報給使用者。

- [ ] **Step 4: 改 `itinerary.js`**

在檔案上方 `loc` 之後加：

```js
// 導航用座標，皆已逐筆查證；src 記來源與查詢日期
const at = (lat, lng, src) => ({ lat, lng, coordSrc: src });
const P = {
  TPE: at(<lat>, <lng>, 'Google Maps 2026-10-xx 桃園機場第一航廈'),
  PUS: at(<lat>, <lng>, 'Google Maps＋Naver 2026-10-xx 김해국제공항 국제선'),
  HOTEL: at(<lat>, <lng>, '...'),
  // …上表每個代號一行，數值換成 Step 3 查到的
};
```

（`<lat>`／`<lng>`／`xx` 是 Step 3 的查證結果，實作時一定要填實際值；測試會擋下非數字。）

每個 activity 在既有 `...loc(...)`／`...hotelLoc`／`...COSTCO` 後面加 `...P.<代號>`。對應：

- Day 1：桃園起飛 `P.TPE`（另加 `utcOffset: '+08:00'`，並在該行加註解「台灣時間」）；抵達金海 `P.PUS`；計程車到飯店、寄放行李、回飯店、辦入住、回飯店早睡 `P.HOTEL`；湯飯 `P.GUKBAP`；搭車去 Centum、Spa Land `P.SPA`；午餐 Centum `P.CENTUM`；去好市多、好市多 `P.COSTCO`；搭車去南浦 `P.JAGALCHI`；新東亞 `P.SINDONGA`；BIFF `P.BIFF`。
- Day 2：計程車去廣安里、Working Holiday `P.WH`；Olive Young `P.OY`；밀면 `P.MILMYEON`；海雲台市場 `P.HMARKET`；搭車去美浦、海邊列車 `P.MIPO`；DIART `P.DIART`；搭車去海雲台、母牛肋排家 `P.AMSO`；搭車去 X the SKY、X the SKY `P.XSKY`；回飯店 `P.HOTEL`。
- Day 3：Egg Drop `P.EGG`；樂天購物 `P.LOTTE`；回飯店退房 `P.HOTEL`；烤肉 `P.GOGI`；計程車去影島、Arte `P.ARTE`；三進魚板 `P.SAMJIN`；搭車去松島、纜車 `P.SONGDO`；回西面飯店 `P.HOTEL`；刀削麵 `P.KALGUKSU`；去機場、起飛 `P.PUS`。

밀면與烤肉這兩筆：把 `title`、`ko`、`desc` 改成指定的店家（保留原本份量、預算、注意事項的句子，刪掉「店家尚未指定…」「分店地址我沒查到…」），`loc(...)` 換成該店的搜尋字；`desc` 裡註明「營業時間以 Naver 為準」。`trip.locations`、`foods`、`dailyRoutes` **不要動**（Day.astro 靠 `dailyRoutes` 與 `locations` 的座標比對，改了會壞）。

- [ ] **Step 5: 跑測試確認通過**

Run: `npm test`
Expected: PASS（含 Task 1 的測試）

- [ ] **Step 6: 確認既有頁面沒壞**

Run: `npx astro build`
Expected: build 成功，沒有錯誤

- [ ] **Step 7: Commit**

```bash
git add src/data/itinerary.js tests/live/itinerary-coords.test.mjs
git commit -m "feat(live): 每個行程站點加入查證過的座標，指定冷麵與烤肉店家"
```

---

### Task 3: timeline.js

**Files:**
- Create: `src/lib/live/timeline.js`
- Test: `tests/live/timeline.test.mjs`

**Interfaces:**
- Consumes: Task 2 的 `a.lat`、`a.lng`、`a.utcOffset`。
- Produces:
  - `buildTimeline(trip) → Stop[]`，`Stop = activity 的所有欄位 + { day: number, index: number /*當日序號*/, seq: number /*全程序號*/, startMs: number }`，依 `startMs` 遞增。
  - `findNowNext(timeline, tMs) → { now: Stop|null, next: Stop|null }`（`now` = 最後一個 `startMs <= tMs` 的站）。
  - `parseSeoulLocal(s) → number|null`（`'2026-11-01T14:30'` → epoch ms）。
  - `tripRange(trip) → { startMs, endMs }`（首日 00:00 到末日 23:59:59，首爾時間）。
  - `dayOf(trip, tMs) → 1..days.length`（夾在範圍內）。
  - `formatSeoul(ms) → 'MM/DD HH:MM'`。
  - `dayDate(startDate, day) → 'YYYY-MM-DD'`。

- [ ] **Step 1: 寫失敗的測試** `tests/live/timeline.test.mjs`

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { trip } from '../../src/data/itinerary.js';
import { buildTimeline, findNowNext, parseSeoulLocal, tripRange, dayOf, formatSeoul, dayDate } from '../../src/lib/live/timeline.js';

const tl = buildTimeline(trip);
const at = (s) => findNowNext(tl, parseSeoulLocal(s));

test('dayDate', () => {
  assert.equal(dayDate('2026-10-31', 1), '2026-10-31');
  assert.equal(dayDate('2026-10-31', 2), '2026-11-01');
  assert.equal(dayDate('2026-10-31', 3), '2026-11-02');
});

test('時間軸涵蓋全部 activities 且嚴格遞增', () => {
  const total = trip.days.reduce((s, d) => s + d.activities.length, 0);
  assert.equal(tl.length, total);
  tl.forEach((s, i) => assert.equal(s.seq, i));
  for (let i = 1; i < tl.length; i++) assert.ok(tl[i].startMs > tl[i - 1].startMs, `${tl[i].title} 沒有晚於前一站`);
});

test('桃園起飛用台灣時間', () => {
  assert.equal(tl[0].startMs, Date.parse('2026-10-31T02:50:00+08:00'));
  assert.equal(tl[1].startMs, Date.parse('2026-10-31T06:10:00+09:00'));
});

test('findNowNext：行程中', () => {
  const r = at('2026-11-01T14:30');
  assert.equal(r.now.title, '搭車去美浦站');
  assert.equal(r.next.title, '海邊列車（해변열차）');
});

test('findNowNext：剛好整點算現在', () => {
  assert.equal(at('2026-11-01T09:30').now.title, '大型計程車去廣安里');
});

test('findNowNext：行程開始前與結束後', () => {
  const before = at('2026-10-31T00:00');
  assert.equal(before.now, null);
  assert.equal(before.next.title, '桃園機場起飛');
  const after = at('2026-11-02T23:00');
  assert.equal(after.now.title, '7C6163 起飛');
  assert.equal(after.next, null);
});

test('parseSeoulLocal：格式錯誤回 null', () => {
  assert.equal(parseSeoulLocal(''), null);
  assert.equal(parseSeoulLocal('2026-11-01 14:30'), null);
  assert.equal(parseSeoulLocal('2026-13-01T14:30'), null);
});

test('tripRange 與 dayOf', () => {
  const r = tripRange(trip);
  assert.equal(r.startMs, Date.parse('2026-10-31T00:00:00+09:00'));
  assert.equal(r.endMs, Date.parse('2026-11-02T23:59:59+09:00'));
  assert.equal(dayOf(trip, parseSeoulLocal('2026-11-01T00:10')), 2);
  assert.equal(dayOf(trip, parseSeoulLocal('2026-10-01T12:00')), 1);
  assert.equal(dayOf(trip, parseSeoulLocal('2026-12-01T12:00')), 3);
});

test('formatSeoul', () => {
  assert.equal(formatSeoul(parseSeoulLocal('2026-11-01T09:05')), '11/01 09:05');
});
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `npm test`
Expected: FAIL，`Cannot find module .../timeline.js`

- [ ] **Step 3: 實作** `src/lib/live/timeline.js`

```js
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
```

- [ ] **Step 4: 跑測試確認通過**

Run: `npm test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/live/timeline.js tests/live/timeline.test.mjs
git commit -m "feat(live): 行程時間軸與現在／下一站判斷"
```

---

### Task 4: segments.js

**Files:**
- Create: `src/lib/live/segments.js`
- Test: `tests/live/segments.test.mjs`

**Interfaces:**
- Consumes: `buildTimeline` 的 `Stop[]`（用 `lat`、`lng`、`type`、`day`、`seq`）；`distanceM`。
- Produces:
  - `segmentKey(from, to) → string`，格式 `'35.15750,129.06000>35.15340,129.11890'`（小數 5 位）。
  - `buildSegments(timeline) → Segment[]`，`Segment = { key, day, fromSeq, toSeq, from: {lat,lng}, to: {lat,lng}, mode: 'drive'|'walk'|'flight', straightM: number }`。同一地點（< 50 公尺）不產生路段。
  - 規則：兩端都是 flight → `flight`；到達站是 `transport` 或直線距離 > `WALK_MAX_M`（1000）→ `drive`；其餘 → `walk`。

- [ ] **Step 1: 寫失敗的測試** `tests/live/segments.test.mjs`

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { trip } from '../../src/data/itinerary.js';
import { buildTimeline } from '../../src/lib/live/timeline.js';
import { buildSegments, segmentKey } from '../../src/lib/live/segments.js';

const stop = (seq, type, lat, lng, day = 1) => ({ seq, type, lat, lng, day });

test('segmentKey 固定 5 位小數', () => {
  assert.equal(segmentKey({ lat: 35.1575, lng: 129.06 }, { lat: 35.1534, lng: 129.1189 }), '35.15750,129.06000>35.15340,129.11890');
});

test('mode 規則', () => {
  const segs = buildSegments([
    stop(0, 'flight', 25.08, 121.23),
    stop(1, 'flight', 35.18, 128.94),
    stop(2, 'transport', 35.1575, 129.06),   // 開車到飯店
    stop(3, 'hotel', 35.1575, 129.06),       // 同一地點：不產生
    stop(4, 'food', 35.1560, 129.0586),      // 約 200 公尺：步行
    stop(5, 'food', 35.1693, 129.1297),      // 約 6.6 公里、非 transport：仍算開車
  ]);
  assert.deepEqual(segs.map((s) => [s.fromSeq, s.toSeq, s.mode]), [
    [0, 1, 'flight'], [1, 2, 'drive'], [3, 4, 'walk'], [4, 5, 'drive'],
  ]);
  assert.ok(segs[2].straightM > 150 && segs[2].straightM < 300);
});

test('真實行程：每段 transport 都有 drive 路段，步行都在 1 公里內', () => {
  const tl = buildTimeline(trip);
  const segs = buildSegments(tl);
  for (const s of tl.filter((x) => x.type === 'transport' && x.seq > 0)) {
    const prev = tl[s.seq - 1];
    if (prev.lat === s.lat && prev.lng === s.lng) continue;
    const seg = segs.find((g) => g.toSeq === s.seq);
    assert.equal(seg?.mode, 'drive', `${s.title} 應為 drive`);
  }
  for (const g of segs.filter((x) => x.mode === 'walk')) assert.ok(g.straightM <= 1000);
  assert.equal(segs.filter((x) => x.mode === 'flight').length, 1);
});
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `npm test`
Expected: FAIL，`Cannot find module .../segments.js`

- [ ] **Step 3: 實作** `src/lib/live/segments.js`

```js
// 相鄰兩站切成路段。transport 的座標是終點，起點是上一站
import { distanceM } from './geo.js';

export const WALK_MAX_M = 1000;
const SAME_PLACE_M = 50;

const fmt = (p) => `${p.lat.toFixed(5)},${p.lng.toFixed(5)}`;
export const segmentKey = (from, to) => `${fmt(from)}>${fmt(to)}`;

export function buildSegments(timeline) {
  const segs = [];
  for (let k = 1; k < timeline.length; k++) {
    const a = timeline[k - 1];
    const b = timeline[k];
    const d = distanceM(a, b);
    if (d < SAME_PLACE_M) continue;
    const mode = a.type === 'flight' && b.type === 'flight' ? 'flight'
      : b.type === 'transport' || d > WALK_MAX_M ? 'drive' : 'walk';
    segs.push({
      key: segmentKey(a, b),
      day: b.day,
      fromSeq: a.seq,
      toSeq: b.seq,
      from: { lat: a.lat, lng: a.lng },
      to: { lat: b.lat, lng: b.lng },
      mode,
      straightM: Math.round(d),
    });
  }
  return segs;
}
```

- [ ] **Step 4: 跑測試確認通過**

Run: `npm test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/live/segments.js tests/live/segments.test.mjs
git commit -m "feat(live): 把行程切成開車／步行／航班路段"
```

---

### Task 5: OSRM 模組與路線產生腳本

**Files:**
- Create: `src/lib/live/osrm.js`
- Create: `scripts/build-routes.mjs`
- Create（產物）: `public/data/routes.json`
- Modify: `package.json`
- Test: `tests/live/osrm.test.mjs`

**Interfaces:**
- Consumes: `buildTimeline`、`buildSegments`。
- Produces:
  - `Route = { geometry: { type: 'LineString', coordinates: [lng, lat][] }, distanceM: number, durationS: number }`
  - `osrmUrl(from, to) → string`、`parseOsrm(json) → Route|null`
  - `fetchRoute(from, to, { timeoutMs = 8000, fetchImpl = fetch } = {}) → Promise<Route|null>`（任何錯誤都回 null，不丟例外）
  - `fillMissingRoutes(segments, routes, opts) → Promise<object>`：對 `mode === 'drive'` 且 `routes[key]` 不存在的路段依序補抓，第一次失敗就停（多半是離線），回傳同一個 `routes` 物件。
  - `public/data/routes.json` 格式：`{ generatedAt: string, source: string, routes: { [segmentKey]: Route } }`

- [ ] **Step 1: 寫失敗的測試** `tests/live/osrm.test.mjs`

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { osrmUrl, parseOsrm, fetchRoute, fillMissingRoutes } from '../../src/lib/live/osrm.js';

const A = { lat: 35.1575, lng: 129.06 };
const B = { lat: 35.1534, lng: 129.1189 };
const OK = {
  code: 'Ok',
  routes: [{ distance: 6123.4, duration: 812.6, geometry: { type: 'LineString', coordinates: [[129.0600012, 35.1575004], [129.1189, 35.1534]] } }],
};
const okFetch = async () => ({ ok: true, json: async () => OK });
const deadFetch = async () => { throw new TypeError('Failed to fetch'); };

test('osrmUrl：經度在前', () => {
  assert.equal(osrmUrl(A, B), 'https://router.project-osrm.org/route/v1/driving/129.06,35.1575;129.1189,35.1534?overview=full&geometries=geojson');
});

test('parseOsrm：取整與座標 5 位小數', () => {
  assert.deepEqual(parseOsrm(OK), {
    geometry: { type: 'LineString', coordinates: [[129.06, 35.1575], [129.1189, 35.1534]] },
    distanceM: 6123,
    durationS: 813,
  });
  assert.equal(parseOsrm({ code: 'NoRoute', routes: [] }), null);
  assert.equal(parseOsrm(null), null);
});

test('fetchRoute：網路錯誤與非 200 都回 null', async () => {
  assert.equal(await fetchRoute(A, B, { fetchImpl: deadFetch }), null);
  assert.equal(await fetchRoute(A, B, { fetchImpl: async () => ({ ok: false }) }), null);
  assert.equal((await fetchRoute(A, B, { fetchImpl: okFetch })).durationS, 813);
});

test('fillMissingRoutes：只補 drive 且缺的；失敗就停', async () => {
  let calls = 0;
  const segs = [
    { key: 'k1', mode: 'drive', from: A, to: B },
    { key: 'k2', mode: 'walk', from: A, to: B },
    { key: 'k3', mode: 'drive', from: A, to: B },
    { key: 'k4', mode: 'drive', from: A, to: B },
  ];
  const routes = { k1: { durationS: 1 } };
  await fillMissingRoutes(segs, routes, { fetchImpl: async () => { calls++; throw new Error('offline'); } });
  assert.equal(calls, 1);
  assert.deepEqual(Object.keys(routes), ['k1']);
  await fillMissingRoutes(segs, routes, { fetchImpl: okFetch });
  assert.deepEqual(Object.keys(routes).sort(), ['k1', 'k3', 'k4']);
});
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `npm test`
Expected: FAIL，`Cannot find module .../osrm.js`

- [ ] **Step 3: 實作** `src/lib/live/osrm.js`

```js
// OSRM 公用示範伺服器：只支援 driving，沒有穩定性保證，平常只在產生 routes.json 時呼叫
export const OSRM_BASE = 'https://router.project-osrm.org';

export const osrmUrl = (from, to) =>
  `${OSRM_BASE}/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;

const r5 = (n) => Math.round(n * 1e5) / 1e5;

export function parseOsrm(json) {
  const r = json?.code === 'Ok' ? json.routes?.[0] : null;
  if (!r) return null;
  return {
    geometry: { type: 'LineString', coordinates: r.geometry.coordinates.map(([x, y]) => [r5(x), r5(y)]) },
    distanceM: Math.round(r.distance),
    durationS: Math.round(r.duration),
  };
}

export async function fetchRoute(from, to, { timeoutMs = 8000, fetchImpl = fetch } = {}) {
  try {
    const res = await fetchImpl(osrmUrl(from, to), { signal: AbortSignal.timeout(timeoutMs) });
    if (!res.ok) return null;
    return parseOsrm(await res.json());
  } catch {
    return null;
  }
}

// 頁面用：routes.json 缺的段落才即時補抓，一失敗就停，避免離線時每段都等逾時
export async function fillMissingRoutes(segments, routes, opts = {}) {
  for (const s of segments) {
    if (s.mode !== 'drive' || routes[s.key]) continue;
    const r = await fetchRoute(s.from, s.to, opts);
    if (!r) break;
    routes[s.key] = r;
  }
  return routes;
}
```

- [ ] **Step 4: 跑測試確認通過**

Run: `npm test`
Expected: PASS

- [ ] **Step 5: 寫腳本** `scripts/build-routes.mjs`

```js
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
```

- [ ] **Step 6: 加 npm 指令**

`package.json` 的 `scripts` 加：

```json
"routes": "node scripts/build-routes.mjs",
"prebuild": "node scripts/build-routes.mjs --check",
```

（CI 跑的是 `npx astro build`，不會觸發 prebuild，也不會連 OSRM；`npm run build` 會在輸出列出缺的段落，符合驗收第 4 條。）

- [ ] **Step 7: 產生路線**

先確認伺服器可用與速率限制：

Run: `curl -s -o /dev/null -w '%{http_code}\n' 'https://router.project-osrm.org/route/v1/driving/129.06,35.1575;129.1189,35.1534?overview=false'`
Expected: `200`。若不是 200，停下來回報使用者（不要換其他服務）。

Run: `npm run routes`
Expected: `OSRM 路線：成功 N／N 段`（N 約 20 上下）。有失敗就再跑一次（只會重抓缺的）。仍失敗的段落記下來回報。

Run: `npm run build`
Expected: prebuild 印出 `routes.json：N／N 段開車路線已就緒`，astro build 成功。

抽查：`node -e "const r=require('./public/data/routes.json').routes;for(const [k,v] of Object.entries(r))console.log(k,v.distanceM,Math.round(v.durationS/60)+'分')"`，每段距離應略大於直線距離、時間在 3–60 分鐘之間。用參考文章的實際車程對照（OSRM 是無車流時間，應比這些短）：金海機場→西面約 30–40 分鐘、南浦↔海雲台約 40–50 分鐘、機場→海雲台約 60–70 分鐘。差太多（例如機場→西面 OSRM 只有 5 分或超過 50 分）的段落多半是座標落在錯的路邊，回 Task 2 修。

- [ ] **Step 8: Commit**

```bash
git add src/lib/live/osrm.js scripts/build-routes.mjs public/data/routes.json package.json tests/live/osrm.test.mjs
git commit -m "feat(live): OSRM 路線產生腳本與 routes.json"
```

---

### Task 6: card.js（卡片文字）

**Files:**
- Create: `src/lib/live/card.js`
- Test: `tests/live/card.test.mjs`

**Interfaces:**
- Consumes: `distanceM`、`bearingDeg`、`compass8`、`formatDistance`；`Stop`、`Segment`、`Route`。
- Produces:
  - `DRIVE_BUFFER = 1.3`、`driveMinutes(durationS) → number`（乘緩衝後無條件進位到 5 分鐘）
  - `TYPE_LABEL`：`{ flight: '航班', transport: '交通', food: '餐飲', ticket: '景點', shopping: '購物', hotel: '住宿' }`
  - `buildCard({ now, next, tMs, gps, segment, route }) → Card`
    - `gps`：`{ lat, lng } | null`；`segment`：到達 `next` 的路段或 `undefined`（同一地點）；`route`：`Route | undefined`
    - `Card = { status: 'before'|'during'|'after', now: { icon, title, typeLabel } | null, next: { icon, title, typeLabel, time, countdown, direction, distance, distanceNote, travel, gmap, nmap } | null, delay: string|null, bearing: number|null }`

- [ ] **Step 1: 寫失敗的測試** `tests/live/card.test.mjs`

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCard, driveMinutes } from '../../src/lib/live/card.js';

const T0 = Date.parse('2026-11-01T14:30:00+09:00');
const MIN = 60000;
const hotel = { seq: 1, icon: '🏨', title: '飯店', type: 'hotel', time: '14:00', startMs: T0 - 30 * MIN, lat: 35.1575, lng: 129.06, gmap: 'g0', nmap: 'n0' };
const taxi = { seq: 2, icon: '🚕', title: '去廣安里', type: 'transport', time: '14:45', startMs: T0 + 15 * MIN, lat: 35.1534, lng: 129.1189, gmap: 'g1', nmap: 'n1' };
const seg = { key: 'k', mode: 'drive', straightM: 5370 };

test('driveMinutes：加 30% 後進位到 5 分鐘', () => {
  assert.equal(driveMinutes(600), 15);   // 13 → 15
  assert.equal(driveMinutes(923), 20);   // 19.998 → 20
  assert.equal(driveMinutes(960), 25);   // 20.8 → 25
  assert.equal(driveMinutes(61), 5);
});

test('沒有 GPS：從現在這站算方位，顯示倒數與車程', () => {
  const c = buildCard({ now: hotel, next: taxi, tMs: T0, gps: null, segment: seg, route: { durationS: 900, distanceM: 6500 } });
  assert.equal(c.status, 'during');
  assert.equal(c.now.title, '飯店');
  assert.equal(c.next.direction, '東方');
  assert.equal(c.next.distance, '5.4 公里');
  assert.equal(c.next.distanceNote, '從「飯店」算的直線距離');
  assert.equal(c.next.countdown, '還有 15 分鐘出發');
  assert.equal(c.next.travel, '車程約 20 分鐘（路線估計加 30% 塞車緩衝，以 Kakao T／k.ride 為準）');
  assert.equal(c.delay, null);
});

test('有 GPS：從你的位置算；人還沒到現在這站就顯示延後', () => {
  const gps = { lat: 35.1700, lng: 129.0600 }; // 飯店北方約 1.4 公里
  const c = buildCard({ now: hotel, next: taxi, tMs: T0, gps, segment: seg, route: undefined });
  assert.equal(c.next.distanceNote, '從你的位置算的直線距離');
  assert.equal(c.next.travel, '沒有路線資料，地圖以直線表示');
  assert.equal(c.delay, '已延後 30 分鐘（還沒到「飯店」）');
});

test('GPS 在 30 公里外（例如人還在台灣）不算延後', () => {
  const c = buildCard({ now: hotel, next: taxi, tMs: T0, gps: { lat: 25.03, lng: 121.56 }, segment: seg });
  assert.equal(c.delay, null);
});

test('現在是交通中不算延後；步行與同一地點的說明', () => {
  const walk = buildCard({ now: taxi, next: { ...hotel, seq: 3, startMs: T0 + 40 * MIN }, tMs: T0 + 20 * MIN, gps: { lat: 35.1575, lng: 129.06 }, segment: { mode: 'walk' } });
  assert.equal(walk.delay, null);
  assert.equal(walk.next.travel, '距離近，可步行；地圖以直線表示');
  const same = buildCard({ now: hotel, next: { ...hotel, seq: 3, startMs: T0 + 5 * MIN }, tMs: T0, gps: null, segment: undefined });
  assert.equal(same.next.travel, '同一地點');
  assert.equal(same.next.direction, null);
  assert.equal(same.next.distance, '就在這裡');
});

test('行程開始前沒有 GPS：沒有方位，提示開定位', () => {
  const c = buildCard({ now: null, next: hotel, tMs: hotel.startMs - 90 * MIN, gps: null, segment: undefined });
  assert.equal(c.status, 'before');
  assert.equal(c.now, null);
  assert.equal(c.next.direction, null);
  assert.equal(c.next.distanceNote, '開啟定位才能顯示方向與距離');
  assert.equal(c.next.countdown, '還有 1 小時 30 分鐘出發');
});

test('行程結束後', () => {
  const c = buildCard({ now: taxi, next: null, tMs: T0, gps: null });
  assert.equal(c.status, 'after');
  assert.equal(c.next, null);
});
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `npm test`
Expected: FAIL，`Cannot find module .../card.js`

- [ ] **Step 3: 實作** `src/lib/live/card.js`

```js
// 卡片要顯示的文字。方位與距離皆為直線；車程用 OSRM 時間加緩衝
import { distanceM, bearingDeg, compass8, formatDistance } from './geo.js';

export const DRIVE_BUFFER = 1.3; // 假日海雲台、廣安里易塞車，取 spec 20–30% 的上限
const NEAR_M = 50;
const ARRIVED_M = 300;
const IN_BUSAN_M = 30000;

export const TYPE_LABEL = { flight: '航班', transport: '交通', food: '餐飲', ticket: '景點', shopping: '購物', hotel: '住宿' };

export const driveMinutes = (durationS) => Math.ceil((durationS * DRIVE_BUFFER) / 60 / 5) * 5;

function minutesText(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h} 小時${m ? ` ${m} 分鐘` : ''}` : `${m} 分鐘`;
}

function travelText(segment, route) {
  if (!segment) return '同一地點';
  if (segment.mode === 'flight') return '航班';
  if (segment.mode === 'walk') return '距離近，可步行；地圖以直線表示';
  if (!route) return '沒有路線資料，地圖以直線表示';
  return `車程約 ${driveMinutes(route.durationS)} 分鐘（路線估計加 30% 塞車緩衝，以 Kakao T／k.ride 為準）`;
}

const brief = (s) => ({ icon: s.icon, title: s.title, typeLabel: TYPE_LABEL[s.type] ?? s.type });

export function buildCard({ now, next, tMs, gps, segment, route }) {
  const status = !now ? 'before' : !next ? 'after' : 'during';
  const origin = gps ?? now;
  let bearing = null;
  let nextCard = null;

  if (next) {
    let direction = null;
    let distance = null;
    let distanceNote = '開啟定位才能顯示方向與距離';
    if (origin) {
      const d = distanceM(origin, next);
      distanceNote = gps ? '從你的位置算的直線距離' : `從「${now.title}」算的直線距離`;
      if (d < NEAR_M) {
        distance = '就在這裡';
      } else {
        bearing = bearingDeg(origin, next);
        direction = `${compass8(bearing)}方`;
        distance = formatDistance(d);
      }
    }
    const left = Math.max(0, Math.ceil((next.startMs - tMs) / 60000));
    nextCard = {
      ...brief(next),
      time: next.time,
      countdown: `還有 ${minutesText(left)}出發`,
      direction,
      distance,
      distanceNote,
      travel: travelText(segment, route),
      gmap: next.gmap,
      nmap: next.nmap,
    };
  }

  let delay = null;
  if (gps && now && now.type !== 'transport') {
    const away = distanceM(gps, now);
    const late = Math.floor((tMs - now.startMs) / 60000);
    if (away > ARRIVED_M && away < IN_BUSAN_M && late > 0) delay = `已延後 ${minutesText(late)}（還沒到「${now.title}」）`;
  }

  return { status, now: now ? brief(now) : null, next: nextCard, delay, bearing };
}
```

注意 `countdown` 的字串：`minutesText` 結尾是「分鐘」或「小時」，模板 `還有 ${...}出發` 產出「還有 15 分鐘出發」。

- [ ] **Step 4: 跑測試確認通過**

Run: `npm test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/live/card.js tests/live/card.test.mjs
git commit -m "feat(live): 卡片文字（方位、距離、車程、倒數、延後）"
```

---

### Task 7: Leaflet 地圖模組與 /live 頁面

**Files:**
- Modify: `package.json`（`npm install leaflet@^1.9.4`）
- Create: `src/lib/live/map.js`
- Create: `src/pages/live.astro`

**Interfaces:**
- Consumes: 前面所有模組；`/data/routes.json`。
- Produces（`map.js`）：`createLiveMap(el, { timeline, segments, routes }) → { showDay(day), redraw(), focus({ now, next, origin, bearing }), setSelf(gps|null) }`。`routes` 是同一個物件參照，補抓後呼叫 `redraw()` 重畫當日路線。

這個任務沒有單元測試（純 DOM／Leaflet 接線），用瀏覽器驗證。

- [ ] **Step 1: 安裝 Leaflet**

Run: `npm install leaflet@^1.9.4`
Expected: `package.json` dependencies 多了 `leaflet`。改用 npm 而非 unpkg，是為了讓 JS／CSS 變成同源 `/_astro/*` 檔，`sw.js` 既有的「同源 GET 都快取」就能讓離線時地圖程式照常載入。

- [ ] **Step 2: 寫** `src/lib/live/map.js`

```js
// /live 的 Leaflet 圖層。不用 Leaflet 預設 marker 圖檔，全部用 divIcon／circleMarker
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// 沿用 map.astro 的每日顏色
export const DAY_COLORS = { 1: '#d4342c', 2: '#2563eb', 3: '#16a34a' };

const stopIcon = (s, role) => L.divIcon({
  className: `live-stop${role ? ` is-${role}` : ''}`,
  html: `<span class="live-stop-icon" aria-hidden="true">${s.icon}</span><span class="live-stop-num">${s.index + 1}</span>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

export function createLiveMap(el, { timeline, segments, routes }) {
  const map = L.map(el, { zoomControl: true }).setView([35.13, 129.07], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map);

  const dayLayer = L.layerGroup().addTo(map);
  const focusLayer = L.layerGroup().addTo(map);
  const selfLayer = L.layerGroup().addTo(map);
  let markers = new Map();
  let shownDay = null;

  function showDay(day) {
    if (day === shownDay) return;
    shownDay = day;
    dayLayer.clearLayers();
    markers = new Map();
    const color = DAY_COLORS[day] ?? '#566871';
    const pts = [];
    for (const s of segments.filter((g) => g.day === day && g.mode !== 'flight')) {
      const r = routes[s.key];
      const line = r
        ? L.geoJSON(r.geometry, { style: { color, weight: 5, opacity: 0.85 } })
        : L.polyline([[s.from.lat, s.from.lng], [s.to.lat, s.to.lng]], { color, weight: 4, opacity: 0.8, dashArray: '8 8' })
          .bindTooltip(s.mode === 'walk' ? '步行（直線）' : '直線距離（沒有路線資料）');
      line.addTo(dayLayer);
      pts.push([s.from.lat, s.from.lng], [s.to.lat, s.to.lng]);
    }
    for (const s of timeline.filter((x) => x.day === day && x.type !== 'transport')) {
      if (s.utcOffset) continue; // 桃園起飛不在釜山地圖上
      const m = L.marker([s.lat, s.lng], { icon: stopIcon(s), title: `${s.time} ${s.title}`, keyboard: false })
        .bindPopup(`<strong>${s.time} ${s.title}</strong>`)
        .addTo(dayLayer);
      markers.set(s.seq, m);
      pts.push([s.lat, s.lng]);
    }
    if (pts.length) map.fitBounds(pts, { padding: [28, 28] });
  }

  function redraw() {
    const d = shownDay;
    shownDay = null;
    if (d !== null) showDay(d);
  }

  function focus({ now, next, origin, bearing }) {
    focusLayer.clearLayers();
    for (const [role, s] of [['now', now], ['next', next]]) {
      if (!s || s.utcOffset) continue;
      L.marker([s.lat, s.lng], { icon: stopIcon(s, role), zIndexOffset: 1000, keyboard: false }).addTo(focusLayer);
    }
    if (origin && next && bearing !== null) {
      L.polyline([[origin.lat, origin.lng], [next.lat, next.lng]], { color: '#11283d', weight: 3, dashArray: '2 8' }).addTo(focusLayer);
      L.marker([origin.lat, origin.lng], {
        icon: L.divIcon({
          className: 'live-arrow',
          html: `<span style="transform:rotate(${bearing - 90}deg)" aria-hidden="true">➤</span>`,
          iconSize: [44, 44],
          iconAnchor: [22, 22],
        }),
        zIndexOffset: 1100,
        keyboard: false,
      }).addTo(focusLayer);
    }
  }

  function setSelf(gps) {
    selfLayer.clearLayers();
    if (!gps) return;
    if (gps.accuracy) L.circle([gps.lat, gps.lng], { radius: gps.accuracy, color: '#3c6f9a', weight: 1, fillOpacity: 0.1 }).addTo(selfLayer);
    L.circleMarker([gps.lat, gps.lng], { radius: 9, color: '#fff', weight: 3, fillColor: '#3c6f9a', fillOpacity: 1 })
      .bindTooltip('你在這裡').addTo(selfLayer);
  }

  return { showDay, redraw, focus, setSelf };
}
```

- [ ] **Step 3: 寫** `src/pages/live.astro`

```astro
---
import Base from '../layouts/Base.astro';
import { trip } from '../data/itinerary';
const tripJson = JSON.stringify(trip);
---

<Base title="即時行程">
  <main class="live">
    <script type="application/json" id="live-trip" set:html={tripJson}></script>

    <div id="live-map" class="live-map" role="region" aria-label="行程地圖"></div>

    <section class="live-panel">
      <div class="live-modes" role="group" aria-label="切換模式">
        <button type="button" class="live-btn" data-mode="live" aria-pressed="false">即時</button>
        <button type="button" class="live-btn" data-mode="preview" aria-pressed="false">預覽</button>
      </div>
      <p id="live-notice" class="live-notice" hidden></p>

      <div id="live-controls" class="live-controls">
        <button type="button" id="live-gps" class="live-btn">📍 開啟定位</button>
        <p id="live-gps-status" class="live-small">沒有定位時，用行程時間判斷現在在哪一站。</p>
      </div>

      <div id="preview-controls" class="live-controls" hidden>
        <div class="live-days" role="group" aria-label="選擇日期">
          {trip.days.map((d) => (
            <button type="button" class="live-btn" data-day={d.day} aria-pressed="false">Day {d.day}<br /><small>{d.date}</small></button>
          ))}
        </div>
        <label class="live-slider">
          <span>時間 <strong id="preview-time">--:--</strong></span>
          <input id="preview-range" type="range" min="0" max="1435" step="5" value="0" />
        </label>
        <button type="button" id="preview-play" class="live-btn" aria-pressed="false">▶ 播放這一天</button>
      </div>

      <div class="live-cards" aria-live="polite">
        <article class="live-card">
          <h2 class="live-label">現在</h2>
          <p id="now-title" class="live-big">—</p>
          <p id="now-type" class="live-small"></p>
        </article>

        <article class="live-card is-next">
          <h2 class="live-label">下一站 <span id="next-time"></span></h2>
          <p id="next-title" class="live-big">—</p>
          <p id="next-where" class="live-where"></p>
          <p id="next-note" class="live-small"></p>
          <p id="next-travel" class="live-mid"></p>
          <p id="next-countdown" class="live-mid"></p>
          <p id="live-delay" class="live-delay" hidden></p>
          <div class="live-nav">
            <a id="next-nmap" class="live-btn is-primary" target="_blank" rel="noopener">Naver Map 導航</a>
            <a id="next-gmap" class="live-btn" target="_blank" rel="noopener">Google Map</a>
          </div>
        </article>
      </div>
      <p class="live-small">方位與距離為直線；車程為 OSRM 路線估計再加 30% 緩衝，實際以 Kakao T／k.ride 為準。韓國步行與公車導航請用 Naver Map。離線時地圖底圖可能空白，站點、路線與卡片仍可用。</p>
    </section>
  </main>
</Base>

<script>
  import { buildTimeline, findNowNext, parseSeoulLocal, tripRange, dayOf, formatSeoul, dayDate } from '../lib/live/timeline.js';
  import { buildSegments } from '../lib/live/segments.js';
  import { fillMissingRoutes } from '../lib/live/osrm.js';
  import { buildCard } from '../lib/live/card.js';
  import { createLiveMap } from '../lib/live/map.js';

  const trip = JSON.parse(document.getElementById('live-trip').textContent);
  const timeline = buildTimeline(trip);
  const segments = buildSegments(timeline);
  const range = tripRange(trip);
  const params = new URLSearchParams(location.search);
  const simulated = parseSeoulLocal(params.get('t'));
  const dayParam = Number(params.get('day'));
  const $ = (id) => document.getElementById(id);

  let routes = {};
  try {
    const res = await fetch('/data/routes.json');
    if (res.ok) routes = (await res.json()).routes ?? {};
  } catch { /* 離線且沒快取：全部畫直線 */ }

  const map = createLiveMap($('live-map'), { timeline, segments, routes });

  const clock = () => simulated ?? Date.now();
  const inTrip = (ms) => ms >= range.startMs && ms <= range.endMs;
  const dayStartMs = (day) => Date.parse(`${dayDate(trip.startDate, day)}T00:00:00+09:00`);

  let mode = simulated || inTrip(Date.now()) ? 'live' : 'preview';
  let previewDay = dayParam >= 1 && dayParam <= trip.days.length ? dayParam : simulated ? dayOf(trip, simulated) : 1;
  let gps = null;
  let watchId = null;
  let playTimer = null;

  const firstOfDay = timeline.find((s) => s.day === previewDay);
  const initMs = simulated && dayOf(trip, simulated) === previewDay ? simulated : firstOfDay.startMs;
  $('preview-range').value = String(Math.max(0, Math.round((initMs - dayStartMs(previewDay)) / 300000) * 5));

  function previewMs() {
    return dayStartMs(previewDay) + Number($('preview-range').value) * 60000;
  }

  function setText(id, text) {
    $(id).textContent = text ?? '';
  }

  function render() {
    const tMs = mode === 'live' ? clock() : previewMs();
    const { now, next } = findNowNext(timeline, tMs);
    const segment = next ? segments.find((s) => s.toSeq === next.seq) : undefined;
    const route = segment ? routes[segment.key] : undefined;
    const useGps = mode === 'live' ? gps : null;
    const card = buildCard({ now, next, tMs, gps: useGps, segment, route });

    map.showDay(mode === 'live' ? dayOf(trip, tMs) : previewDay);
    map.setSelf(useGps);
    map.focus({ now, next, origin: useGps ?? now, bearing: card.bearing });

    setText('now-title', card.now ? `${card.now.icon} ${card.now.title}` : card.status === 'before' ? '行程尚未開始' : '—');
    setText('now-type', card.now ? `${card.now.typeLabel}・${formatSeoul(now.startMs)} 開始` : '');
    if (card.next) {
      setText('next-time', `・行程 ${card.next.time}`);
      setText('next-title', `${card.next.icon} ${card.next.title}`);
      setText('next-where', card.next.direction ? `${card.next.direction} ${card.next.distance}` : card.next.distance ?? '');
      setText('next-note', card.next.distanceNote);
      setText('next-travel', card.next.travel);
      setText('next-countdown', card.next.countdown);
      $('next-nmap').href = card.next.nmap;
      $('next-gmap').href = card.next.gmap;
    } else {
      setText('next-time', '');
      setText('next-title', '行程結束，平安回家');
      ['next-where', 'next-note', 'next-travel', 'next-countdown'].forEach((id) => setText(id, ''));
    }
    $('live-delay').hidden = !card.delay;
    $('live-delay').textContent = card.delay ?? '';
    $('preview-time').textContent = formatSeoul(previewMs());
    $('preview-range').setAttribute('aria-valuetext', `Day ${previewDay} ${formatSeoul(previewMs())}`);
  }

  function setMode(m) {
    mode = m;
    document.querySelectorAll('[data-mode]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === m)));
    $('live-controls').hidden = m !== 'live';
    $('preview-controls').hidden = m !== 'preview';
    const notice = $('live-notice');
    if (m === 'live' && simulated) {
      notice.textContent = `模擬時間：${formatSeoul(simulated)}（首爾）`;
    } else if (m === 'preview' && !inTrip(Date.now())) {
      notice.textContent = Date.now() < range.startMs ? '行程尚未開始，先用預覽看看每一站。' : '行程已結束。';
    } else {
      notice.textContent = '';
    }
    notice.hidden = !notice.textContent;
    stopPlay();
    render();
  }

  function setPreviewDay(day) {
    previewDay = day;
    document.querySelectorAll('[data-day]').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.day) === day)));
    render();
  }

  function stopPlay() {
    clearInterval(playTimer);
    playTimer = null;
    $('preview-play').setAttribute('aria-pressed', 'false');
    $('preview-play').textContent = '▶ 播放這一天';
  }

  document.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () => setMode(b.dataset.mode)));
  document.querySelectorAll('[data-day]').forEach((b) => b.addEventListener('click', () => setPreviewDay(Number(b.dataset.day))));
  $('preview-range').addEventListener('input', () => { stopPlay(); render(); });
  $('preview-play').addEventListener('click', () => {
    if (playTimer) return stopPlay();
    const r = $('preview-range');
    if (Number(r.value) >= Number(r.max)) r.value = '0';
    $('preview-play').setAttribute('aria-pressed', 'true');
    $('preview-play').textContent = '⏸ 暫停';
    playTimer = setInterval(() => {
      r.value = String(Math.min(Number(r.max), Number(r.value) + 5));
      render();
      if (Number(r.value) >= Number(r.max)) stopPlay();
    }, 100); // 5 分鐘／0.1 秒，一天約 30 秒
  });

  $('live-gps').addEventListener('click', () => {
    if (watchId !== null) return;
    if (!('geolocation' in navigator)) { $('live-gps-status').textContent = '這台裝置不支援定位，改用行程時間判斷。'; return; }
    $('live-gps-status').textContent = '定位中…';
    watchId = navigator.geolocation.watchPosition(
      (p) => {
        gps = { lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy };
        $('live-gps-status').textContent = `已定位（誤差約 ${Math.round(p.coords.accuracy)} 公尺）`;
        render();
      },
      (err) => {
        gps = null;
        watchId = null;
        $('live-gps-status').textContent = err.code === err.PERMISSION_DENIED
          ? '沒有定位權限，改用行程時間判斷；方向從現在這站算。'
          : '暫時抓不到位置，改用行程時間判斷。';
        render();
      },
      { enableHighAccuracy: true, maximumAge: 15000, timeout: 20000 },
    );
  });

  setPreviewDay(previewDay);
  setMode(mode);
  setInterval(() => { if (mode === 'live') render(); }, 30000);

  // routes.json 缺的段落才即時補抓，有抓到就重畫（不要 reload：補抓結果沒存檔，reload 會無限循環）
  const before = Object.keys(routes).length;
  fillMissingRoutes(segments, routes, { timeoutMs: 5000 }).then(() => {
    if (Object.keys(routes).length > before) { map.redraw(); render(); }
  });
</script>

<style is:global>
  .live { max-width: 720px; margin: 0 auto; }
  .live-map { height: 45vh; min-height: 260px; width: 100%; }
  .live-panel { padding: 1rem; font-size: 18px; }
  .live-modes, .live-days, .live-nav { display: flex; gap: 0.5rem; flex-wrap: wrap; }
  .live-modes .live-btn, .live-days .live-btn, .live-nav .live-btn { flex: 1; }
  .live-btn {
    min-height: 48px; min-width: 48px; padding: 0.5rem 1rem;
    font: inherit; font-weight: 700; line-height: 1.3;
    border: 2px solid var(--teal-dark); border-radius: var(--radius);
    background: var(--surface); color: var(--ink);
    display: inline-flex; align-items: center; justify-content: center; text-align: center;
    text-decoration: none; cursor: pointer;
  }
  .live-btn[aria-pressed="true"], .live-btn.is-primary { background: var(--teal-dark); color: var(--paper); }
  .live-btn small { font-weight: 500; font-size: 0.85em; }
  .live-controls { margin: 0.75rem 0; display: grid; gap: 0.5rem; }
  .live-slider { display: grid; gap: 0.25rem; }
  .live-slider input { width: 100%; min-height: 48px; accent-color: var(--teal-dark); }
  .live-notice { margin-top: 0.75rem; padding: 0.75rem; border-left: 4px solid var(--yellow); background: var(--surface); }
  .live-cards { display: grid; gap: 0.75rem; margin: 1rem 0; }
  .live-card { background: var(--surface); border: 2px solid var(--line); border-radius: var(--radius); padding: 1rem; }
  .live-card.is-next { border-color: var(--teal-dark); }
  .live-label { font-family: var(--sans); font-size: 18px; color: var(--muted); font-weight: 700; }
  .live-big { font-size: 26px; font-weight: 700; line-height: 1.35; }
  .live-where { font-size: 30px; font-weight: 900; color: var(--teal-dark); }
  .live-mid { font-size: 20px; font-weight: 500; }
  .live-small { font-size: 18px; color: var(--muted); }
  .live-delay { font-size: 22px; font-weight: 700; color: var(--red); }
  .live-delay::before { content: '⚠️ '; }
  .live-nav { margin-top: 0.75rem; }
  .live-stop { background: #fff; border: 3px solid #11283d; border-radius: 50%; display: grid; place-items: center; position: relative; font-size: 20px; }
  .live-stop.is-now { border-color: #b93a32; border-width: 5px; }
  .live-stop.is-next { border-color: #1e7b76; border-width: 5px; border-style: dashed; }
  .live-stop-num { position: absolute; right: -6px; bottom: -6px; background: #11283d; color: #fff; border-radius: 999px; font: 700 12px/18px var(--sans); min-width: 18px; text-align: center; }
  .live-arrow span { display: block; font-size: 36px; line-height: 44px; text-align: center; color: #11283d; text-shadow: 0 0 3px #fff; }
</style>
```

設計說明（給實作者）：
- 現在／下一站的地圖標記以「實線紅框」「虛線綠框」區分，不只靠顏色；卡片文字是主要資訊來源。
- `top-level await` 在 Astro 打包的 `<script>`（type=module）可用。
- 若 Leaflet popup／tooltip 在暗色模式下看不清，只調 `.live-*` 樣式，不改全域。

- [ ] **Step 4: 啟動 dev server 驗證預覽模式**

用 `preview_start {name: "busan-dev"}` 開 `http://localhost:4321/live?day=2`（launch.json 已有設定，不要用 Bash 跑 server）。檢查：
1. `read_console_messages` 沒有錯誤。
2. 預覽模式自動開啟（今天不在行程期間），提示「行程尚未開始」。
3. 用 `computer` 點滑桿、按方向鍵，`read_page` 確認：拉到 Day 2 14:30 時「現在」為「🚕 搭車去美浦站」、「下一站」為「🚃 海邊列車（해변열차）」，與 `itinerary.js` 一致；再抽 Day 1 10:20（現在 Spa Land）、Day 3 18:10（現在刀削麵、下一站去機場）。
4. 地圖畫出 Day 2 道路形狀（不是直線），步行段是虛線。
5. 按「播放這一天」會自動前進，再按暫停。

- [ ] **Step 5: 驗證即時模式（模擬時間＋GPS）**

開 `http://localhost:4321/live?t=2026-11-01T14:30`。
1. 預設即時模式，提示「模擬時間：11/01 14:30（首爾）」。
2. 不開定位時：下一站方位從「搭車去美浦站」的座標算；`next-where` 的文字與 `node -e` 用 `geo.js` 算出的結果一致。
3. 模擬 GPS：頁面載入後、按「開啟定位」前，用 `javascript_tool` 執行 `navigator.geolocation.watchPosition = (ok) => { ok({ coords: { latitude: <lat>, longitude: <lng>, accuracy: 10 } }); return 1; }`，再點按鈕。記下卡片方位與距離，並用 `node --input-type=module -e "import * as g from './src/lib/live/geo.js'; …"` 獨立計算比對，三組都要一致：
   - `?t=2026-11-01T14:30`，GPS 在西面飯店座標 → 下一站（海邊列車）
   - `?t=2026-11-01T14:30`，GPS 在海雲台市場座標 → 下一站
   - `?t=2026-11-01T15:00`（現在是海邊列車，非交通），GPS 在廣安里 Working Holiday 座標 → 應出現「已延後 15 分鐘（還沒到「海邊列車（해변열차）」）」
4. 方向箭頭指向下一站。

- [ ] **Step 6: 驗證離線／OSRM 失敗**

1. 暫時把 `public/data/routes.json` 改名，重新整理 `/live?day=2`：所有開車路段變成虛線直線，卡片顯示「沒有路線資料，地圖以直線表示」，`read_console_messages` 沒有 JS 錯誤（補抓 OSRM 失敗應該安靜結束）。驗證完把檔名改回來。
2. `resize_window` 切 `mobile`（375×812）與 `desktop` 各截圖一次，確認上半地圖、下半卡片、字夠大、按鈕不擠；暗色模式（`colorScheme: 'dark'`）截一次確認對比。測完 `resize_window preset: desktop`。

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json src/lib/live/map.js src/pages/live.astro
git commit -m "feat(live): 新增 /live 動態行程地圖頁面（即時與預覽模式）"
```

---

### Task 8: 導覽列與離線快取

**Files:**
- Modify: `src/components/Nav.astro:3-11`
- Modify: `public/sw.js:2-7`

- [ ] **Step 1: 加入主導覽**

`Nav.astro` 的 `primary` 在 `{ href: '/', label: '總覽' },` 後面加：

```js
  { href: '/live', label: '即時' },
```

- [ ] **Step 2: 更新 sw.js**

```js
const CACHE = 'busan-v4';
const URLS = [
  '/', '/live/', '/prepare/', '/guide/', '/food/', '/day1/', '/day2/', '/day3/', '/map/', '/weather/', '/tickets/',
  '/expenses/', '/calendar/', '/planner/', '/import/', '/planb/', '/new/',
  '/js/trip-tools.js', '/manifest.json', '/data/routes.json',
];
```

Leaflet 已同源打包在 `/_astro/`，第一次開 `/live` 時由既有 fetch handler 自動快取，不需列入 `URLS`（檔名有 hash，寫死會過期）。OSM 地磚不快取（使用條款不允許大量預抓），頁面已註明離線時底圖可能空白。

- [ ] **Step 3: 驗證**

`npm run build` 成功後，`preview_start {name: "busan-preview"}` 開 `http://localhost:4322/live/`：
1. 手機寬度（375）導覽列 9 個項目都看得到、沒有換行或被切掉；若太擠，把「即時」放在 `primary` 並把 `Day 3` 以外不常用的一項移到 `more`，**先回報使用者再改**。
2. `javascript_tool`：`(await caches.open('busan-v4')).keys()` 包含 `/live/` 與 `/data/routes.json`，且 `busan-v3` 已被刪除。

- [ ] **Step 4: Commit**

```bash
git add src/components/Nav.astro public/sw.js
git commit -m "feat(live): 導覽列加入即時頁，Service Worker 快取 /live 與路線資料"
```

---

### Task 9: 驗收

- [ ] `npm test` 全部通過。
- [ ] `npm run build` 通過，prebuild 列出 `N／N 段開車路線已就緒`（缺的段落有列出）。
- [ ] 逐條對照 spec「驗收條件」1–6，每條附證據（截圖、`read_page` 片段、指令輸出）。
- [ ] 鍵盤：Tab 能到模式按鈕、日期按鈕、滑桿、播放、導航按鈕；滑桿方向鍵每次 5 分鐘。
- [ ] 回報使用者：Task 2 查到與原約略值差距大的地點、新指定的冷麵與烤肉店家、OSRM 失敗段落（若有）。
- [ ] 更新 `.agent/memory/working/WORKSPACE.md`，執行 `python3 .agent/tools/memory_reflect.py live-map implement <outcome>`（AGENTS.md 規定）。

## 執行時注意

- 開工前依 AGENTS.md 跑 `python3 .agent/tools/recall.py "新增 Astro 頁面與 build 腳本"`，把結果列在「Consulted lessons before acting:」。
- 不要 force push；在 feature branch 上做（目前在 `main`）。
- 題外發現（不在本計畫範圍）：`.github/workflows/deploy.yml` 部署到 `--project-name=kumamoto-travel`，與 `package.json` 的 `busan-travel` 不一致，可能部署到錯的專案。只回報，不要改。

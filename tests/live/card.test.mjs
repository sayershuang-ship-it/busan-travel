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

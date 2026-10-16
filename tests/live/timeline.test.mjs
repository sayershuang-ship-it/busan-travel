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

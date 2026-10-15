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

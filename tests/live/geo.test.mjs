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

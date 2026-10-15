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

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

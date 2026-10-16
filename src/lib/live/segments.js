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

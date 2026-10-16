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

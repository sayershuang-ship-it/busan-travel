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

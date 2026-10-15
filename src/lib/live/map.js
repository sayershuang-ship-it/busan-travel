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

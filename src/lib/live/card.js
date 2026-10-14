// 卡片要顯示的文字。方位與距離皆為直線；車程用 OSRM 時間加緩衝
import { distanceM, bearingDeg, compass8, formatDistance } from './geo.js';

export const DRIVE_BUFFER = 1.3; // 假日海雲台、廣安里易塞車，取 spec 20–30% 的上限
const NEAR_M = 50;
const ARRIVED_M = 300;
const IN_BUSAN_M = 30000;

export const TYPE_LABEL = { flight: '航班', transport: '交通', food: '餐飲', ticket: '景點', shopping: '購物', hotel: '住宿' };

export const driveMinutes = (durationS) => Math.ceil((durationS * DRIVE_BUFFER) / 60 / 5) * 5;

function minutesText(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h} 小時${m ? ` ${m} 分鐘` : ''}` : `${m} 分鐘`;
}

function travelText(segment, route) {
  if (!segment) return '同一地點';
  if (segment.mode === 'flight') return '航班';
  if (segment.mode === 'walk') return '距離近，可步行；地圖以直線表示';
  if (!route) return '沒有路線資料，地圖以直線表示';
  return `車程約 ${driveMinutes(route.durationS)} 分鐘（路線估計加 30% 塞車緩衝，以 Kakao T／k.ride 為準）`;
}

const brief = (s) => ({ icon: s.icon, title: s.title, typeLabel: TYPE_LABEL[s.type] ?? s.type });

export function buildCard({ now, next, tMs, gps, segment, route }) {
  const status = !now ? 'before' : !next ? 'after' : 'during';
  const origin = gps ?? now;
  let bearing = null;
  let nextCard = null;

  if (next) {
    let direction = null;
    let distance = null;
    let distanceNote = '開啟定位才能顯示方向與距離';
    if (origin) {
      const d = distanceM(origin, next);
      distanceNote = gps ? '從你的位置算的直線距離' : `從「${now.title}」算的直線距離`;
      if (d < NEAR_M) {
        distance = '就在這裡';
      } else {
        bearing = bearingDeg(origin, next);
        direction = `${compass8(bearing)}方`;
        distance = formatDistance(d);
      }
    }
    const left = Math.max(0, Math.ceil((next.startMs - tMs) / 60000));
    nextCard = {
      ...brief(next),
      time: next.time,
      countdown: `還有 ${minutesText(left)}出發`,
      direction,
      distance,
      distanceNote,
      travel: travelText(segment, route),
      gmap: next.gmap,
      nmap: next.nmap,
    };
  }

  let delay = null;
  if (gps && now && now.type !== 'transport') {
    const away = distanceM(gps, now);
    const late = Math.floor((tMs - now.startMs) / 60000);
    if (away > ARRIVED_M && away < IN_BUSAN_M && late > 0) delay = `已延後 ${minutesText(late)}（還沒到「${now.title}」）`;
  }

  return { status, now: now ? brief(now) : null, next: nextCard, delay, bearing };
}

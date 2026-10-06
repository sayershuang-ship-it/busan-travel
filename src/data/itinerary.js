const map = (q) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
const sum = (acts) => acts.reduce((s, a) => s + a.budget, 0);

const day1 = [
  { time: '02:50', icon: '🛫', title: '桃園機場起飛', desc: '7C6164 濟州航空，第一航廈，託運 15kg', budget: 0, type: 'flight', gmap: map('Taoyuan International Airport Terminal 1') },
  { time: '06:10', icon: '✈️', title: '抵達金海機場', desc: '國際航廈入境、領行李，約 07:15 出關。先上網填好 e-Arrival Card', budget: 0, type: 'flight', gmap: map('Gimhae International Airport') },
  { time: '07:30', icon: '🚕', title: '搭車到釜山站', desc: '計程車約 25 分鐘、₩18,000–20,000；省錢可搭輕軌轉地鐵（05:00 起營運，約 ₩1,800、1 小時多）', budget: 20000, type: 'transport', gmap: map('Busan Station') },
  { time: '08:15', icon: '🏨', title: '寄放行李', desc: 'Almond Hotel 釜山站。早上只能寄放，下午才能入住', budget: 0, type: 'hotel', gmap: 'https://maps.app.goo.gl/aUqzeDCDvZSGLzHt6' },
  { time: '08:45', icon: '🍲', title: '豬肉湯飯 ①', desc: '釜山站步行約 4 分鐘。營業約 08:30–21:30（各來源略有出入），常要排隊', ko: '본전돼지국밥', budget: 30000, type: 'food', gmap: map('본전돼지국밥 부산역') },
  { time: '09:30', icon: '🚕', title: '計程車去好市多金海店', desc: '車程請在 Kakao T 查，預留 50 分鐘，趕 10:00 開門', budget: 45000, type: 'transport', gmap: 'https://maps.app.goo.gl/9HdHpWTyh6HaVjCS8' },
  { time: '10:15', icon: '🛒', title: '好市多（Costco）金海店', desc: '10:00 開門，一大早人少。帶會員卡與護照，付款用 Visa 最保險，Mastercard 說法不一，備現金。先買零食、堅果、保養品等耐放品，生鮮與冷藏品別買，要放 3 天又要搭飛機', ko: '코스트코 김해점', budget: 150000, type: 'shopping', gmap: 'https://maps.app.goo.gl/9HdHpWTyh6HaVjCS8' },
  { time: '12:45', icon: '🚕', title: '回釜山站，放下採買品', desc: '計程車回飯店，把戰利品寄放在櫃台，再輕裝去吃蟹', budget: 45000, type: 'transport', gmap: 'https://maps.app.goo.gl/aUqzeDCDvZSGLzHt6' },
  { time: '14:15', icon: '🦀', title: '札嘎其市場午餐', desc: '1 樓挑蟹、2 樓代客料理。2026 年遊客回報約 ₩70,000–100,000／kg，另加人頭費約 ₩5,000／人與料理費。先問 3–5 家，請店家扣掉籃子重量，成交前問「全部多少錢」', ko: '자갈치시장', budget: 200000, type: 'food', gmap: map('자갈치시장') },
  { time: '16:15', icon: '🧴', title: '南浦洞 Olive Young', desc: '保養＋抗老：精華、乳霜、防曬。單筆滿 ₩15,000 可退稅，結帳出示護照正本、辦「即時退稅」。南浦店能否辦理需現場問，不行就留到第 2 天廣安里店（官網標示可退）', ko: '올리브영 남포', budget: 100000, type: 'shopping', gmap: map('올리브영 남포') },
  { time: '17:15', icon: '🥞', title: '南浦洞 BIFF 小吃', desc: '씨앗호떡（堅果糖餡煎餅）與 부산어묵（魚板串），釜山代表街頭小吃', ko: '씨앗호떡', budget: 9000, type: 'food', gmap: map('BIFF광장 씨앗호떡'), alt: { icon: '🏬', title: '樂天百貨光復店 地下食品區', desc: '雨天改在室內吃小點心', budget: 9000, type: 'food' } },
  { time: '18:00', icon: '🛏️', title: '入住、早點睡', desc: '凌晨出發，已經很累，晚餐吃得下再說，不排正餐', budget: 0, type: 'hotel', gmap: 'https://maps.app.goo.gl/aUqzeDCDvZSGLzHt6' },
];

const day2 = [
  { time: '08:30', icon: '🍲', title: '豬肉湯飯 ②', desc: '廣安里店，24 小時營業。湯頭較濃、肉量大方；傍晚人多，早上較好吃', ko: '수변최고돼지국밥 광안점', budget: 30000, type: 'food', gmap: map('수변최고돼지국밥 광안로 63') },
  { time: '10:00', icon: '🧴', title: '廣安里 Olive Young', desc: '官網標示可現場退稅。補齊昨天沒買的精華與防曬，面膜與護手霜也在這裡湊', ko: '올리브영 광안리점', budget: 80000, type: 'shopping', gmap: map('올리브영 광안리점') },
  { time: '12:00', icon: '🍜', title: '釜山冷麵 밀면', desc: '小麥冷麵，酸甜辣湯頭，釜山人的夏天味，11 月也有人吃。搭配煎餃（만두）', ko: '밀면', budget: 28000, type: 'food', gmap: map('밀면 수영구') },
  { time: '13:30', icon: '🐚', title: '海雲台市場小吃', desc: '烤貝、年糕、炸物，邊走邊吃。吃完在海邊走走，回飯店休息', ko: '해운대시장', budget: 40000, type: 'food', gmap: map('해운대시장'), alt: { icon: '🏬', title: '新世界 Centum City 美食街', desc: '雨天改在百貨內吃，室內不淋雨', budget: 40000, type: 'food' } },
  { time: '16:00', icon: '🛏️', title: '回飯店休息', desc: '兩天都早起，下午補眠，晚上再出門', budget: 0, type: 'hotel', gmap: 'https://maps.app.goo.gl/aUqzeDCDvZSGLzHt6' },
  { time: '18:30', icon: '🌉', title: '廣安里夜景與晚餐', desc: '看廣安大橋點燈，海邊挑一家烤肉或海鮮，慢慢吃', ko: '광안리', budget: 70000, type: 'food', gmap: map('광안리해수욕장'), alt: { icon: '🥩', title: '室內烤肉晚餐', desc: '雨天不看夜景，在飯店附近找室內烤肉店', budget: 70000, type: 'food' } },
];

const day3 = [
  { time: '09:00', icon: '🍲', title: '豬肉湯飯 ③', desc: '西面國밥巷，24 小時營業（公休日請先確認）。代表菜是맛녀석국밥', ko: '송정3대국밥 서면점', budget: 30000, type: 'food', gmap: map('송정3대국밥 서면점 서면로68번길 33') },
  { time: '10:00', icon: '🏬', title: '西面購物', desc: '樂天百貨釜山本店、西面地下街。最後補貨與伴手禮。結帳出示護照，單筆滿 ₩15,000 辦即時退稅', ko: '서면', budget: 100000, type: 'shopping', gmap: map('롯데백화점 부산본점') },
  { time: '12:30', icon: '🍙', title: '釜山站最後一餐', desc: '충무김밥（忠武海苔飯卷配辣魷魚、蘿蔔）或 동래파전（東萊蔥煎餅）；삼진어묵 魚板帶回家', ko: '충무김밥', budget: 30000, type: 'food', gmap: map('부산역 충무김밥') },
  { time: '14:00', icon: '☕', title: '咖啡休息、整理行李', desc: '回飯店把採買品分裝進託運行李：液體與保養品放託運（已辦即時退稅的才可託運），總重 20kg 內，磅一次', budget: 10000, type: 'food', gmap: map('부산역 카페') },
  { time: '17:00', icon: '🥩', title: '晚餐：烤五花肉', desc: '釜山站周邊，最後一頓好好吃', budget: 60000, type: 'food', gmap: map('부산역 삼겹살') },
  { time: '18:30', icon: '🚕', title: '取行李、前往金海機場', desc: '計程車約 25 分鐘、₩18,000–20,000。金海機場退稅是人工櫃台、只有一人作業，會排隊，建議 19:00 前到', budget: 20000, type: 'transport', gmap: map('Gimhae International Airport') },
  { time: '22:00', icon: '🛫', title: '7C6163 起飛', desc: '23:50 抵達桃園第一航廈，託運 15kg＋5kg', budget: 0, type: 'flight', gmap: map('Gimhae International Airport') },
];

export const trip = {
  title: '釜山三日自由行',
  subtitle: '豬肉湯飯・保養・好市多',
  dates: '2026/10/31 (六) → 11/2 (一)',
  travelers: 3,
  budget: 30000,
  budgetPerPerson: 10000,
  budgetCurrency: 'TWD',
  krwPerTwd: 45, // 概略匯率，出發前請依實際匯率調整
  startDate: '2026-10-31',
  timezone: 'Asia/Seoul',

  weather: {
    temp: '白天約 17–20°C／早晚約 8–12°C（推估）',
    condition: '深秋・早晚偏涼・日夜溫差大・海邊風大',
    tip: '長袖加薄針織，外面套風衣或薄外套；折疊傘備著',
  },

  hotel: {
    name: 'Almond Hotel 釜山站',
    note: '10/28 17:00（當地時間）前可免費取消。入住請帶護照，姓名需與訂房一致',
    gmap: 'https://maps.app.goo.gl/aUqzeDCDvZSGLzHt6',
  },

  days: [
    {
      day: 1,
      date: '10/31 (六)',
      title: '清晨抵達、好市多、帝王蟹',
      subtitle: '06:10 落地，湯飯、好市多開門採買、下午吃蟹',
      activities: day1,
      dayBudget: sum(day1),
      lat: 35.0996,
      lng: 129.0360,
    },
    {
      day: 2,
      date: '11/1 (日)',
      title: '廣安里與海雲台',
      subtitle: '湯飯、保養品、市場小吃、夜景',
      activities: day2,
      dayBudget: sum(day2),
      lat: 35.1587,
      lng: 129.1576,
    },
    {
      day: 3,
      date: '11/2 (一)',
      title: '西面補貨、返台',
      subtitle: '最後一天輕鬆逛，傍晚去機場',
      activities: day3,
      dayBudget: sum(day3),
      lat: 35.1572,
      lng: 129.0623,
    },
  ],

  budgetSummary: [
    { label: '機票', icon: '✈️', amount: 0, note: '已購票' },
    { label: '住宿', icon: '🏨', amount: 0, note: 'Almond Hotel 已預訂' },
    { label: '餐飲', icon: '🍜', amount: sum([...day1, ...day2, ...day3].filter(a => a.type === 'food')), note: '3 人，含帝王蟹與 3 家豬肉湯飯' },
    { label: '購物', icon: '🛍️', amount: sum([...day1, ...day2, ...day3].filter(a => a.type === 'shopping')), note: '保養品＋好市多＋伴手禮' },
    { label: '交通', icon: '🚌', amount: sum([...day1, ...day2, ...day3].filter(a => a.type === 'transport')) + 30000, note: '機場往返＋市區計程車（預估）' },
  ],

  // 座標：好市多、本錢、水邊最高、松亭三代、札嘎其、南浦 Olive Young、海雲台市場為地址查詢值；廣安里 Olive Young 與旅館為約略值
  locations: [
    { name: '金海國際機場 PUS', lat: 35.1796, lng: 128.9401, icon: 'airport', gmap: map('Gimhae International Airport') },
    { name: 'Almond Hotel 釜山站', lat: 35.1047, lng: 129.0394, icon: 'hotel', gmap: 'https://maps.app.goo.gl/aUqzeDCDvZSGLzHt6' },
    { name: '본전돼지국밥（湯飯①）', lat: 35.1166, lng: 129.0414, icon: 'food', gmap: map('본전돼지국밥 부산역') },
    { name: 'Olive Young 南浦', lat: 35.0995, lng: 129.0265, icon: 'shopping', gmap: map('올리브영 남포') },
    { name: '札嘎其市場', lat: 35.0966, lng: 129.0295, icon: 'food', gmap: map('자갈치시장') },
    { name: '수변최고돼지국밥 광안점（湯飯②）', lat: 35.1551, lng: 129.1190, icon: 'food', gmap: map('수변최고돼지국밥 광안로 63') },
    { name: 'Olive Young 廣安里', lat: 35.1532, lng: 129.1186, icon: 'shopping', gmap: map('올리브영 광안리점') },
    { name: 'COSTCO 金海店', lat: 35.2356, lng: 128.8387, icon: 'shopping', gmap: 'https://maps.app.goo.gl/9HdHpWTyh6HaVjCS8' },
    { name: '海雲台市場', lat: 35.1623, lng: 129.1632, icon: 'food', gmap: map('해운대시장') },
    { name: '송정3대국밥 서면점（湯飯③）', lat: 35.1556, lng: 129.0585, icon: 'food', gmap: map('송정3대국밥 서면점 서면로68번길 33') },
    { name: '西面・樂天百貨', lat: 35.1572, lng: 129.0623, icon: 'shopping', gmap: map('롯데백화점 부산본점') },
  ],

  dailyRoutes: {
    1: [[35.1796,128.9401],[35.1047,129.0394],[35.1166,129.0414],[35.2356,128.8387],[35.1047,129.0394],[35.0966,129.0295],[35.0995,129.0265]],
    2: [[35.1047,129.0394],[35.1551,129.1190],[35.1532,129.1186],[35.1623,129.1632],[35.1532,129.1186],[35.1047,129.0394]],
    3: [[35.1047,129.0394],[35.1556,129.0585],[35.1572,129.0623],[35.1166,129.0414],[35.1796,128.9401]],
  },
};

export const foods = [
  { name: '豬肉湯飯 ①', desc: '본전돼지국밥，釜山站步行 4 分鐘，落地後第一餐', price: '₩10,000-12,000', shop: '본전돼지국밥', lat: 35.1166, lng: 129.0414, gmap: map('본전돼지국밥 부산역') },
  { name: '豬肉湯飯 ②', desc: '수변최고돼지국밥 廣安店，24 小時，湯頭濃、肉多', price: '₩10,000-12,000', shop: '수변최고돼지국밥 광안점', lat: 35.1551, lng: 129.1190, gmap: map('수변최고돼지국밥 광안로 63') },
  { name: '豬肉湯飯 ③', desc: '송정3대국밥 西面店，24 小時，招牌맛녀석국밥', price: '₩10,000-12,000', shop: '송정3대국밥 서면점', lat: 35.1556, lng: 129.0585, gmap: map('송정3대국밥 서면점 서면로68번길 33') },
  { name: '帝王蟹', desc: '札嘎其市場 1 樓挑、2 樓代客料理', price: '₩150,000-250,000', shop: '札嘎其市場', lat: 35.0966, lng: 129.0295, gmap: map('자갈치시장') },
  { name: '釜山冷麵 밀면', desc: '小麥冷麵，酸甜辣湯頭，搭煎餃', price: '₩8,000-10,000', shop: '水營區', lat: 35.1700, lng: 129.1150, gmap: map('밀면 수영구') },
  { name: '씨앗호떡 與 魚板', desc: 'BIFF 廣場街頭小吃，釜山代表', price: '₩2,000-5,000', shop: '南浦洞 BIFF 廣場', lat: 35.0988, lng: 129.0276, gmap: map('BIFF광장 씨앗호떡') },
  { name: '충무김밥 / 동래파전', desc: '釜山站最後一餐，海苔飯卷或蔥煎餅', price: '₩8,000-15,000', shop: '釜山站周邊', lat: 35.1150, lng: 129.0405, gmap: map('부산역 충무김밥') },
  { name: '海雲台市場小吃', desc: '烤貝、年糕、炸物', price: '₩10,000-20,000', shop: '海雲台市場', lat: 35.1623, lng: 129.1632, gmap: map('해운대시장') },
];

export const contingency = {
  indoorSpots: [
    { icon: '🏬', name: '西面地下街', desc: '室內購物中心，不怕雨天', cost: '免費入場', area: '西面' },
    { icon: '🛍️', name: '樂天百貨', desc: '免稅＋地下超市', cost: '免費入場', area: '西面' },
    { icon: '🧴', name: 'Olive Young', desc: '各區皆有，可躲雨補保養品', cost: '免費入場', area: '南浦・海雲台' },
    { icon: '🛁', name: '汗蒸幕', desc: '西面、海雲台有多間', cost: '₩10,000-20,000', area: '西面' },
  ],
  scenarios: [
    {
      id: 'rain', icon: '🌧️', title: '雨天備案',
      desc: '11 月初釜山可能有雨。本行程大多在室內，影響不大。',
      tips: [
        '海雲台市場小吃改在好市多美食區或附近店家吃',
        '西面行程全在地下街與百貨內，Olive Young 與好市多也都是室內',
        '好市多與機場都是室內，不受影響',
      ],
      swappable: true,
    },
    {
      id: 'crab', icon: '🦀', title: '帝王蟹當日無法吃',
      desc: '札嘎其市場公休：每月第 1、3、5 個週二。10/31 是週六，不受影響。',
      tips: [
        '備案：南浦洞烤五花肉或生魚片店',
        '價格先問清楚「全部多少錢」',
      ],
      swappable: true,
    },
    {
      id: 'flight', icon: '✈️', title: '航班延誤',
      desc: '去程 02:50 起飛、回程 22:00 起飛。',
      tips: [
        '去程延誤 2 小時內：照原行程，湯飯後直接去南浦',
        '去程延誤 4 小時以上：Day 1 只保留湯飯與帝王蟹，好市多改到 Day 3 下午去機場前（搭車去金海店再到機場）',
        '回程至少 19:30 前抵達機場，退稅與託運都需要時間',
        '保留所有消費單據，申請旅遊不便險',
      ],
      swappable: false,
    },
    {
      id: 'tired', icon: '😴', title: '體力透支',
      desc: '走不動時的精簡版：',
      tips: [
        'Day 1 必去：豬肉湯飯＋好市多＋帝王蟹',
        'Day 2 必去：廣安里 Olive Young',
        'Day 3 必去：西面最後補貨',
        '其他全部跳過，休息優先',
      ],
      swappable: false,
    },
  ],
};

const map = (q) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
const sum = (acts) => acts.reduce((s, a) => s + a.budget, 0);

const day1 = [
  { time: '02:50', icon: '🛫', title: '桃園機場起飛', desc: '7C6164 濟州航空，第一航廈，託運 15kg', budget: 0, type: 'flight', gmap: map('Taoyuan International Airport Terminal 1') },
  { time: '06:10', icon: '✈️', title: '抵達金海機場', desc: '國際航廈入境、領行李，約 07:15 出關。先上網填好 e-Arrival Card。輕軌站內 MoneyBox 06:00 開，可換少量韓元、對面 E-mart24 買 T-money', budget: 0, type: 'flight', gmap: map('Gimhae International Airport') },
  { time: '07:30', icon: '🚕', title: '搭車到西面飯店', desc: '先到飯店寄行李。計程車約 25–30 分鐘、約 ₩20,000（估計，以 Kakao T 為準）；省錢可搭輕軌轉地鐵 2 號線到西面（05:00 起營運，約 ₩1,800）', budget: 20000, type: 'transport', gmap: map('Hotel BELLUS Seomyeon, 14-9 Jungang-daero 691beon-gil, Busanjin-gu, Busan') },
  { time: '08:15', icon: '🏨', title: '寄放行李', desc: 'Hotel BELLUS 西面。入住 16:00 起，早上只能寄放行李；入住請帶護照。接著去西面吃湯飯，步行或搭車約 10–15 分鐘（估計，以 Kakao T 為準）', budget: 0, type: 'hotel', gmap: map('Hotel BELLUS Seomyeon, 14-9 Jungang-daero 691beon-gil, Busanjin-gu, Busan') },
  { time: '08:45', icon: '🍲', title: '豬肉湯飯 ①', desc: '포항돼지국밥 西面店，1948 年創始、藍絲帶大獎，24 小時營業，湯頭奶白濃郁、豬肉軟嫩。西面站 1 號出口步行約 100 多公尺', ko: '포항돼지국밥 서면점', budget: 30000, type: 'food', gmap: map('포항돼지국밥 서면점 서면로68번길 27') },
  { time: '09:45', icon: '🚕', title: '搭車去 Centum City', desc: '從西面搭計程車去新世界 Centum City，約 20 分鐘（估計，以 Kakao T 為準）。Spa Land 09:00 就開', budget: 12000, type: 'transport', gmap: map('신세계 센텀시티 스파랜드') },
  { time: '10:15', icon: '🧖', title: '新世界 Spa Land', desc: '紅眼班機後的休息站：泡湯、汗蒸幕、躺著補眠，一次入場最多 4 小時（官方，成人 ₩26,000，超時每小時 ₩5,000）。帶毛巾、拖鞋，有置物櫃。若買 Busan Pass BIG5 可免費兌換', ko: '스파랜드', budget: 78000, type: 'ticket', gmap: map('신세계 센텀시티 스파랜드') },
  { time: '13:30', icon: '🏬', title: '午餐、逛 Centum City', desc: '新世界 Centum City 百貨與美食街，吃午餐、順便逛街。商品單筆滿 ₩15,000 可辦即時退稅', budget: 30000, type: 'food', gmap: map('신세계 센텀시티') },
  { time: '14:45', icon: '🚕', title: '計程車去好市多金海店', desc: '從 Centum City 過去路程較遠，在 Kakao T 查，預留 50–60 分鐘', budget: 45000, type: 'transport', gmap: 'https://maps.app.goo.gl/9HdHpWTyh6HaVjCS8' },
  { time: '15:45', icon: '🛒', title: '好市多（Costco）金海店', desc: '帶會員卡與護照，付款用 Visa 最保險，Mastercard 說法不一，備現金。先買零食、堅果、保養品等耐放品，生鮮與冷藏品別買，要放 3 天又要搭飛機。採買前請先確認週六營業時間，建議 17:15 前結帳', ko: '코스트코 김해점', budget: 150000, type: 'shopping', gmap: 'https://maps.app.goo.gl/9HdHpWTyh6HaVjCS8' },
  { time: '17:15', icon: '🚕', title: '回西面飯店、辦入住', desc: '計程車回飯店，辦入住（16:00 起）、把戰利品放房間，歇一下再輕裝出門', budget: 45000, type: 'transport', gmap: map('Hotel BELLUS Seomyeon, 14-9 Jungang-daero 691beon-gil, Busanjin-gu, Busan') },
  { time: '18:15', icon: '🚕', title: '搭車去南浦', desc: '西面到南浦約 15–20 分鐘（估計，以 Kakao T 為準）', budget: 10000, type: 'transport', gmap: map('자갈치시장') },
  { time: '18:45', icon: '🦀', title: '新東亞市場吃蟹', desc: '札嘎其一帶的新東亞市場。挑蟹後請店家料理或到樓上餐廳代煮；部分餐廳另收料理費與人頭費，先問 3–5 家，請店家扣掉籃子重量，成交前問「全部多少錢」。2026 年遊客回報約 ₩70,000–100,000／kg。攤位晚上收攤時間不一，建議 19:30 前入座（未查證）', ko: '신동아시장', budget: 200000, type: 'food', gmap: map('자갈치 신동아시장') },
  { time: '20:30', icon: '🧴', title: '南浦洞 Olive Young', desc: '保養＋抗老：精華、乳霜、防曬。單筆滿 ₩15,000 可退稅，結帳出示護照正本、辦「即時退稅」。南浦店能否辦理需現場問，不行就留到第 2 天廣安里店（官網標示可退）。營業約至 22:30（網路資料）', ko: '올리브영 남포', budget: 100000, type: 'shopping', gmap: map('올리브영 남포') },
  { time: '21:15', icon: '🥞', title: '南浦洞 BIFF 小吃', desc: '씨앗호떡（堅果糖餡煎餅）與 부산어묵（魚板串），釜山代表街頭小吃，邊走邊逛南浦洞', ko: '씨앗호떡', budget: 9000, type: 'food', gmap: map('BIFF광장 씨앗호떡'), alt: { icon: '🏬', title: '樂天百貨光復店 地下食品區', desc: '雨天改在室內吃小點心', budget: 9000, type: 'food' } },
  { time: '21:45', icon: '🛏️', title: '搭車回飯店、早點睡', desc: '搭計程車回西面，凌晨出發又走了一整天，早點休息', budget: 10000, type: 'transport', gmap: map('Hotel BELLUS Seomyeon, 14-9 Jungang-daero 691beon-gil, Busanjin-gu, Busan') },
];

const day2 = [
  { time: '07:50', icon: '🚕', title: '搭車去廣安里', desc: '從西面飯店搭計程車或地鐵到廣安里，約 25 分鐘（估計，以 Kakao T 為準）', budget: 12000, type: 'transport', gmap: map('수변최고돼지국밥 광안로 63') },
  { time: '08:30', icon: '🍲', title: '豬肉湯飯 ②', desc: '廣安里店，24 小時營業。湯頭較濃、肉量大方；傍晚人多，早上較好吃', ko: '수변최고돼지국밥 광안점', budget: 30000, type: 'food', gmap: map('수변최고돼지국밥 광안로 63') },
  { time: '10:00', icon: '🧴', title: '廣安里 Olive Young', desc: '官網標示可現場退稅。補齊昨天沒買的精華與防曬，面膜與護手霜也在這裡湊', ko: '올리브영 광안리점', budget: 80000, type: 'shopping', gmap: map('올리브영 광안리점') },
  { time: '11:30', icon: '🍜', title: '釜山冷麵 밀면', desc: '小麥冷麵，酸甜辣湯頭，釜山人的夏天味，11 月也有人吃。搭配煎餃（만두）', ko: '밀면', budget: 28000, type: 'food', gmap: map('밀면 수영구') },
  { time: '12:45', icon: '🐚', title: '海雲台市場小吃', desc: '烤貝、年糕、炸物，邊走邊吃，份量抓輕一點，接著要搭列車', ko: '해운대시장', budget: 20000, type: 'food', gmap: map('해운대시장'), alt: { icon: '🏬', title: '新世界 Centum City 美食街', desc: '雨天改在百貨內吃，室內不淋雨', budget: 20000, type: 'food' } },
  { time: '13:45', icon: '🚕', title: '搭車去美浦站', desc: '海雲台市場到海雲台海岸列車（Blue Line Park）美浦站，車程約 10–15 分鐘（估計）', budget: 8000, type: 'transport', gmap: map('해운대블루라인파크 미포정거장') },
  { time: '14:15', icon: '🚃', title: '海雲台海岸列車', desc: '美浦 → 青沙浦，沿海走，單程約 30 分鐘以上（網路資料）。10 月營運約 09:00–19:30，以官網 bluelinepark.com 為準；膠囊列車（天空膠囊）要另外預約。票價依來源約 ₩13,000–25,000／人，預算先抓 ₩13,000（未查證）', ko: '해운대 블루라인파크', budget: 39000, type: 'ticket', gmap: map('해운대블루라인파크 미포정거장') },
  { time: '15:15', icon: '☕', title: '青沙浦 DIART 咖啡', desc: '青沙浦站步行約 3 分鐘，看得到青沙浦燈塔，招牌卡伊馬克。營業時間各來源不一（09:30–21:00 或 10:30–21:30）', ko: '디아트커피', budget: 30000, type: 'food', gmap: map('디아트커피 청사포로128번길 12') },
  { time: '16:00', icon: '🚕', title: '搭車去松島', desc: '從青沙浦橫跨整個釜山到西區松島，約 60–70 分鐘（估計，請用 Kakao T 查）。這是全程最長的一段車程', budget: 40000, type: 'transport', gmap: map('송도해상케이블카 송림공원 탑승장') },
  { time: '17:15', icon: '🚠', title: '松島海上纜車', desc: '松林公園到岩南公園，往返約 20 分鐘，在海面上空約 86 公尺（網路資料）。營業 09:00–21:00，售票到 20:30。日落約 17:25（估計），剛好看黃昏到夜景。往返約 ₩19,000（水晶車廂約 ₩24,000）／人', ko: '송도해상케이블카', budget: 57000, type: 'ticket', gmap: map('송도해상케이블카 송림공원 탑승장') },
  { time: '19:00', icon: '🥩', title: '南浦洞韓牛晚餐', desc: '南浦洞韓牛，16:00–02:00 營業，肉嫩不腥，每人至少點三份（網路資料）。松島到南浦約 20–25 分鐘（估計）。價格我沒查到，預算是抓的', budget: 100000, type: 'food', gmap: map('남포동 한우') },
  { time: '21:00', icon: '🛏️', title: '搭車回飯店', desc: '南浦到西面約 20 分鐘（估計）。廣安里夜景這天不排，留給別的機會', budget: 10000, type: 'transport', gmap: map('Hotel BELLUS Seomyeon, 14-9 Jungang-daero 691beon-gil, Busanjin-gu, Busan') },
];


const day3 = [
  { time: '09:00', icon: '🍲', title: '豬肉湯飯 ③', desc: '西面國밥巷，24 小時營業（公休日請先確認）。代表菜是맛녀석국밥', ko: '송정3대국밥 서면점', budget: 30000, type: 'food', gmap: map('송정3대국밥 서면점 서면로68번길 33') },
  { time: '10:00', icon: '🏬', title: '西面購物', desc: '樂天百貨釜山本店、西面地下街。最後補貨與伴手禮。結帳出示護照，單筆滿 ₩15,000 辦即時退稅', ko: '서면', budget: 100000, type: 'shopping', gmap: map('롯데백화점 부산본점') },
  { time: '11:30', icon: '🧳', title: '回飯店分裝行李、退房', desc: '把採買品分裝進託運行李（Hotel BELLUS 12:00 退房，行李寄放櫃台）：液體與保養品放託運（已辦即時退稅的才可託運），總重 20kg 內，磅一次', budget: 0, type: 'hotel', gmap: map('Hotel BELLUS Seomyeon, 14-9 Jungang-daero 691beon-gil, Busanjin-gu, Busan') },
  { time: '12:30', icon: '🍽️', title: '西面午餐', desc: '到美食頁西面區挑一家，例如 이낙에산다 章腸鍋（11:00–20:50）或 Clam House 蛤貝（西面站 1 號出口）', ko: '이낙에산다 서면', budget: 30000, type: 'food', gmap: map('이낙에산다 서면 직영점') },
  { time: '14:30', icon: '🚕', title: '搭車去影島', desc: '西面到影島 Arte Museum，約 25–30 分鐘（估計，以 Kakao T 為準）。行李已寄放飯店', budget: 12000, type: 'transport', gmap: map('아르떼뮤지엄 부산 영도구 해양로247번길 29') },
  { time: '15:00', icon: '🎨', title: 'Arte Museum 釜山', desc: '沉浸式光影藝術展，約 1–1.5 小時，不能重入場。營業 10:00–20:00、最晚入場 19:00（官方，可能調整）。位置在影島，不是海雲台。票價 Obsidian 寫約 ₩18,000／人（未查證）', ko: '아르떼뮤지엄', budget: 54000, type: 'ticket', gmap: map('아르떼뮤지엄 부산 영도구 해양로247번길 29') },
  { time: '16:30', icon: '🚕', title: '搭車回西面', desc: '影島回西面約 25–30 分鐘（估計）。17:00 趕晚餐，回程要抓時間', budget: 12000, type: 'transport', gmap: map('Hotel BELLUS Seomyeon, 14-9 Jungang-daero 691beon-gil, Busanjin-gu, Busan') },
  { time: '17:15', icon: '🥩', title: '晚餐：熟成烤肉', desc: '올드맨션 西面田浦店，離飯店近。熟成五花／肩頸肉 110g 約 ₩10,000–12,000，平日 15:00–17:00 休息，17:00 剛好開。最後一頓好好吃', ko: '올드맨션', budget: 60000, type: 'food', gmap: map('올드맨션 서면전포점 전포대로209번길 17-6') },
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
    name: 'Hotel BELLUS 西面',
    note: '釜山鎮區中央大路 691 番街 14-9（Jungang-daero 691beonga-gil 14-9，47287），靠近田浦咖啡街。10/31 入住 16:00 起、11/2 退房 12:00。免費取消期限請看訂房確認信。入住請帶護照，姓名需與訂房一致',
    gmap: map('Hotel BELLUS Seomyeon, 14-9 Jungang-daero 691beon-gil, Busanjin-gu, Busan'),
  },

  days: [
    {
      day: 1,
      date: '10/31 (六)',
      title: '清晨抵達、Spa 休息、好市多、帝王蟹',
      subtitle: '落地先放行李吃湯飯，Spa Land 補眠，下午好市多，傍晚新東亞吃蟹、逛南浦洞',
      activities: day1,
      dayBudget: sum(day1),
      lat: 35.0996,
      lng: 129.0360,
    },
    {
      day: 2,
      date: '11/1 (日)',
      title: '廣安里、海岸列車與松島',
      subtitle: '湯飯、保養品、海岸列車、松島纜車看日落、南浦韓牛',
      activities: day2,
      dayBudget: sum(day2),
      lat: 35.1587,
      lng: 129.1576,
    },
    {
      day: 3,
      date: '11/2 (一)',
      title: '西面補貨、Arte Museum、返台',
      subtitle: '上午西面補貨，下午影島看展，傍晚去機場',
      activities: day3,
      dayBudget: sum(day3),
      lat: 35.1572,
      lng: 129.0623,
    },
  ],

  budgetSummary: [
    { label: '機票', icon: '✈️', amount: 0, note: '已購票' },
    { label: '住宿', icon: '🏨', amount: 0, note: 'Hotel BELLUS 西面' },
    { label: '餐飲', icon: '🍜', amount: sum([...day1, ...day2, ...day3].filter(a => a.type === 'food')), note: '3 人，含帝王蟹與 3 家豬肉湯飯' },
    { label: '購物', icon: '🛍️', amount: sum([...day1, ...day2, ...day3].filter(a => a.type === 'shopping')), note: '保養品＋好市多＋伴手禮' },
    { label: '票券', icon: '🎫', amount: sum([...day1, ...day2, ...day3].filter(a => a.type === 'ticket')), note: 'Spa Land、海岸列車、松島纜車、Arte Museum 單次票 3 人（Busan Pass 是否購買待定）' },
    { label: '交通', icon: '🚌', amount: sum([...day1, ...day2, ...day3].filter(a => a.type === 'transport')) + 30000, note: '機場往返＋市區計程車（預估）' },
  ],

  // 座標：好市多、本錢、水邊最高、松亭三代、札嘎其、南浦 Olive Young、海雲台市場為地址查詢值；廣安里 Olive Young、旅館（Hotel BELLUS 西面）、美浦站、青沙浦、松島纜車、Arte Museum 為約略值
  locations: [
    { name: '金海國際機場 PUS', lat: 35.1796, lng: 128.9401, icon: 'airport', gmap: map('Gimhae International Airport') },
    { name: 'Hotel BELLUS 西面', lat: 35.1575, lng: 129.0600, icon: 'hotel', gmap: map('Hotel BELLUS Seomyeon, 14-9 Jungang-daero 691beon-gil, Busanjin-gu, Busan') },
    { name: '포항돼지국밥 西面店（湯飯①）', lat: 35.1560, lng: 129.0586, icon: 'food', gmap: map('포항돼지국밥 서면점 서면로68번길 27') },
    { name: 'Olive Young 南浦', lat: 35.0995, lng: 129.0265, icon: 'shopping', gmap: map('올리브영 남포') },
    { name: '新世界 Spa Land（Centum City）', lat: 35.1693, lng: 129.1297, icon: 'shopping', gmap: map('신세계 센텀시티 스파랜드') },
    { name: '海雲台海岸列車 美浦站', lat: 35.1590, lng: 129.1740, icon: 'outdoor', gmap: map('해운대블루라인파크 미포정거장') },
    { name: '青沙浦 DIART 咖啡', lat: 35.1600, lng: 129.1925, icon: 'food', gmap: map('디아트커피 청사포로128번길 12') },
    { name: '松島海上纜車', lat: 35.0765, lng: 129.0165, icon: 'outdoor', gmap: map('송도해상케이블카 송림공원 탑승장') },
    { name: 'Arte Museum 釜山（影島）', lat: 35.0850, lng: 129.0420, icon: 'outdoor', gmap: map('아르떼뮤지엄 부산 영도구 해양로247번길 29') },
    { name: '札嘎其・新東亞市場', lat: 35.0966, lng: 129.0295, icon: 'food', gmap: map('자갈치시장') },
    { name: '수변최고돼지국밥 광안점（湯飯②）', lat: 35.1551, lng: 129.1190, icon: 'food', gmap: map('수변최고돼지국밥 광안로 63') },
    { name: 'Olive Young 廣安里', lat: 35.1532, lng: 129.1186, icon: 'shopping', gmap: map('올리브영 광안리점') },
    { name: 'COSTCO 金海店', lat: 35.2356, lng: 128.8387, icon: 'shopping', gmap: 'https://maps.app.goo.gl/9HdHpWTyh6HaVjCS8' },
    { name: '海雲台市場', lat: 35.1623, lng: 129.1632, icon: 'food', gmap: map('해운대시장') },
    { name: '송정3대국밥 서면점（湯飯③）', lat: 35.1556, lng: 129.0585, icon: 'food', gmap: map('송정3대국밥 서면점 서면로68번길 33') },
    { name: '西面・樂天百貨', lat: 35.1572, lng: 129.0623, icon: 'shopping', gmap: map('롯데백화점 부산본점') },
  ],

  dailyRoutes: {
    1: [[35.1796,128.9401],[35.1575,129.0600],[35.1560,129.0586],[35.1693,129.1297],[35.2356,128.8387],[35.1575,129.0600],[35.0966,129.0295],[35.0995,129.0265],[35.1575,129.0600]],
    2: [[35.1575,129.0600],[35.1551,129.1190],[35.1532,129.1186],[35.1623,129.1632],[35.1590,129.1740],[35.1600,129.1925],[35.0765,129.0165],[35.0995,129.0265],[35.1575,129.0600]],
    3: [[35.1575,129.0600],[35.1556,129.0585],[35.1572,129.0623],[35.1575,129.0600],[35.0850,129.0420],[35.1575,129.0600],[35.1796,128.9401]],
  },
};

export const foods = [
  { name: '豬肉湯飯 ①', desc: '포항돼지국밥 西面店，24 小時，西面站 1 號出口步行約 100 多公尺', price: '₩10,000-12,000', shop: '포항돼지국밥 서면점', lat: 35.1560, lng: 129.0586, gmap: map('포항돼지국밥 서면점 서면로68번길 27') },
  { name: '豬肉湯飯 ②', desc: '수변최고돼지국밥 廣安店，24 小時，湯頭濃、肉多', price: '₩10,000-12,000', shop: '수변최고돼지국밥 광안점', lat: 35.1551, lng: 129.1190, gmap: map('수변최고돼지국밥 광안로 63') },
  { name: '豬肉湯飯 ③', desc: '송정3대국밥 西面店，24 小時，招牌맛녀석국밥', price: '₩10,000-12,000', shop: '송정3대국밥 서면점', lat: 35.1556, lng: 129.0585, gmap: map('송정3대국밥 서면점 서면로68번길 33') },
  { name: '帝王蟹', desc: '札嘎其市場 1 樓挑、2 樓代客料理', price: '₩150,000-250,000', shop: '札嘎其市場', lat: 35.0966, lng: 129.0295, gmap: map('자갈치시장') },
  { name: '釜山冷麵 밀면', desc: '小麥冷麵，酸甜辣湯頭，搭煎餃', price: '₩8,000-10,000', shop: '水營區', lat: 35.1700, lng: 129.1150, gmap: map('밀면 수영구') },
  { name: '씨앗호떡 與 魚板', desc: 'BIFF 廣場街頭小吃，釜山代表', price: '₩2,000-5,000', shop: '南浦洞 BIFF 廣場', lat: 35.0988, lng: 129.0276, gmap: map('BIFF광장 씨앗호떡') },
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

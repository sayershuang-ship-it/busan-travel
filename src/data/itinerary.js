const map = (q) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
const nav = (q) => `https://map.naver.com/p/search/${encodeURIComponent(q)}`;
// 每個地點都附 Google Map 與 Naver Map 連結；nq 是給 Naver 搜尋用的韓文名稱（Naver 對英文搜尋較不準）
const loc = (q, nq = q) => ({ gmap: map(q), nmap: nav(nq) });
const sum = (acts) => acts.reduce((s, a) => s + a.budget, 0);

const HOTEL_Q = 'Hotel BELLUS Seomyeon, 14-9 Jungang-daero 691beon-gil, Busanjin-gu, Busan';
const HOTEL_NQ = '부산진구 중앙대로691번길 14-9';
const hotelLoc = loc(HOTEL_Q, HOTEL_NQ);
const COSTCO = { gmap: 'https://maps.app.goo.gl/wHwvdbJR2mhvXbBS6', nmap: nav('코스트코 부산점') };

// 導航用座標，皆已逐筆查證（2026-10-15）。Kakao Map 為韓國在地來源（Naver Map 無法在查證環境開啟，以 Kakao 代替），Google Maps 取店家頁 Plus Code 交叉比對
const at = (lat, lng, src) => ({ lat, lng, coordSrc: src });
const P = {
  TPE: at(25.08171, 121.23911, 'Google Maps 2026-10-15 桃園機場第一航廈'),
  PUS: at(35.17347, 128.94722, 'Kakao Map 2026-10-15 김해국제공항 국제선 Gate1(출발)；Google 航廈中心相差 68m'),
  HOTEL: at(35.15506, 129.05622, 'Kakao Map 2026-10-15 호텔 벨루스（중앙대로691번가길 14-9）；Google 相差 1m'),
  GUKBAP: at(35.15578, 129.05853, 'Kakao Map 2026-10-15 포항돼지국밥（서면로68번길 27）；Google 相差 2m'),
  SPA: at(35.16882, 129.12952, 'Kakao Map 2026-10-15 스파랜드 센텀（센텀남대로 35）；Google 相差 64m'),
  CENTUM: at(35.16864, 129.12907, 'Kakao Map 2026-10-15 신세계백화점 센텀시티점；Google 相差 60m'),
  COSTCO: at(35.17856, 129.11539, 'Google Maps 2026-10-16 好市多 釜山店 Plus Code 8Q7F54H8+C5C（구락로 137）；Kakao 未比對'),
  JAGALCHI: at(35.09662, 129.03058, 'Kakao Map 2026-10-15 자갈치시장（자갈치해안로 52）；Google 相差 20m'),
  SINDONGA: at(35.09685, 129.02918, 'Kakao Map 2026-10-15 자갈치신동아시장（자갈치로 42）；Google 相差 60m'),
  BIFF: at(35.09887, 129.02905, 'Kakao Map 2026-10-15 BIFF광장（남포동3가 15-1）；Google 相差 72m'),
  WH: at(35.15468, 129.11971, 'Kakao Map 2026-10-15 워킹홀리데이（광안해변로 235）；Google 相差 9m'),
  OY: at(35.14843, 129.11446, 'Kakao Map 2026-10-15 올리브영 광안리점（광안해변로 153-1）；Google 相差 7m'),
  MILMYEON: at(35.1655, 129.16048, 'Kakao Map 2026-10-15 가야밀면（우동1로20번길 74）；Google「우동가야밀면」相差 4m'),
  HMARKET: at(35.1614, 129.16234, 'Kakao Map 2026-10-15 해운대전통시장（구남로41번길 22-1）；Google 相差 12m'),
  MIPO: at(35.15815, 129.17281, 'Kakao Map 2026-10-15 해운대블루라인파크 미포정거장；Google 相差 16m'),
  DIART: at(35.16073, 129.19187, 'Kakao Map 2026-10-15 디아트커피（청사포로128번길 12）；Google 相差 2m'),
  AMSO: at(35.16311, 129.16646, 'Kakao Map 2026-10-15 해운대암소갈비집（해운대해변로 333）；Google 相差 21m'),
  XSKY: at(35.15959, 129.16973, 'Kakao Map 2026-10-15 부산엑스더스카이（달맞이길 30）；Google 相差 28m'),
  EGG: at(35.1558, 129.05534, 'Kakao Map 2026-10-15 에그드랍 부산서면롯데후문점（부전로66번길 12）；Google 相差 5m'),
  LOTTE: at(35.15679, 129.05642, 'Kakao Map 2026-10-15 롯데백화점 부산본점（가야대로 772）；Google 相差 83m'),
  GOGI: at(35.1571, 129.0615, 'Kakao Map 2026-10-15 고기굽는남자 서면점（동천로95번길 13）；Google 相差 7m'),
  ARTE: at(35.08648, 129.07591, 'Kakao Map 2026-10-15 아르떼뮤지엄 부산（해양로247번길 29）；Google 相差 76m'),
  SONGDO: at(35.07664, 129.0234, 'Kakao Map 2026-10-15 송도해상케이블카（송도해변로 171，송도베이스테이션）；Google 相差 34m'),
  KALGUKSU: at(35.15551, 129.0583, 'Kakao Map 2026-10-15 기장손칼국수（서면로 56）；Google 相差 2m'),
};

// 預算以 6 人計。Visit Busan Pass BIG5 已購（6 人各一張），Spa Land、海邊列車、X the SKY、Arte Museum、松島纜車皆以 Pass 免費入場，所以票券欄記 0
const day1 = [
  { time: '02:50', icon: '🛫', title: '桃園機場起飛', desc: '7C6164 濟州航空，第一航廈，託運 15kg', budget: 0, type: 'flight', ...loc('Taoyuan International Airport Terminal 1', '인천국제공항'), ...P.TPE, utcOffset: '+08:00' }, // 台灣時間
  { time: '06:10', icon: '✈️', title: '抵達金海機場', desc: '國際航廈入境、領行李，約 07:15 出關。先上網填好 e-Arrival Card。建議順便換 Visit Busan Pass BIG5 實體卡：機場 Wi-Fi Dosirak 櫃檯營業 06:00–10:00（部落格資料，位置與時間未查證，請現場確認），帶 Klook／Kkday 憑證與護照，6 人各一張。輕軌站內 MoneyBox 06:00 開，可換少量韓元、對面 E-mart24 買 T-money', budget: 0, type: 'flight', ...loc('Gimhae International Airport', '김해국제공항'), ...P.PUS },
  { time: '07:30', icon: '🚕', title: '大型計程車到西面飯店', desc: '6 人加 6 件託運行李，叫 Kakao T 大型車（Van）1 台，約 25–30 分鐘、約 ₩40,000–60,000（估計，以 Kakao T 為準）。大型車放不下行李就改 2 台一般車（合計約 ₩40,000）', budget: 50000, type: 'transport', ...hotelLoc, ...P.HOTEL },
  { time: '08:15', icon: '🏨', title: '寄放行李', desc: 'Hotel BELLUS 西面。入住 16:00 起，早上只能寄放行李；入住請帶護照。接著去西面吃湯飯，步行或搭車約 10–15 分鐘（估計，以 Kakao T 為準）', budget: 0, type: 'hotel', ...hotelLoc, ...P.HOTEL },
  { time: '08:45', icon: '🍲', title: '豬肉湯飯', desc: '포항돼지국밥 西面店，1948 年創始、藍絲帶大獎，24 小時營業，湯頭奶白濃郁、豬肉軟嫩。西面站 1 號出口步行約 100 多公尺。6 人預算抓每人約 ₩11,000', ko: '포항돼지국밥 서면점', budget: 66000, type: 'food', ...loc('포항돼지국밥 서면점 서면로68번길 27'), ...P.GUKBAP },
  { time: '09:45', icon: '🚕', title: '搭車去 Centum City', desc: '從西面搭大型計程車去新世界 Centum City，約 20 分鐘（估計，以 Kakao T 為準）。Spa Land 09:00 就開', budget: 25000, type: 'transport', ...loc('신세계 센텀시티 스파랜드'), ...P.SPA },
  { time: '10:15', icon: '🧖', title: '新世界 Spa Land', desc: '紅眼班機後的休息站：泡湯、汗蒸幕、躺著補眠，一次入場最多 4 小時（官方，超時每小時 ₩5,000）。持 Visit Busan Pass BIG5 免費兌換入場券（紫色景點，原價 ₩26,000）。帶毛巾、拖鞋，有置物櫃。長輩留意地板濕滑', ko: '스파랜드', budget: 0, type: 'ticket', ...loc('신세계 센텀시티 스파랜드'), ...P.SPA },
  { time: '13:30', icon: '🏬', title: '午餐、逛 Centum City', desc: '新世界 Centum City 百貨與美食街，吃午餐、順便逛街。B1 有三進魚板分店，想買釜山魚板伴手禮在這裡買（Day 3 不再去影島總店；冷藏品保存期限看包裝，未查證）。商品單筆滿 ₩15,000 可辦即時退稅。6 人預算約 ₩70,000', budget: 70000, type: 'food', ...loc('신세계 센텀시티'), ...P.CENTUM },
  { time: '14:45', icon: '🚕', title: '大型計程車去好市多釜山店', desc: '從 Centum City 過去約 10–15 分鐘（估計，以 Kakao T 為準）', budget: 20000, type: 'transport', ...COSTCO, ...P.COSTCO },
  { time: '15:00', icon: '🛒', title: '好市多（Costco）釜山店', desc: '帶會員卡與護照，付款用 Visa 最保險，Mastercard 說法不一，備現金。先買零食、堅果、保養品等耐放品，生鮮與冷藏品別買，要放 3 天又要搭飛機。採買前請先確認週六營業時間，建議 17:00 前結帳', ko: '코스트코 부산점', budget: 250000, type: 'shopping', ...COSTCO, ...P.COSTCO },
  { time: '17:00', icon: '🚕', title: '大型計程車回西面飯店', desc: '約 20–25 分鐘（估計，以 Kakao T 為準）。大型車載人加採買品，放不下就改 2 台', budget: 25000, type: 'transport', ...hotelLoc, ...P.HOTEL },
  { time: '17:40', icon: '🔌', title: '辦入住、整理、充電休息', desc: '辦入住（16:00 起），把好市多戰利品和行李放進房間，手機與行動電源充電，躺一下。休息約 1 小時，18:45 再出門', budget: 0, type: 'hotel', ...hotelLoc, ...P.HOTEL },
  { time: '18:45', icon: '🚕', title: '搭車去南浦', desc: '西面到南浦約 15–20 分鐘（估計，以 Kakao T 為準），6 人坐大型車', budget: 18000, type: 'transport', ...loc('자갈치시장'), ...P.JAGALCHI },
  { time: '19:15', icon: '🦀', title: '新東亞市場吃蟹', desc: '札嘎其一帶的新東亞市場。挑蟹後請店家料理或到樓上餐廳代煮；部分餐廳另收料理費與人頭費，先問 3–5 家，請店家扣掉籃子重量，成交前問「全部多少錢」。2026 年遊客回報約 ₩70,000–100,000／kg，6 人約 2.5–3kg 抓預算。攤位晚上收攤時間不一，建議 19:30 前入座（未查證）', ko: '신동아시장', budget: 400000, type: 'food', ...loc('자갈치 신동아시장'), ...P.SINDONGA },
  { time: '20:30', icon: '🥞', title: '南浦洞 BIFF 小吃', desc: '씨앗호떡（堅果糖餡煎餅）與 부산어묵（魚板串），釜山代表街頭小吃，輕鬆散步買一兩樣，不排購物', ko: '씨앗호떡', budget: 18000, type: 'food', ...loc('BIFF광장 씨앗호떡', 'BIFF광장'), ...P.BIFF, alt: { icon: '🏬', title: '樂天百貨光復店 地下食品區', desc: '雨天改在室內吃小點心', budget: 18000, type: 'food' } },
  { time: '21:00', icon: '🛏️', title: '搭車回飯店、早點睡', desc: '搭大型計程車回西面，凌晨出發又走了一整天，早點休息', budget: 18000, type: 'transport', ...hotelLoc, ...P.HOTEL },
];

const day2 = [
  { time: '09:30', icon: '🚕', title: '大型計程車去廣安里', desc: '從西面飯店搭大型計程車到廣安里，約 25 分鐘（估計，以 Kakao T 為準）', budget: 25000, type: 'transport', ...loc('워킹홀리데이 광안해변로 235'), ...P.WH },
  { time: '10:00', icon: '🥞', title: 'Working Holiday 早午餐', desc: '大片窗景直看廣安里海灘與廣安大橋，班尼迪克蛋是部落客推薦菜。位置在 3 樓，電梯、營業時間、6 人是否需訂位我沒查證，出發前用 Naver 地圖確認。6 人預算抓每人約 ₩18,000（估計）', ko: '워킹홀리데이', budget: 108000, type: 'food', ...loc('워킹홀리데이 광안해변로 235'), ...P.WH },
  { time: '11:15', icon: '🧴', title: '廣安里 Olive Young', desc: '官網標示可現場退稅。保養、防曬、面膜與護手霜在這裡一次買齊（南浦店不再排）', ko: '올리브영 광안리점', budget: 200000, type: 'shopping', ...loc('올리브영 광안리점'), ...P.OY },
  { time: '12:30', icon: '🍜', title: '우동가야밀면 釜山冷麵（份量很輕）', desc: '小麥冷麵，酸甜辣湯頭，釜山人的夏天味，11 月也有人吃。6 人點一兩碗分食加一份煎餃，因為下一站還要吃。指定 우동가야밀면（海雲台區 우동1로20번길 74），近 50 年老店，Kakao 地圖評分 4.5（386 則）、有團體座位、標示全年無休 10:00 開，밀면 ₩8,000；離海雲台市場步行約 500 公尺（營業時間以 Naver 為準）', ko: '우동가야밀면', budget: 40000, type: 'food', ...loc('우동가야밀면 우동1로20번길 74', '우동가야밀면'), ...P.MILMYEON },
  { time: '13:30', icon: '🐚', title: '海雲台市場小吃（份量很輕）', desc: '烤貝、年糕、炸物，邊走邊吃，只買一兩樣當點心，接著要搭列車', ko: '해운대시장', budget: 40000, type: 'food', ...loc('해운대시장'), ...P.HMARKET, alt: { icon: '🏬', title: '新世界 Centum City 美食街', desc: '雨天改在百貨內吃，室內不淋雨', budget: 40000, type: 'food' } },
  { time: '14:30', icon: '🚕', title: '搭車去美浦站', desc: '海雲台市場到海雲台海岸列車（Blue Line Park）美浦站，車程約 10–15 分鐘（估計），6 人坐大型車', budget: 15000, type: 'transport', ...loc('해운대블루라인파크 미포정거장'), ...P.MIPO },
  { time: '14:45', icon: '🚃', title: '海邊列車（해변열차）', desc: '美浦 → 青沙浦，沿海走，單程約 30 分鐘以上（網路資料）。持 Visit Busan Pass BIG5 兌換海岸列車一日票（藍色景點，原價約 ₩16,000），Pass 不含天空膠囊。營運時間以官網 bluelinepark.com 為準，建議先查 6 人能否坐在一起', ko: '해운대 블루라인파크', budget: 0, type: 'ticket', ...loc('해운대블루라인파크 미포정거장'), ...P.MIPO },
  { time: '15:45', icon: '☕', title: '青沙浦 DIART 咖啡', desc: '青沙浦站步行約 3 分鐘，看得到青沙浦燈塔，招牌卡伊馬克。營業時間各來源不一（09:30–21:00 或 10:30–21:30）', ko: '디아트커피', budget: 60000, type: 'food', ...loc('디아트커피 청사포로128번길 12'), ...P.DIART },
  { time: '17:00', icon: '🚕', title: '搭車去海雲台', desc: '青沙浦到海雲台約 15 分鐘（估計），6 人坐大型車', budget: 15000, type: 'transport', ...loc('해운대암소갈비집'), ...P.AMSO },
  { time: '17:30', icon: '🥩', title: '海雲台母牛肋排家', desc: '1964 年開業的牛肋排老店，2025 年入選釜山米其林推薦，整修後空間更寬敞。部落客說平日中午排近 1 小時，6 人建議先訂位（Catch Table 或請飯店代訂）。價格我沒查到，預算每人 ₩70,000 是抓的', ko: '해운대암소갈비집', budget: 420000, type: 'food', ...loc('해운대암소갈비집'), ...P.AMSO },
  { time: '19:00', icon: '🚕', title: '搭車去 X the SKY', desc: '海雲台到 LCT 約 10–15 分鐘（估計），6 人坐大型車', budget: 10000, type: 'transport', ...loc('Busan X the SKY', '부산엑스더스카이'), ...P.XSKY },
  { time: '19:30', icon: '🌃', title: 'Busan X the SKY 夜景', desc: '100 樓觀景台，韓國最大型。持 Visit Busan Pass BIG5 免費兌換（紫色景點，原價約 ₩29,000），要先到櫃台換票。營業 10:00–21:00（部落格資料，最後入場時間未查證），建議 20:30 前進場，有電梯適合長輩', ko: '부산 엑스 더 스카이', budget: 0, type: 'ticket', ...loc('Busan X the SKY', '부산엑스더스카이'), ...P.XSKY },
  { time: '20:45', icon: '🛏️', title: '搭車回飯店', desc: '海雲台到西面約 30 分鐘（估計），6 人坐大型車。廣安大橋夜景這天不排，留給別的機會', budget: 35000, type: 'transport', ...hotelLoc, ...P.HOTEL },
];

const day3 = [
  { time: '09:30', icon: '🥪', title: 'Egg Drop 早餐', desc: '에그드랍 서면롯데후문점，樂天百貨後門附近，地址 부산진구 부전로66번길 12，離西面站 7 號出口約 400 公尺。營業時間兩個來源不一致（08:00–20:00 或 21:00），出發前用 Naver 地圖確認。6 人預算約 ₩42,000', ko: '에그드랍 서면롯데후문점', budget: 42000, type: 'food', ...loc('에그드랍 서면롯데후문점'), ...P.EGG },
  { time: '10:15', icon: '🏬', title: '樂天百貨與西面地下街購物', desc: '樂天百貨釜山本店、西面地下街。最後補貨與伴手禮（海苔、零食、化妝品），結帳出示護照，單筆滿 ₩15,000 辦即時退稅。Daiso 買平價小物', ko: '서면', budget: 250000, type: 'shopping', ...loc('롯데백화점 부산본점'), ...P.LOTTE },
  { time: '11:30', icon: '🧳', title: '回飯店分裝行李、退房', desc: '把採買品分裝進託運行李（Hotel BELLUS 12:00 退房，行李寄放櫃台）：液體與保養品放託運（已辦即時退稅的才可託運），每人託運 15kg 內，磅一次', budget: 0, type: 'hotel', ...hotelLoc, ...P.HOTEL },
  { time: '12:15', icon: '🥩', title: '烤肉的男子 西面店', desc: '고기굽는남자 서면점，地址 부산진구 동천로95번길 13，西面站 8 號出口步行約 4 分鐘。專人桌邊代烤，熟成生五花 150g 約 ₩14,000（Kakao 地圖菜單）。Kakao 標示 11:30 開、有團體座位，可用 Catch Table 訂位（營業時間以 Naver 為準）。6 人先確認座位，避開 12:00–13:00 尖峰', ko: '고기굽는남자 서면점', budget: 160000, type: 'food', ...loc('고기굽는남자 서면점 동천로95번길 13', '고기굽는남자 서면점'), ...P.GOGI },
  { time: '13:45', icon: '🚕', title: '大型計程車去影島', desc: '西面到影島 Arte Museum，約 30 分鐘（估計，以 Kakao T 為準）。行李已寄放飯店', budget: 35000, type: 'transport', ...loc('아르떼뮤지엄 부산 영도구 해양로247번길 29'), ...P.ARTE },
  { time: '14:15', icon: '🎨', title: 'Arte Museum 釜山', desc: '沉浸式光影藝術展，部落格實測走完約 2 小時，所以排到 16:15。離場後不能重新入場、館內沒有廁所，先在大廳上；禁飲食，大包放寄物櫃；燈暗、地板有鏡面，長輩慢走；《雨》展區會淋濕。可以坐著看。持 Visit Busan Pass BIG5 免費兌換（藍色景點，原價約 ₩25,000，需先換票）。營業 10:00–20:00、最晚入場 19:00（官方，可能調整）。位置在影島，不是海雲台', ko: '아르떼뮤지엄', budget: 0, type: 'ticket', ...loc('아르떼뮤지엄 부산 영도구 해양로247번길 29'), ...P.ARTE },
  { time: '16:15', icon: '🚕', title: '搭車去松島', desc: '影島到松島約 25–30 分鐘（估計，以 Kakao T 為準），6 人坐大型車。松島纜車站附近沒有地鐵，計程車最省力', budget: 40000, type: 'transport', ...loc('송도해상케이블카 송림공원 탑승장'), ...P.SONGDO },
  { time: '16:45', icon: '🚠', title: '松島海上纜車', desc: '松林公園到岩南公園，單程約 15 分鐘（部落格），加上 Sky Park 站停留，保守抓 1 小時，在海面上空約 86 公尺。先在 1 樓換 Pass 實體票再上 4 樓搭車，6 人可同車，回程人較少。持 Visit Busan Pass BIG5 免費兌換（藍色景點，原價往返約 ₩19,000，水晶車廂約 ₩24,000，需先換票）。營業時間 10–11 月部落格沒寫，我們以 09:00–21:00 估，請查官網。日落約 17:20（估計），看黃昏。龍宮雲橋 17:00 關，這次來不及', ko: '송도해상케이블카', budget: 0, type: 'ticket', ...loc('송도해상케이블카 송림공원 탑승장'), ...P.SONGDO },
  { time: '17:45', icon: '🚕', title: '搭車回西面飯店', desc: '松島回西面約 35 分鐘（估計）。行李在飯店，回程要抓時間，若時間吃緊，晚餐改在機場', budget: 45000, type: 'transport', ...hotelLoc, ...P.HOTEL },
  { time: '18:20', icon: '🍜', title: '機張手工刀削麵（約 25 分鐘）', desc: '기장손칼국수，西面最受歡迎的手工刀削麵，刀削麵統一 ₩7,000，可搭紫菜飯捲，常排隊（部落格資料，價格未查證）。地址 부산진구 서면로 56。吃快一點，25 分鐘內吃完；若排隊超過 10 分鐘就改在機場吃', ko: '기장손칼국수', budget: 70000, type: 'food', ...loc('기장손칼국수 서면로 56', '기장손칼국수 서면'), ...P.KALGUKSU },
  { time: '19:00', icon: '🚕', title: '取行李、前往金海機場', desc: '大型計程車約 25 分鐘、₩18,000–20,000；6 件託運行李加採買品，放不下就叫 2 台（合計約 ₩40,000–60,000）。金海機場退稅是人工櫃台、只有一人作業，會排隊，約 19:30 到，離 22:00 起飛約 2.5 小時，辦完退稅和託運剛好', budget: 60000, type: 'transport', ...loc('Gimhae International Airport', '김해국제공항'), ...P.PUS },
  { time: '22:00', icon: '🛫', title: '7C6163 起飛', desc: '23:50 抵達桃園第一航廈，託運 15kg＋5kg', budget: 0, type: 'flight', ...loc('Gimhae International Airport', '김해국제공항'), ...P.PUS },
];

export const trip = {
  title: '釜山三日自由行',
  subtitle: '豬肉湯飯・保養・好市多',
  dates: '2026/10/31 (六) → 11/2 (一)',
  travelers: 6,
  budget: 60000,
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
    gmap: hotelLoc.gmap,
    nmap: hotelLoc.nmap,
  },

  days: [
    {
      day: 1,
      date: '10/31 (六)',
      title: '清晨抵達、Spa 休息、好市多、帝王蟹',
      subtitle: '落地放行李吃湯飯，Spa Land 補眠，下午好市多，回飯店入住休息後，傍晚新東亞吃蟹、逛南浦洞',
      activities: day1,
      dayBudget: sum(day1),
      lat: 35.0996,
      lng: 129.0360,
    },
    {
      day: 2,
      date: '11/1 (日)',
      title: '廣安里、海邊列車與海雲台夜景',
      subtitle: '早午餐、保養品、海邊列車、青沙浦咖啡、母牛肋排家、X the SKY 夜景，全程走東邊海岸線',
      activities: day2,
      dayBudget: sum(day2),
      lat: 35.1587,
      lng: 129.1576,
    },
    {
      day: 3,
      date: '11/2 (一)',
      title: '西面補貨、影島與松島、返台',
      subtitle: '上午西面補貨，下午影島 Arte Museum 加松島纜車看黃昏，晚上去機場',
      activities: day3,
      dayBudget: sum(day3),
      lat: 35.1572,
      lng: 129.0623,
    },
  ],

  budgetSummary: [
    { label: '機票', icon: '✈️', amount: 0, note: '已購票' },
    { label: '住宿', icon: '🏨', amount: 0, note: 'Hotel BELLUS 西面' },
    { label: '餐飲', icon: '🍜', amount: sum([...day1, ...day2, ...day3].filter(a => a.type === 'food')), note: '6 人，含帝王蟹、母牛肋排家、烤肉與湯飯' },
    { label: '購物', icon: '🛍️', amount: sum([...day1, ...day2, ...day3].filter(a => a.type === 'shopping')), note: '保養品＋好市多＋伴手禮' },
    { label: '票券', icon: '🎫', amount: sum([...day1, ...day2, ...day3].filter(a => a.type === 'ticket')) + 6 * 65000, note: 'Visit Busan Pass BIG5 × 6（已購，以 ₩65,000 估）：Spa Land、X the SKY、海邊列車、Arte Museum、松島纜車皆免費' },
    { label: '交通', icon: '🚌', amount: sum([...day1, ...day2, ...day3].filter(a => a.type === 'transport')) + 30000, note: '機場往返＋市區大型計程車（預估）' },
  ],

  // 座標：好市多、札嘎其、海雲台市場為地址查詢值；其餘（含新加入的 Working Holiday、母牛肋排家、X the SKY、Egg Drop、烤肉的男子、機張刀削麵）為約略值，以地圖連結為準
  locations: [
    { name: '金海國際機場 PUS', lat: 35.1796, lng: 128.9401, icon: 'airport', ...loc('Gimhae International Airport', '김해국제공항') },
    { name: 'Hotel BELLUS 西面', lat: 35.1575, lng: 129.0600, icon: 'hotel', ...hotelLoc },
    { name: '포항돼지국밥 西面店（湯飯）', lat: 35.1560, lng: 129.0586, icon: 'food', ...loc('포항돼지국밥 서면점 서면로68번길 27') },
    { name: '新世界 Spa Land（Centum City）', lat: 35.1693, lng: 129.1297, icon: 'shopping', ...loc('신세계 센텀시티 스파랜드') },
    { name: 'COSTCO 釜山店', lat: 35.1786, lng: 129.1155, icon: 'shopping', ...COSTCO },
    { name: '札嘎其・新東亞市場', lat: 35.0966, lng: 129.0295, icon: 'food', ...loc('자갈치시장', '자갈치 신동아시장') },
    { name: '南浦洞 BIFF 廣場', lat: 35.0988, lng: 129.0276, icon: 'food', ...loc('BIFF광장 씨앗호떡', 'BIFF광장') },
    { name: 'Working Holiday 廣安里', lat: 35.1534, lng: 129.1189, icon: 'food', ...loc('워킹홀리데이 광안해변로 235') },
    { name: 'Olive Young 廣安里', lat: 35.1532, lng: 129.1186, icon: 'shopping', ...loc('올리브영 광안리점') },
    { name: '海雲台市場', lat: 35.1623, lng: 129.1632, icon: 'food', ...loc('해운대시장') },
    { name: '海雲台海岸列車 美浦站', lat: 35.1590, lng: 129.1740, icon: 'outdoor', ...loc('해운대블루라인파크 미포정거장') },
    { name: '青沙浦 DIART 咖啡', lat: 35.1600, lng: 129.1925, icon: 'food', ...loc('디아트커피 청사포로128번길 12') },
    { name: '海雲台母牛肋排家', lat: 35.1630, lng: 129.1620, icon: 'food', ...loc('해운대암소갈비집') },
    { name: 'Busan X the SKY', lat: 35.1606, lng: 129.1761, icon: 'outdoor', ...loc('Busan X the SKY', '부산엑스더스카이') },
    { name: 'Egg Drop 西面樂天後門店', lat: 35.1578, lng: 129.0626, icon: 'food', ...loc('에그드랍 서면롯데후문점') },
    { name: '西面・樂天百貨', lat: 35.1572, lng: 129.0623, icon: 'shopping', ...loc('롯데백화점 부산본점') },
    { name: '烤肉的男子 西面', lat: 35.1565, lng: 129.0610, icon: 'food', ...loc('고기굽는남자 서면') },
    { name: 'Arte Museum 釜山（影島）', lat: 35.0850, lng: 129.0420, icon: 'outdoor', ...loc('아르떼뮤지엄 부산 영도구 해양로247번길 29') },
    { name: '松島海上纜車', lat: 35.0765, lng: 129.0165, icon: 'outdoor', ...loc('송도해상케이블카 송림공원 탑승장') },
    { name: '機張手工刀削麵 西面', lat: 35.1550, lng: 129.0595, icon: 'food', ...loc('기장손칼국수 서면로 56', '기장손칼국수 서면') },
  ],

  dailyRoutes: {
    1: [[35.1796,128.9401],[35.1575,129.0600],[35.1560,129.0586],[35.1693,129.1297],[35.2356,128.8387],[35.1575,129.0600],[35.0966,129.0295],[35.0988,129.0276],[35.1575,129.0600]],
    2: [[35.1575,129.0600],[35.1534,129.1189],[35.1532,129.1186],[35.1623,129.1632],[35.1590,129.1740],[35.1600,129.1925],[35.1630,129.1620],[35.1606,129.1761],[35.1575,129.0600]],
    3: [[35.1575,129.0600],[35.1578,129.0626],[35.1572,129.0623],[35.1575,129.0600],[35.1565,129.0610],[35.0850,129.0420],[35.0765,129.0165],[35.1575,129.0600],[35.1550,129.0595],[35.1796,128.9401]],
  },
};

export const foods = [
  { name: '豬肉湯飯', desc: '포항돼지국밥 西面店，24 小時，西面站 1 號出口步行約 100 多公尺', price: '₩10,000-12,000', shop: '포항돼지국밥 서면점', lat: 35.1560, lng: 129.0586, ...loc('포항돼지국밥 서면점 서면로68번길 27') },
  { name: '廣安里早午餐', desc: 'Working Holiday，窗邊看海與廣安大橋，班尼迪克蛋', price: '₩15,000-20,000', shop: '워킹홀리데이', lat: 35.1534, lng: 129.1189, ...loc('워킹홀리데이 광안해변로 235') },
  { name: '母牛肋排家', desc: '해운대암소갈비집，1964 年老店，米其林推薦，建議訂位', price: '₩60,000-80,000（估）', shop: '해운대암소갈비집', lat: 35.1630, lng: 129.1620, ...loc('해운대암소갈비집') },
  { name: '帝王蟹', desc: '札嘎其市場 1 樓挑、2 樓代客料理', price: '₩150,000-250,000', shop: '札嘎其市場', lat: 35.0966, lng: 129.0295, ...loc('자갈치시장', '자갈치 신동아시장') },
  { name: '釜山冷麵 밀면', desc: '小麥冷麵，酸甜辣湯頭，搭煎餃', price: '₩8,000-10,000', shop: '水營區', lat: 35.1700, lng: 129.1150, ...loc('밀면 수영구', '수영구 밀면') },
  { name: '씨앗호떡 與 魚板', desc: 'BIFF 廣場街頭小吃，釜山代表', price: '₩2,000-5,000', shop: '南浦洞 BIFF 廣場', lat: 35.0988, lng: 129.0276, ...loc('BIFF광장 씨앗호떡', 'BIFF광장') },
  { name: '海雲台市場小吃', desc: '烤貝、年糕、炸物', price: '₩10,000-20,000', shop: '海雲台市場', lat: 35.1623, lng: 129.1632, ...loc('해운대시장') },
  { name: 'Egg Drop 早餐', desc: '에그드랍 西面樂天後門店，韓式厚蛋三明治', price: '₩5,000-8,000（估）', shop: '에그드랍 서면롯데후문점', lat: 35.1578, lng: 129.0626, ...loc('에그드랍 서면롯데후문점') },
  { name: '熟成烤肉午餐', desc: '고기굽는男子 西面店，專人代烤', price: '₩14,000／150g（未查證）', shop: '고기굽는남자 서면', lat: 35.1565, lng: 129.0610, ...loc('고기굽는남자 서면') },
  { name: '機張手工刀削麵', desc: '기장손칼국수，西面人氣刀削麵，搭紫菜飯捲', price: '₩7,000（未查證）', shop: '기장손칼국수', lat: 35.1550, lng: 129.0595, ...loc('기장손칼국수 서면로 56', '기장손칼국수 서면') },
];

export const contingency = {
  indoorSpots: [
    { icon: '🏬', name: '西面地下街', desc: '室內購物中心，不怕雨天', cost: '免費入場', area: '西面' },
    { icon: '🛍️', name: '樂天百貨', desc: '免稅＋地下超市', cost: '免費入場', area: '西面' },
    { icon: '🧴', name: 'Olive Young', desc: '各區皆有，可躲雨補保養品', cost: '免費入場', area: '南浦・海雲台' },
    { icon: '🛁', name: '汗蒸幕', desc: '西面、海雲台有多間', cost: '₩10,000-20,000', area: '西面' },
    { icon: '🎨', name: 'Arte Museum 釜山', desc: '沉浸式光影展，室內、約 2 小時，Pass 免費', cost: 'Pass 免費', area: '影島' },
    { icon: '🏙️', name: 'Busan X the SKY', desc: '100 樓觀景台，有電梯，Pass 免費', cost: 'Pass 免費', area: '海雲台' },
    { icon: '🐠', name: 'SEA LIFE 釜山水族館', desc: '室內，美人魚表演、鯊魚餵食秀，Pass 可折 30%', cost: '見官網', area: '海雲台' },
    { icon: '♨️', name: 'Hill Spa 汗蒸幕', desc: '海景足湯，Pass 免費 4 小時，需現金', cost: 'Pass 免費', area: '海雲台' },
  ],
  scenarios: [
    {
      id: 'rain', icon: '🌧️', title: '雨天備案',
      desc: '11 月初釜山可能有雨。Day 1 大多在室內，Day 2 的海邊列車與 Day 3 的松島纜車受影響較大。',
      tips: [
        '海雲台市場小吃改在 Centum City 新世界美食街吃',
        '海邊列車、松島纜車遇大雨或強風可能停駛，Pass 180 天有效，可以不用也不損失',
        'Day 2 下雨：把海邊列車與青沙浦改成 Centum City 百貨逛街，再去母牛肋排家和 X the SKY（室內）',
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
        '去程延誤 2 小時內：照原行程，湯飯後直接去 Spa Land',
        '去程延誤 4 小時以上：Day 1 只保留湯飯與帝王蟹，好市多改到 Day 3 去機場前（搭車去釜山店再到機場）',
        '回程至少 19:30 前抵達機場，退稅與託運都需要時間',
        '保留所有消費單據，申請旅遊不便險',
      ],
      swappable: false,
    },
    {
      id: 'tired', icon: '😴', title: '體力透支（尤其長輩）',
      desc: '走不動時的精簡版：',
      tips: [
        'Day 1 必去：湯飯＋好市多＋帝王蟹',
        'Day 2 必去：廣安里 Olive Young、母牛肋排家；海邊列車與 X the SKY 可擇一',
        'Day 3 必去：西面最後補貨、Arte Museum；松島纜車可直接跳過，晚餐改在機場',
        '其他全部跳過，休息優先',
      ],
      swappable: false,
    },
  ],
};

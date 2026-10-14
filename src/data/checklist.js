// 出發前待辦。標「確認」的項目是規定可能變動，請以官方網站為準。
export const checklist = [
  {
    id: 'deadline',
    title: '住宿確認',
    items: [
      { id: 'hotel-decide', text: '確認 Hotel BELLUS 西面訂單與免費取消期限', note: '期限以訂房確認信為準；10/31 入住 16:00 起、11/2 退房 12:00' },
      { id: 'hotel-early', text: '寄信問飯店能否早到寄放行李', note: '06:10 落地，約 08:30 到西面，入住 16:00 起' },
    ],
  },
  {
    id: 'docs',
    title: '證件與入境（六人都要）',
    items: [
      { id: 'passport', text: '護照效期至少 6 個月以上', note: '姓名需與機票、住宿訂單一致' },
      { id: 'keta', text: '台灣護照 2026 年免辦 K-ETA（豁免延長到 2026/12/31）', note: '已查證；出發前仍可再看韓國法務部公告' },
      { id: 'arrival', text: '線上填 e-Arrival Card（每人一份）', note: '2026 起取消紙本，只能在入境日前 3 天內填，10/28 起可填。完成後保存 QR code，海關掃描' },
      { id: 'insurance', text: '買旅遊平安險與旅遊不便險', note: '航班延誤、行李遺失都要保留單據' },
      { id: 'copies', text: '機票、住宿確認信截圖，手機離線可看', note: '7C6164／7C6163 與飯店確認信' },
    ],
  },
  {
    id: 'booking',
    title: '出發前一週',
    items: [
      { id: 'checkin', text: '濟州航空網路報到、選位、確認託運額度', note: '去程 15kg；回程 15kg＋5kg' },
      { id: 'money', text: '換韓元現金、帶可海外刷卡的信用卡', note: '帝王蟹與市場攤位常需現金' },
      { id: 'esim', text: '買 eSIM 或漫遊方案', note: '韓國地圖與叫車都要網路。落地後要手動開「數據漫遊」，詳見出發功課' },
      { id: 'apps', text: '安裝 Naver Map、KakaoMap、Papago，叫車用 Kakao T', note: 'Google 地圖在韓國步行與公車導航較不準。另可裝韓巢地鐵（轉乘）、Catch Table（熱門餐廳先抽號）' },
      { id: 'tmoney', text: '準備交通卡（T-money 或可感應的信用卡）', note: '機場輕軌與地鐵都用得到' },
      { id: 'buspass', text: 'Visit Busan Pass BIG5：6 人各一張，確認憑證與護照', note: '已購。排定景點：Spa Land、X the SKY（紫色）、海邊列車、Arte Museum、松島纜車（藍色）。實體卡可在金海機場 Wi-Fi Dosirak（06:00–10:00，未查證）換，多數景點要先憑 Pass 在櫃台換票。細節見出發功課' },
      { id: 'costco', text: '好市多會員卡（確認有效、未過期）', note: '入場需出示會員卡與證件' },
      { id: 'costco-pay', text: '好市多付款帶 Visa 卡，並備韓元現金', note: '韓國店只收特定卡，Mastercard 說法不一；你的訂房用 Visa，可以帶它' },
      { id: 'costco-day', text: '10/31（週六）好市多金海店 10:00 開門', note: '我只確認到週一 10:00–22:00，週六請在 Google 地圖再看一次。10/31 不是週日，不受公休影響' },
    ],
  },
  {
    id: 'night',
    title: '10/30 晚上出門前',
    items: [
      { id: 'transport', text: '安排深夜到桃園機場的交通', note: '02:50 起飛，要在 23:30 前後到第一航廈；末班公車與捷運多半已收班，建議叫車或提早出發' },
      { id: 'tpe-time', text: '最晚 00:30 前辦完報到與託運', note: '國際線通常起飛前 60 分鐘截止' },
    ],
  },
  {
    id: 'carry',
    title: '隨身行李',
    items: [
      { id: 'c-passport', text: '護照、信用卡、現金', note: '' },
      { id: 'c-powerbank', text: '行動電源（標示 Wh、100Wh 以下）', note: '韓國航空規定：隨身攜帶、放視線可及處、不可放行李架上、不可用座位 USB 充電；沒標 Wh 可能被沒收，端口貼膠帶' },
      { id: 'c-adapter', text: '轉接頭與充電線', note: '韓國是 220V 圓兩孔插座；台灣 110V 電器要確認支援雙電壓' },
      { id: 'c-jacket', text: '薄外套與可疊穿衣物', note: '早晚約 8–12°C、白天約 17–20°C，海邊風大；11 月初偏冷，帶針織與風衣' },
      { id: 'c-shoes', text: '好走的鞋', note: '南浦洞與西面步行多，坡路也多' },
      { id: 'c-liquid', text: '隨身液體每瓶 100ml 以下、裝進 1 公升內的透明夾鏈袋', note: '回程買的保養品請放託運；機上手提加個人物品合計 10kg 內' },
    ],
  },
  {
    id: 'shopping',
    title: '採買用',
    items: [
      { id: 's-bag', text: '折疊大購物袋 2 個', note: '好市多不提供塑膠袋' },
      { id: 's-space', text: '行李箱出發時留一半空間', note: '回程總額度 20kg，先抓好保養品與零食的重量；伴手禮預留約 8–10kg（網友打包公式）' },
      { id: 's-passport', text: '退稅用：護照與購物收據', note: '單筆滿 ₩15,000 可退稅，結帳出示護照正本，請店家辦「即時退稅」（單筆上限 ₩1,000,000）。辦了即時退稅，商品可直接託運' },
      { id: 's-list', text: '家人委託的清單先整理好', note: '保養品牌、色號、容量，現場才不用再問' },
      { id: 's-cool', text: '保冷袋（要帶魚板、泡菜時用）', note: '' },
    ],
  },
  {
    id: 'return',
    title: '回程當天（11/2）',
    items: [
      { id: 'r-leave', text: '18:30 前從西面飯店出發往金海機場', note: '22:00 起飛，抵達後要辦登機與託運' },
      { id: 'r-pack', text: '退房前把保養品、液體裝進託運行李', note: '託運 20kg 內，貴重物品放隨身' },
      { id: 'r-cash', text: '韓元現金用完或預留機場花費', note: '機場內可刷卡，但小額現金方便' },
    ],
  },
];

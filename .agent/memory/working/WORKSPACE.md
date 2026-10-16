# Workspace (live task state)

> Replace this template on your first real task. The dream cycle auto-archives
> this file after 2 days of inactivity — don't keep long-lived notes here.

## Current task
/live 動態行程地圖（plan: docs/superpowers/plans/2026-10-15-live-trip-map.md）— Task 1–9 完成，分支 claude/quirky-darwin-a62add，尚未 push／開 PR（等使用者同意）。

## Open files
- src/pages/live.astro、src/lib/live/*.js、src/data/itinerary.js、public/data/routes.json

## Active hypotheses
- Naver Map 在內建瀏覽器被安全限制擋下；座標改用 Kakao Map（在地來源）＋Google Plus Code 交叉比對，全部相差 ≤ 83m。

## Checkpoints
- [x] npm test 33/33、npm run build 通過、routes.json 18/18
- [x] 瀏覽器驗收：預覽、即時＋GPS 三組、OSRM 失敗回退、手機／桌機／暗色、SW busan-v4

## Next step
等使用者決定是否 push 與開 PR；回報 deploy.yml 專案名 kumamoto-travel 不一致（只回報不改）。

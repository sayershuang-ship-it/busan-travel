# 交接：busan-travel CI/CD 部署設定完成

**時間**: 2026-06-15  
**結果**: ✅ GitHub Actions → Cloudflare Pages 自動部署正常運作

## 最終狀態

- **網站上線**: https://busan-travel.pages.dev
- **GitHub**: sayershuang-ship-it/busan-travel
- **CI 流程**: push main → `npm install` → `astro build` → `wrangler pages deploy`
- **Workflow 檔案**: `.github/workflows/deploy.yml`

## GitHub Secrets

| Secret | 用途 |
|---|---|
| `CF_API_KEY` | Cloudflare Global API Key |
| `CF_EMAIL` | Cloudflare 帳號 email |
| `CF_API_TOKEN` | API Token（已棄用，留著無害） |

## Cloudflare 端

| 項目 | 值 |
|---|---|
| Account ID | `5c6837ef78c66d521d6e450a91c7bd61` |
| Pages Project | `busan-travel` |
| Pages Project ID | （busan-travel 專案建立後補上）|
| Email | sayers.tw@yahoo.com.tw |

## 踩過的坑（勿重蹈）

1. **`npm ci` 在新版 npm 會因 lock 檔 drift 炸掉** → 用 `npm install`
2. **`cloudflare/wrangler-action@v3` GitHub Action 失敗無報錯** → 直接跑 `npx wrangler pages deploy`
3. **API Token (`cfut_...`) 對 Pages API 認證失敗** → 改用 Global API Key
4. **User ID ≠ Account ID**: `/user` response 裡的 `id` 是 user id，`/accounts` 才是 account id
5. **Wrangler Pages 需要先存在 project**: 不會自動建立，需手動或用 API 先建

## 本地開發

```bash
cd /Users/shouwan/projects/busan-travel
npm install
npx astro dev
```

## 如需重建或遷移

- Cloudflare Pages project 是空的 direct upload 型，沒有 Cloudflare 自帶的 CI
- 所有 build 在 GitHub Actions 完成後直接推送 `dist/` 目錄
- Global API Key 洩漏風險：此專案用 Global API Key 而非權限受限的 token

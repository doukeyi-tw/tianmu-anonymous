# 天母匿名

React (Vite) 前端 + Vercel Serverless API + PostgreSQL + Vercel Blob。

## 結構

```
api/                 Vercel serverless routes（catch-all handler + 共用模組）
db/001_initial.sql   PostgreSQL schema / migration
scripts/             migrate.mjs、provision-admin.mjs
src/                 React 前端
public/              靜態 assets
tests/               Vitest 測試
vercel.json          build / rewrites / headers
.env.example         所需環境變數範本
```

## 部署（Vercel）

1. 建立 Vercel 專案並 import 本目錄。
2. 建立 Vercel PostgreSQL（或 Neon 等）與 Blob store，連結到專案。
3. 設定環境變數（見 `.env.example`）：
   - `DATABASE_URL`
   - `BLOB_READ_WRITE_TOKEN`
   - `AUTH_SECRET`（至少 32 字元的隨機字串）
   - `ADMIN_USERNAME` / `ADMIN_PASSWORD`（僅 provisioning 用）
   - `CORS_ORIGIN=https://www.tmjhnew.com`
   - 可選：`POST_RATE_LIMIT`、`POST_RATE_WINDOW_SECONDS`、`MAX_IMAGE_BYTES`
4. 執行一次 migration 與建立管理員：
   ```bash
   npm install
   npm run migrate
   ADMIN_USERNAME=admin ADMIN_PASSWORD=<強密碼> npm run provision-admin
   ```
5. 部署。前端與 API 同源：靜態頁面由 `dist` 提供，`/api/*` 由 `api/index.js` 處理。

## 本機開發

```bash
npm install
cp .env.example .env   # 填入本機 DATABASE_URL / BLOB_READ_WRITE_TOKEN / AUTH_SECRET
npm run dev:api        # Vercel CLI（port 3000），提供 /api
npm run dev            # Vite（port 5173），/api 已 proxy 至 127.0.0.1:3000
```

## 測試

```bash
npm test
npm run build
```

## 備註

- Instagram 採手動發布：審核通過後於「投稿審核」下載圖片並複製「天母匿名 YYYY/MM/DD HH:mm:ss」標題手動發文；無自動發布 API。
- 圖片限制：JPEG / PNG / WebP / GIF，單張上限約 3.5MB，伺服器端做 MIME + 檔案簽章驗證。
- 投稿速率限制、輸入驗證、參數化查詢與安全 headers 皆在後端實作。

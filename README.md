# Smart Hydro Electric Estimator (水電估價單)

這是一個基於 React 與 Vite 開發的水電估價單應用程式，整合 Gemini API 提供智慧功能。

## 快速開始 (Getting Started)

### 前置需求
- Node.js (建議 v20 或以上)

### 安裝與執行
1. **安裝依賴套件**:
   ```bash
   npm install
   ```

2. **設定環境變數**:
   請在專案根目錄建立 `.env` 檔案，並填入以下內容：
   ```env
   # 您的 Gemini API Key
   GEMINI_API_KEY=your_api_key_here
   ```

3. **啟動開發伺服器**:
   ```bash
   npm run dev
   ```
   開啟瀏覽器訪問 `http://localhost:3000` (或終端機顯示的網址)。

## 可用指令 (Scripts)

- `npm run dev`: 啟動開發伺服器。
- `npm run build`: 執行 TypeScript 型別檢查並建置專案至 `dist` 資料夾。
- `npm run preview`: 預覽建置後的應用程式。

## 部署 (Deployment)

本專案已設定 **GitHub Actions** 自動部署至 **GitHub Pages**。

### 設定步驟
1. 將程式碼推送到 GitHub 儲存庫。
2. 進入 GitHub Repository 的 **Settings** > **Pages**。
3. 在 **Build and deployment**區塊，將 **Source** 設定為 **GitHub Actions**。
4. (重要) 進入 **Settings** > **Secrets and variables** > **Actions**。
5. 新增一個 **Repository secret**，名稱為 `GEMINI_API_KEY`，值為您的 API Key。
6. 推送程式碼至 `main` 分支，Action 將會自動觸發並部署。

## 專案結構
- `src/`: 原始碼
- `vite.config.ts`: Vite 設定檔
- `.github/workflows/`: GitHub Actions 設定檔

---
<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

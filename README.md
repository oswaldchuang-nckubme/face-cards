# 識面名片（PWA）

用手機相機辨識人臉，立即顯示對方的姓名、職業、電話、生日、喜好等名片資訊。
所有照片與資料只存在手機本機（IndexedDB），不會上傳到任何伺服器。

## 檔案結構

```
face-cards-pwa/
├── index.html             主程式
├── manifest.webmanifest   App 名稱、圖示、全螢幕設定
├── sw.js                  Service Worker（離線快取、更新）
├── icons/                 App 圖示（192、512、maskable、iOS 180）
├── .nojekyll              讓 GitHub Pages 原樣發布檔案
└── README.md
```

## 部署到 GitHub Pages

1. 登入 GitHub，點右上角「+」→「New repository」，取名例如 `face-cards`，選 **Public**，建立。
2. 在新 repo 頁面點「uploading an existing file」，把資料夾內**所有檔案與 icons 資料夾**拖進去（`.nojekyll` 是隱藏檔，若拖不進去可略過），按「Commit changes」。
3. 到 repo 的「Settings」→ 左側「Pages」。
4. 「Source」選 **Deploy from a branch**，Branch 選 `main`、資料夾選 `/ (root)`，按「Save」。
5. 等 1–2 分鐘，頁面上方會出現網址：`https://你的帳號.github.io/face-cards/`

> 用指令上傳：
> ```bash
> cd face-cards-pwa
> git init && git add . && git commit -m "first release"
> git branch -M main
> git remote add origin https://github.com/你的帳號/face-cards.git
> git push -u origin main
> ```

## 安裝到手機

**Android（Chrome）**：開啟網址 → 點右上角「安裝到手機」，或瀏覽器選單的「安裝應用程式」。

**iPhone（Safari，必須用 Safari）**：開啟網址 → 分享按鈕 → 「加入主畫面」。

第一次開啟時允許相機權限。第一次使用會下載辨識模型（約 10 MB），之後即可離線使用。

## 更新程式

1. 修改 `index.html` 後，把 `sw.js` 第一行的 `VERSION` 改成新版號（例如 `v1.0.1`）。
2. 上傳到 GitHub。
3. 手機下次開啟 App 會出現「有新版本可以使用」，點「立即更新」即可。

## 資料備份（重要）

名片只存在該手機的這個 App 裡。換手機、刪除 App 或清除瀏覽器資料會讓名片消失。
請定期到「名片庫」→「匯出備份」存一份 JSON，換手機時再「匯入備份」。

注意：iPhone 上「加入主畫面的 App」和「Safari 分頁」的資料是分開的，請固定從主畫面圖示開啟。

## 選用：自架辨識模型（不依賴 jsDelivr）

1. 到 https://github.com/vladmandic/face-api 下載 `model` 資料夾中這 8 個檔案：
   `tiny_face_detector_model`、`ssd_mobilenetv1_model`、`face_landmark_68_model`、`face_recognition_model`
   各自的 `.json` 與 `.bin`。
2. 放到 repo 的 `models/` 資料夾。
3. 把 `index.html` 中的 `MODEL_URL` 改成 `'./models/'`，並把 `sw.js` 的 `MODELS` 路徑改成 `'./models/' + m + ...`。

## 常見問題

- **相機打不開**：確認網址是 `https://`，並在手機設定中允許瀏覽器（或 App）使用相機。
- **認不出人／認錯人**：每人多拍幾張不同角度、光線的照片；到「名片庫」調整辨識嚴格度（建議 0.45–0.55）。
- **iPhone 安裝後相機黑畫面**：請更新到 iOS 16 以上，並在「設定 → Safari → 相機」允許使用。

## 隱私

這個 App 會儲存他人的臉部照片與個人資料，建議建立名片前先告知對方並取得同意。

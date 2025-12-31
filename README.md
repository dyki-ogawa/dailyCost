# 💰 家計簿管理アプリ

日々の支出を素早く記録・管理できるモバイル家計簿アプリです。

## ✨ 主要機能

### 📝 支出の追加
- フローティングアクションボタン(+)で素早く追加
- 金額、カテゴリ、メモを記録
- 8つのカテゴリから選択可能（飲物、食費、交通費、買い物、娯楽、光熱費、医療、その他）

### 📊 週間グラフ
- 月曜始まりの7日間の支出推移を折れ線グラフで表示
- 当日は白い丸で強調表示
- グラフをタップして詳細を確認可能

### 📱 今日の支出一覧
- レシート風のデザインでカード表示
- カテゴリアイコン、金額、メモ、時刻を表示
- 見やすく直感的なUI

### 📈 サマリー表示
- 選択中の日付を表示
- その日の合計支出額を大きく表示

## 🎨 デザイン

- 美しい青のグラデーション背景 (#00B4DB → #0083B0)
- レシート風のギザギザデザイン
- モダンで使いやすいモバイルファーストUI
- レスポンシブデザイン対応

## 🚀 使い方

### 📱 スマホからアクセス（推奨）

GitHub Pagesでデプロイされているため、以下のURLからスマホで直接アクセスできます：

**https://dyki-ogawa.github.io/dailyCost/**

スマホのブラウザで上記URLを開いて、ホーム画面に追加すればアプリのように使えます！

#### iPhoneでホーム画面に追加する方法
1. Safariでアプリを開く
2. 共有ボタン（□に↑）をタップ
3. 「ホーム画面に追加」を選択

#### Androidでホーム画面に追加する方法
1. Chromeでアプリを開く
2. メニュー（⋮）をタップ
3. 「ホーム画面に追加」を選択

### 💻 ローカルで起動（開発用）

1. `index.html` をブラウザで開く

```bash
# シンプルなHTTPサーバーを起動する場合
python -m http.server 8000
# または
npx serve
```

2. ブラウザで `http://localhost:8000` にアクセス

### 基本操作

1. **支出を追加**
   - 右下の赤い「+」ボタンをタップ
   - 金額とカテゴリを入力（必須）
   - メモを入力（任意）
   - 「追加する」ボタンをタップ

2. **支出を確認**
   - メイン画面で今日の支出がレシート風カードで表示されます
   - 週間グラフで1週間の支出推移を確認できます

## 💾 データ保存

- **Googleアカウントでログイン**して複数端末でデータを同期
- Firebase Firestore を使用してクラウドにデータを保存
- オフラインでも動作（オンライン時に自動同期）
- ログインしない場合は、ブラウザのLocalStorageにローカル保存

## 🔧 Firebase設定（初回のみ）

このアプリを使用するには、Firebaseプロジェクトの設定が必要です。

### 1. Firebaseプロジェクトを作成

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名を入力（例: dailyCost-app）
4. Google アナリティクスは任意（不要な場合は無効化）
5. プロジェクトを作成

### 2. ウェブアプリを追加

1. プロジェクトのホーム画面で「ウェブ」アイコン（</>）をクリック
2. アプリのニックネームを入力（例: 家計簿アプリ）
3. Firebase Hosting の設定は不要（スキップ）
4. 「アプリを登録」をクリック

### 3. 設定情報を取得

表示された `firebaseConfig` の内容を `firebase-config.js` にコピーします：

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 4. Google認証を有効化

1. Firebase Console > Authentication をクリック
2. 「始める」をクリック
3. Sign-in method タブを選択
4. 「Google」を選択して有効化
5. プロジェクトのサポートメールを選択
6. 「保存」をクリック

### 5. Firestore Database を作成

1. Firebase Console > Firestore Database をクリック
2. 「データベースの作成」をクリック
3. **本番環境モード**を選択（セキュリティルールは後で設定）
4. ロケーションを選択（asia-northeast1 推奨）
5. 「有効にする」をクリック

### 6. Firestoreセキュリティルールを設定

Firestore Database > ルール タブで以下のルールを設定：

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/expenses/{expenseId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

このルールにより、ログインユーザーは自分のデータのみ読み書きできます。

### 7. 完了！

`firebase-config.js` に設定を記入したら、アプリをデプロイして使用できます。

## 🛠️ 技術スタック

- HTML5
- CSS3 (グラデーション、アニメーション)
- JavaScript (ES6+)
- Chart.js (グラフ表示)
- Firebase Authentication (Google認証)
- Firebase Firestore (クラウドデータベース)
- LocalStorage (ローカルデータ永続化)

## 📁 ファイル構成

```
dailyCost/
├── .github/
│   └── workflows/
│       └── deploy.yml       # GitHub Pages自動デプロイ設定
├── index.html               # メインHTMLファイル
├── styles.css               # スタイルシート
├── app.js                   # JavaScriptロジック
├── firebase-config.js       # Firebase設定ファイル
├── manifest.json            # PWAマニフェスト
└── README.md                # このファイル
```

## 🔧 カスタマイズ

### カテゴリの追加・変更

`app.js` の `CATEGORIES` 配列を編集することでカテゴリをカスタマイズできます。

```javascript
const CATEGORIES = [
    { id: 'drink', name: '飲物', icon: '🥤' },
    { id: 'food', name: '食費', icon: '🍱' },
    // 新しいカテゴリを追加...
];
```

### カラーテーマの変更

`styles.css` のグラデーション色を変更することでテーマをカスタマイズできます。

```css
body {
    background: linear-gradient(135deg, #00B4DB 0%, #0083B0 100%);
}
```

## 📱 ブラウザ対応

- Chrome (推奨)
- Firefox
- Safari
- Edge

モバイルブラウザにも対応しています。

## 🚀 デプロイ

このアプリはGitHub Pagesで自動デプロイされます。

### 自動デプロイの仕組み

1. `claude/budget-management-app-tzLa3` または `main` ブランチにプッシュ
2. GitHub Actionsが自動的にトリガーされる
3. GitHub Pagesにデプロイ完了
4. https://dyki-ogawa.github.io/dailyCost/ でアクセス可能

### 初回セットアップ（リポジトリオーナーのみ）

GitHubリポジトリの設定で以下を確認してください：

1. Settings > Pages に移動
2. Source: "GitHub Actions" を選択
3. ワークフローが自動的に実行されます

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 🤝 貢献

プルリクエストを歓迎します！バグ報告や機能リクエストはIssuesでお願いします。

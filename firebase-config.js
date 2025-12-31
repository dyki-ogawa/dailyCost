// Firebase設定
// この設定は Firebase Console (https://console.firebase.google.com/) から取得してください
//
// 設定手順:
// 1. Firebase Console にアクセス
// 2. 新しいプロジェクトを作成（既存のプロジェクトを使用する場合はスキップ）
// 3. プロジェクト設定 > 全般 > マイアプリ > ウェブアプリを追加
// 4. アプリのニックネームを入力（例: 家計簿アプリ）
// 5. Firebase Hosting は設定不要（GitHub Pages を使用）
// 6. 表示された設定情報を以下にコピー
// 7. Authentication > Sign-in method > Google を有効化
// 8. Firestore Database を作成（テストモードで開始）

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Firebase の初期化
firebase.initializeApp(firebaseConfig);

// Firebase サービスのエクスポート
const auth = firebase.auth();
const db = firebase.firestore();
const googleProvider = new firebase.auth.GoogleAuthProvider();

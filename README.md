# UNO App

複数人でリアルタイムにUNOカードゲームをプレイできるWebアプリケーション

## クイックスタート

```bash
# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env.local
# .env.localを編集してGoogle OAuth認証情報を設定

# 開発サーバーの起動
npm run dev

# テストの実行
npm test
```

### Google OAuth 設定

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 新しいプロジェクトを作成（または既存のプロジェクトを選択）
3. 「APIとサービス」→「認証情報」に移動
4. 「OAuth 2.0 クライアントID」を作成
   - アプリケーションの種類: Webアプリケーション
   - 承認済みのリダイレクトURI: `http://localhost:3000/api/auth/callback/google`
5. クライアントIDとクライアントシークレットを`.env.local`に設定
6. AUTH_SECRETを生成: `openssl rand -base64 32`

## 概要

- **最大8人**まで同時プレイ可能
- **リアルタイム**でゲーム進行（現在はポーリング方式、将来的にWebSocket対応予定）
- **プライバシー保護**: 各プレイヤーは自分の手札のみ閲覧可能
- **Google認証**: Googleアカウントでログイン、カスタムニックネーム設定可能

## プロジェクト構造

```
uno_app/
├── app/                # Next.js アプリケーション
├── lib/                # コアゲームロジック
│   ├── model/          # データモデル（Card, Player, Stage）
│   ├── constants/      # 定数（カード定義、色定義）
│   └── __tests__/      # テストファイル
├── docs/               # ドキュメント
│   ├── SPECIFICATION.md    # 詳細仕様書
│   ├── API_DESIGN.md       # API設計書
│   └── phases/             # フェーズ別作業ログ
└── public/             # 静的ファイル
```

## ドキュメント

- **[詳細仕様書](./docs/SPECIFICATION.md)** - ゲームルール、システム要件、技術仕様
- **[API設計書](./docs/API_DESIGN.md)** - RESTful API設計、エンドポイント仕様
- **[Phase別作業ログ](./docs/phases/)** - 開発フェーズごとの進捗管理

## 開発状況

### ✅ Phase 1: コアゲームロジック（完了）
- コアゲームロジック
- カードモデル（数字カード、特殊カード）
- プレイヤー管理
- ターン管理
- UNO宣言ロジック
- ユニットテスト・統合テスト

### 🚧 Phase 2: API実装（次のステップ）
- API実装（ゲーム管理、状態取得）
- ポーリング処理
- 可視性制御

### 📋 Phase 3: フロントエンド実装
- フロントエンドUI
- ゲームルーム、カード表示、プレイヤー一覧

### 📋 Phase 4: 最適化・拡張
- WebSocket対応
- パフォーマンス最適化
- エラーハンドリング強化

## 技術スタック

- Next.js 15
- React 19
- TypeScript/JavaScript
- Tailwind CSS
- Vitest（テスト）
- NextAuth.js（Google認証）

## ライセンス

Private

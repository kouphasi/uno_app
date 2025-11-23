# UNO App

複数人でリアルタイムにUNOカードゲームをプレイできるWebアプリケーション

## クイックスタート

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# テストの実行
npm test
```

## 概要

- **最大8人**まで同時プレイ可能
- **リアルタイム**でゲーム進行（現在はポーリング方式、将来的にWebSocket対応予定）
- **プライバシー保護**: 各プレイヤーは自分の手札のみ閲覧可能

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

## ライセンス

Private

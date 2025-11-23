# UNO App

複数人でリアルタイムにUNOカードゲームをプレイできるWebアプリケーション

## 概要

- **最大8人**まで同時プレイ可能
- **リアルタイム**でゲーム進行（現在はポーリング方式、将来的にWebSocket対応予定）
- **プライバシー保護**: 各プレイヤーは自分の手札のみ閲覧可能

## 技術スタック

- Next.js 15
- React 19
- TypeScript/JavaScript
- Tailwind CSS
- Vitest（テスト）

## セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# テストの実行
npm test

# テストUI
npm run test:ui

# ビルド
npm run build
```

## プロジェクト構造

```
uno_app/
├── app/                # Next.js アプリケーション
├── lib/                # コアゲームロジック
│   ├── model/          # データモデル（Card, Player, Stage）
│   ├── constants/      # 定数（カード定義、色定義）
│   └── __tests__/      # テストファイル
├── public/             # 静的ファイル
└── SPECIFICATION.md    # 詳細仕様書
```

## ゲームルール

- UNOの公式ルールに準拠
- 場のカードと同じ色または同じ数字のカードを出す
- 特殊カード: Skip, Reverse, Draw 2, Wild, Wild Draw 4
- 手札が1枚になったら「UNO」を宣言

## 開発状況

### ✅ 完了
- コアゲームロジック
- カードモデル（数字カード、特殊カード）
- プレイヤー管理
- ターン管理
- UNO宣言ロジック
- ユニットテスト・統合テスト

### 🚧 次のステップ
- API実装（ゲーム管理、状態取得）
- フロントエンドUI
- ポーリング処理
- プレイヤー認証

### 📋 将来の計画
- WebSocket対応
- チャット機能
- ゲーム履歴・統計
- ランキング機能

## ドキュメント

詳細な仕様については [SPECIFICATION.md](./SPECIFICATION.md) を参照してください。

## ライセンス

Private

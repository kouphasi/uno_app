# Phase 4: 最適化・拡張

## Phase概要

アプリケーションのパフォーマンスとユーザー体験を向上させるための最適化と拡張を行うフェーズ。WebSocket対応、リアルタイム性の向上、パフォーマンス最適化、エラーハンドリング強化を含む。

## タスク

- [x] WebSocket対応
- [x] リアルタイム性の向上
- [x] パフォーマンス最適化
- [x] エラーハンドリング強化

## 作業ログ

### WebSocket対応の実装

#### 1. サーバーサイドの実装

**依存関係のインストール**
- `ws`: WebSocketサーバーライブラリ
- `@types/ws`: TypeScript型定義

**カスタムサーバーの作成** (`server.js`)
- Next.jsのカスタムサーバーを実装
- WebSocketServerを統合
- ゲームID・プレイヤーIDごとに接続を管理
- `/api/ws`エンドポイントでWebSocket接続を処理
- 接続管理機能:
  - 接続の確立と維持
  - ping-pongによるヘルスチェック
  - 自動切断時のクリーンアップ
  - ゲームごとの接続数の追跡

**game-managerの拡張**
- WebSocketブロードキャスト機能の追加:
  - `broadcastGameState()`: ゲーム状態の更新を全プレイヤーに配信
  - `notifyPlayerAction()`: プレイヤーアクション通知
- すべてのゲームアクションでブロードキャスト:
  - プレイヤー参加 (`player_joined`)
  - ゲーム開始 (`game_started`)
  - カードプレイ (`card_played`)
  - カード引く (`card_drawn`)
  - 引いたカードをプレイ (`drawn_card_played`)
  - ターンパス (`turn_passed`)
  - UNO宣言 (`uno_declared`)
  - UNOチャレンジ (`uno_challenged`)

#### 2. クライアントサイドの実装

**WebSocketカスタムフック** (`app/hooks/useWebSocket.ts`)
- WebSocket接続の管理
- 自動再接続機能:
  - 最大5回までの再接続試行
  - エクスポネンシャルバックオフ戦略
  - 接続状態の追跡
- 定期的なpingによる接続維持
- イベントハンドラー:
  - `onGameStateUpdate`: ゲーム状態更新時
  - `onPlayerAction`: プレイヤーアクション発生時
  - `onConnect`: 接続成功時
  - `onDisconnect`: 切断時
  - `onError`: エラー発生時

**ゲームページの更新** (`app/game/[gameId]/page.tsx`)
- WebSocketフックの統合
- ポーリングとWebSocketのハイブリッド方式:
  - WebSocket接続時: リアルタイム更新
  - WebSocket切断時: ポーリングにフォールバック
- 接続状態インジケーターの追加:
  - "Live"モード (WebSocket接続中)
  - "Polling"モード (ポーリング使用中)
- 同時リクエスト防止機能の実装

### パフォーマンス最適化

#### Reactコンポーネントのメモ化
**Card コンポーネント** (`app/components/Card.tsx`)
- `React.memo()`による最適化
- カスタム比較関数:
  - `cardId`の比較
  - `canPlay`の比較
  - `disabled`の比較
  - `size`の比較
- 不要な再レンダリングを防止

**PlayerList コンポーネント** (`app/components/PlayerList.tsx`)
- `React.memo()`による最適化
- 深い比較ロジック:
  - プレイヤー配列の長さチェック
  - 各プレイヤーの属性比較
  - 現在のプレイヤーの比較
- パフォーマンス向上を実現

#### その他の最適化
- 同時fetchリクエストの防止 (`isFetchingRef`)
- 効率的なWebSocket接続管理
- メモリリークの防止

### エラーハンドリング強化

#### WebSocket接続エラーの処理
- 接続エラーの検出と報告
- 自動再接続メカニズム
- フォールバック機能（ポーリングへの自動切り替え）
- ユーザーへの接続状態の可視化

#### 接続の安定性
- ping-pongによるヘルスチェック (30秒間隔)
- 切断時の自動リソースクリーンアップ
- タイムアウト処理
- エクスポネンシャルバックオフによる再接続

### リアルタイム性の向上

#### 通信方式の改善
- **Before**: 2秒間隔のポーリング → 常にサーバーをポーリング
- **After**: WebSocketによるプッシュ通知 → イベント発生時のみ通信

#### 利点
1. **レイテンシーの削減**: ポーリング間隔を待つ必要がなく、即座に更新
2. **サーバー負荷の軽減**: 必要な時のみ通信
3. **ネットワークトラフィックの削減**: 無駄なリクエストを排除
4. **ユーザー体験の向上**: より応答性の高いゲームプレイ
5. **スケーラビリティの向上**: 効率的なリソース使用

### ビルドとデプロイの更新

**package.json スクリプトの更新**
```json
{
  "dev": "node server.js",
  "start": "NODE_ENV=production node server.js"
}
```

### テスト結果

全テストが正常に通過:
- 131テストケースすべて成功
- 既存機能への影響なし
- WebSocket機能の追加による副作用なし

### 実装完了日

2025-11-24

## 技術的な詳細

### WebSocketメッセージフォーマット

**サーバー → クライアント**
```json
{
  "type": "game_state_update" | "player_action" | "connected" | "pong",
  "gameId": "game_xxx",
  "action": "card_played" | "player_joined" | ...,
  "data": {},
  "timestamp": "ISO8601"
}
```

**クライアント → サーバー**
```json
{
  "type": "ping"
}
```

### 接続URL
```
ws://localhost:3000/api/ws?gameId={gameId}&playerId={playerId}
```

### 再接続戦略
- 初回: 即座に再接続
- 2回目: 3秒後
- 3回目: 4.5秒後
- 4回目: 6.75秒後
- 5回目: 10.125秒後
- 6回目以降: 諦める (ポーリングにフォールバック)

## 今後の改善案

- [ ] WebSocketのクラスタリング対応 (複数サーバーインスタンス)
- [ ] Redisを使用した状態共有
- [ ] WebSocketメッセージの圧縮
- [ ] より詳細なパフォーマンスモニタリング
- [ ] サーバーサイドでのレート制限
- [ ] 接続タイムアウトの最適化
- [ ] メトリクス収集とダッシュボード

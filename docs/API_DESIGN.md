# API設計書

## 概要

UNOアプリケーションのRESTful API設計

## エンドポイント一覧

### ゲーム管理

#### 1. ゲーム作成
```
POST /api/games
```

**リクエスト**
```json
{
  "hostPlayerName": "Player1",
  "maxPlayers": 8
}
```

**レスポンス**
```json
{
  "gameId": "game_abc123",
  "hostPlayer": "Player1",
  "maxPlayers": 8,
  "currentPlayers": 1,
  "status": "waiting",
  "createdAt": "2025-11-23T10:00:00Z"
}
```

#### 2. ゲーム参加
```
POST /api/games/:gameId/join
```

**リクエスト**
```json
{
  "playerName": "Player2"
}
```

**レスポンス**
```json
{
  "gameId": "game_abc123",
  "playerId": "player_xyz789",
  "playerName": "Player2",
  "position": 1
}
```

**エラー**
- `400`: ゲームが満員
- `404`: ゲームが見つからない
- `409`: すでに開始済み

#### 3. ゲーム開始
```
POST /api/games/:gameId/start
```

**リクエスト**
```json
{
  "playerId": "player_xyz789"
}
```

**レスポンス**
```json
{
  "gameId": "game_abc123",
  "status": "playing",
  "startedAt": "2025-11-23T10:05:00Z"
}
```

**エラー**
- `403`: ホストプレイヤーのみ開始可能
- `400`: プレイヤー数が不足（最低2人）

#### 4. ゲーム情報取得
```
GET /api/games/:gameId
```

**レスポンス**
```json
{
  "gameId": "game_abc123",
  "status": "playing",
  "maxPlayers": 8,
  "players": [
    {
      "playerId": "player_xyz789",
      "playerName": "Player1",
      "position": 0
    },
    {
      "playerId": "player_def456",
      "playerName": "Player2",
      "position": 1
    }
  ],
  "createdAt": "2025-11-23T10:00:00Z",
  "startedAt": "2025-11-23T10:05:00Z"
}
```

### ゲームプレイ

#### 5. ゲーム状態取得（ポーリング用）
```
GET /api/games/:gameId/state?playerId=player_xyz789
```

**レスポンス**
```json
{
  "gameId": "game_abc123",
  "turn": 15,
  "currentPlayer": {
    "playerId": "player_xyz789",
    "playerName": "Player1"
  },
  "isMyTurn": true,
  "fieldCard": {
    "name": "rednum5",
    "color": {
      "name": "red",
      "code": "#ff0000"
    },
    "num": 5,
    "symbol": null
  },
  "myHand": [
    {
      "cardId": "card_001",
      "name": "rednum7",
      "color": {
        "name": "red",
        "code": "#ff0000"
      },
      "num": 7,
      "canPlay": true
    },
    {
      "cardId": "card_002",
      "name": "blueskip",
      "color": {
        "name": "blue",
        "code": "#0000ff"
      },
      "symbol": "skip",
      "canPlay": false
    }
  ],
  "players": [
    {
      "playerId": "player_xyz789",
      "playerName": "Player1",
      "cardCount": 2,
      "isUno": false,
      "isFinished": false
    },
    {
      "playerId": "player_def456",
      "playerName": "Player2",
      "cardCount": 5,
      "isUno": false,
      "isFinished": false
    }
  ],
  "turnDirection": "clockwise",
  "drawCount": 0,
  "finishedPlayers": [],
  "lastUpdate": "2025-11-23T10:15:30Z"
}
```

**クエリパラメータ**
- `playerId`: プレイヤーID（必須）
- `since`: 最終更新時刻（オプション、変更があった場合のみレスポンス）

**エラー**
- `404`: ゲームまたはプレイヤーが見つからない

#### 6. カードを出す
```
POST /api/games/:gameId/play
```

**リクエスト**
```json
{
  "playerId": "player_xyz789",
  "cardId": "card_001",
  "selectedColor": "red"  // Wildカードの場合のみ必須
}
```

**レスポンス**
```json
{
  "success": true,
  "action": "play_card",
  "card": {
    "cardId": "card_001",
    "name": "rednum7"
  },
  "nextPlayer": {
    "playerId": "player_def456",
    "playerName": "Player2"
  },
  "effect": null
}
```

**特殊カードの場合**
```json
{
  "success": true,
  "action": "play_card",
  "card": {
    "cardId": "card_003",
    "name": "draw4"
  },
  "selectedColor": "red",
  "nextPlayer": {
    "playerId": "player_def456",
    "playerName": "Player2"
  },
  "effect": {
    "type": "draw",
    "count": 4,
    "targetPlayer": "player_def456"
  }
}
```

**エラー**
- `400`: 不正なカード（出せないカード）
- `403`: 自分のターンではない
- `404`: カードまたはゲームが見つからない

#### 7. カードを引く
```
POST /api/games/:gameId/draw
```

**リクエスト**
```json
{
  "playerId": "player_xyz789"
}
```

**レスポンス**
```json
{
  "success": true,
  "action": "draw_card",
  "drawnCard": {
    "cardId": "card_100",
    "name": "greennum3",
    "color": {
      "name": "green",
      "code": "#00ff00"
    },
    "num": 3,
    "canPlay": false
  },
  "canPlayDrawnCard": false
}
```

**引いたカードが出せる場合**
```json
{
  "success": true,
  "action": "draw_card",
  "drawnCard": {
    "cardId": "card_100",
    "name": "rednum8",
    "color": {
      "name": "red",
      "code": "#ff0000"
    },
    "num": 8,
    "canPlay": true
  },
  "canPlayDrawnCard": true
}
```

**エラー**
- `403`: 自分のターンではない、またはカードを引く必要がない
- `404`: ゲームが見つからない

#### 8. 引いたカードを出す
```
POST /api/games/:gameId/play-drawn
```

**リクエスト**
```json
{
  "playerId": "player_xyz789",
  "cardId": "card_100"
}
```

**レスポンス**
```json
{
  "success": true,
  "action": "play_drawn_card",
  "card": {
    "cardId": "card_100",
    "name": "rednum8"
  },
  "nextPlayer": {
    "playerId": "player_def456",
    "playerName": "Player2"
  }
}
```

#### 9. パスする（引いたカードを出さない）
```
POST /api/games/:gameId/pass
```

**リクエスト**
```json
{
  "playerId": "player_xyz789"
}
```

**レスポンス**
```json
{
  "success": true,
  "action": "pass",
  "nextPlayer": {
    "playerId": "player_def456",
    "playerName": "Player2"
  }
}
```

#### 10. UNO宣言
```
POST /api/games/:gameId/uno
```

**リクエスト**
```json
{
  "playerId": "player_xyz789"
}
```

**レスポンス**
```json
{
  "success": true,
  "action": "uno_declared",
  "playerName": "Player1"
}
```

**エラー**
- `400`: 手札が2枚以上ある

#### 11. UNO忘れを指摘
```
POST /api/games/:gameId/challenge-uno
```

**リクエスト**
```json
{
  "playerId": "player_xyz789",
  "targetPlayerId": "player_def456"
}
```

**レスポンス**
```json
{
  "success": true,
  "action": "uno_penalty",
  "targetPlayer": "player_def456",
  "penaltyCards": 2
}
```

**エラー**
- `400`: 対象プレイヤーはUNO宣言済み、または手札が1枚でない

## ステータスコード

- `200`: 成功
- `400`: 不正なリクエスト
- `403`: 権限なし
- `404`: リソースが見つからない
- `409`: 競合（ゲームが開始済み、など）
- `500`: サーバーエラー

## ポーリング戦略

### 推奨設定
- **通常時**: 2秒間隔
- **自分のターン**: 1秒間隔
- **待機中**: 3秒間隔

### 最適化
- `If-Modified-Since`ヘッダーを使用
- `since`クエリパラメータで差分取得
- 変更がない場合は`304 Not Modified`を返す

### Long Polling（将来的な実装）
```
GET /api/games/:gameId/state?playerId=player_xyz789&wait=true&timeout=30
```

- サーバー側で最大30秒待機
- 状態変更があれば即座にレスポンス
- タイムアウト時は最新状態を返す

## WebSocket対応（将来実装）

### 接続
```
WS /api/games/:gameId/ws?playerId=player_xyz789
```

### メッセージ形式

**サーバー → クライアント**
```json
{
  "type": "game_state_update",
  "data": {
    // ゲーム状態（state APIと同じ形式）
  }
}
```

```json
{
  "type": "player_action",
  "data": {
    "action": "play_card",
    "player": "Player2",
    "card": "rednum7"
  }
}
```

**クライアント → サーバー**
```json
{
  "type": "play_card",
  "data": {
    "cardId": "card_001",
    "selectedColor": "red"
  }
}
```

## セキュリティ

### 認証
- プレイヤーIDをセッションまたはJWTで管理
- 各リクエストでプレイヤーIDを検証

### バリデーション
- サーバー側で全てのアクションを検証
- 不正なカードを出せないようにチェック
- ターン順序を厳密に管理

### レート制限
- プレイヤーごとにAPIコール数を制限
- 連続リクエストを防止

## エラーレスポンス形式

```json
{
  "error": {
    "code": "INVALID_CARD",
    "message": "このカードは出せません",
    "details": {
      "cardId": "card_002",
      "reason": "色も数字も一致しません"
    }
  }
}
```

## エラーコード一覧

| コード | 説明 |
|--------|------|
| `GAME_NOT_FOUND` | ゲームが見つからない |
| `PLAYER_NOT_FOUND` | プレイヤーが見つからない |
| `GAME_FULL` | ゲームが満員 |
| `GAME_ALREADY_STARTED` | ゲームが既に開始済み |
| `NOT_YOUR_TURN` | 自分のターンではない |
| `INVALID_CARD` | 不正なカード |
| `CARD_NOT_FOUND` | カードが見つからない |
| `NOT_HOST` | ホストプレイヤーのみ実行可能 |
| `INSUFFICIENT_PLAYERS` | プレイヤー数が不足 |
| `UNO_NOT_APPLICABLE` | UNO宣言できない状態 |

# Phase 2: API実装（完了）

## Phase概要

Webアプリケーションとして機能させるためのRESTful APIを実装するフェーズ。ゲーム管理、状態取得（ポーリング）、プレイヤーアクション、可視性制御を含む。

## タスク

- [x] ゲーム管理API
- [x] ゲーム状態取得API（ポーリング）
- [x] プレイヤーアクションAPI
- [x] 可視性制御の実装

## 作業ログ

### 2025-11-23: Phase 2 実装完了

#### 実装内容

1. **ゲームセッション管理**
   - `lib/game-manager.ts` を作成
   - メモリ内でゲーム状態を管理するシングルトンクラス
   - ゲームセッション、プレイヤー情報、ドローカードの管理

2. **ゲーム管理API**
   - `POST /api/games` - ゲーム作成
   - `POST /api/games/:gameId/join` - ゲーム参加
   - `POST /api/games/:gameId/start` - ゲーム開始
   - `GET /api/games/:gameId` - ゲーム情報取得

3. **ゲーム状態取得API（ポーリング）**
   - `GET /api/games/:gameId/state` - ゲーム状態取得
   - プレイヤーIDに基づく可視性制御を実装
   - 自分の手札のみ表示、他プレイヤーは枚数のみ表示
   - `canPlay` フラグでカードのプレイ可否を判定

4. **プレイヤーアクションAPI**
   - `POST /api/games/:gameId/play` - カードを出す
   - `POST /api/games/:gameId/draw` - カードを引く
   - `POST /api/games/:gameId/play-drawn` - 引いたカードを出す
   - `POST /api/games/:gameId/pass` - パスする
   - `POST /api/games/:gameId/uno` - UNO宣言
   - `POST /api/games/:gameId/challenge-uno` - UNO忘れを指摘

5. **可視性制御の実装**
   - プレイヤーIDに基づいて手札情報をフィルタリング
   - 他プレイヤーの手札は枚数のみ返す
   - カードのシリアライズ処理を実装

#### 技術的な考慮事項

- **エラーハンドリング**: 各エラーケースに対応したエラーコードとメッセージ
- **セキュリティ**: プレイヤーIDによる認証、ターン順序の厳密な管理
- **状態管理**: ドローしたカードを一時的に保存する仕組み
- **ペナルティ処理**: UNO宣言忘れのペナルティを自動適用

#### 実装したエンドポイント

| メソッド | パス | 説明 |
|---------|------|------|
| POST | /api/games | ゲーム作成 |
| POST | /api/games/:gameId/join | ゲーム参加 |
| POST | /api/games/:gameId/start | ゲーム開始 |
| GET | /api/games/:gameId | ゲーム情報取得 |
| GET | /api/games/:gameId/state | ゲーム状態取得（可視性制御付き） |
| POST | /api/games/:gameId/play | カードを出す |
| POST | /api/games/:gameId/draw | カードを引く |
| POST | /api/games/:gameId/play-drawn | 引いたカードを出す |
| POST | /api/games/:gameId/pass | パスする |
| POST | /api/games/:gameId/uno | UNO宣言 |
| POST | /api/games/:gameId/challenge-uno | UNO忘れを指摘 |

#### 次のステップ

Phase 3: フロントエンド実装に進む準備が整いました。
- UIコンポーネントの作成
- ポーリング処理の実装
- カード画像の表示
- ゲームフローのUI化

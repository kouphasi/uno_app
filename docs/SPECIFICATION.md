# UNOアプリケーション仕様書

## 1. プロジェクト概要

複数人でリアルタイムにUNOカードゲームをプレイできるWebアプリケーション。

### 1.1 技術スタック
- **フロントエンド**: Next.js 15, React 19
- **言語**: JavaScript/TypeScript
- **スタイリング**: Tailwind CSS
- **テスト**: Vitest

## 2. ゲームルール

### 2.1 基本ルール
- UNOの公式ルールに準拠
- プレイヤーは手札をすべて出し切ることを目指す
- 場のカードと同じ色または同じ数字のカードを出せる
- 出せるカードがない場合は山札から1枚引く
- 手札が残り1枚になったら「UNO」を宣言する必要がある

### 2.2 カードの種類

#### 数字カード (0-9)
- 各色（赤、緑、青、黄）に0-9の数字カード

#### 特殊カード
- **Skip（スキップ）**: 次のプレイヤーの順番を飛ばす
- **Reverse（リバース）**: ターンの順序を逆にする
- **Draw 2（ドロー2）**: 次のプレイヤーに2枚引かせる
- **Wild（ワイルド）**: 任意の色を指定できる
- **Wild Draw 4（ワイルドドロー4）**: 任意の色を指定し、次のプレイヤーに4枚引かせる

### 2.3 UNO宣言
- 手札が2枚の時にカードを出す際、「UNO」を宣言する必要がある
- 宣言を忘れた場合、次のプレイヤーのターン前に指摘されるとペナルティとして2枚引く

## 3. システム要件

### 3.1 プレイヤー数
- **最小プレイヤー数**: 2人
- **最大プレイヤー数**: 8人

### 3.2 通信方式
- **現在**: ポーリング方式
  - クライアントが定期的にサーバーに状態を問い合わせる
  - 実装がシンプルで導入が容易
- **将来**: WebSocket方式
  - リアルタイム性の向上
  - サーバープッシュによる効率的な通信

## 4. 機能仕様

### 4.1 ゲーム進行

#### 4.1.1 ゲーム開始
1. プレイヤーが参加（2-8人）
2. プレイヤーをランダムにシャッフル
3. 各プレイヤーに7枚ずつカードを配布
4. 場に最初のカード（数字カード）を1枚配置
5. ゲーム開始

#### 4.1.2 ターン進行
1. 現在のプレイヤーが手札から出せるカードを選択
2. 出せるカードがない場合：
   - 山札から1枚引く
   - 引いたカードが出せる場合は出すことができる
3. カードを出した場合、カードの効果を処理
4. 次のプレイヤーにターンを移す

#### 4.1.3 ゲーム終了
- 1人を除く全プレイヤーが手札をなくした時点でゲーム終了
- 最初に手札をなくしたプレイヤーが勝者
- 最後まで残ったプレイヤーが敗者

### 4.2 可視性制御

#### 4.2.1 各プレイヤーが見える情報
- **自分の手札**: 全て表示
- **他プレイヤーの手札**: 枚数のみ表示（内容は非表示）
- **場のカード**: 現在の場のカード
- **ターン情報**: 現在のプレイヤー
- **ゲーム状態**: ターン順序、終了したプレイヤー

#### 4.2.2 セキュリティ
- サーバー側で各プレイヤーの手札を管理
- クライアントには自分の手札情報のみ送信
- 他プレイヤーの手札内容は送信しない

### 4.3 特殊カードの効果処理

#### Skip
- `step`: 1（次のプレイヤーをスキップせず、ターン進行は1）
- 効果: なし（実質的に次のプレイヤーの番になる）

#### Reverse
- `step`: 2（次のプレイヤーをスキップして2つ進む）
- 効果: ターン順序を逆転（`isOpposite`フラグを反転）

#### Draw 2
- `step`: 1
- `drawNum`: 2
- 効果: 次のプレイヤーに2枚引かせる

#### Wild
- `step`: 1
- `drawNum`: 0
- 効果: プレイヤーが色を選択

#### Wild Draw 4
- `step`: 1
- `drawNum`: 4
- 効果: プレイヤーが色を選択し、次のプレイヤーに4枚引かせる

## 5. 技術仕様

### 5.1 データモデル

#### Stage（ゲーム全体の状態）
```javascript
class Stage {
  players: Player[]           // プレイヤーリスト
  turn: number                // 現在のターン数
  currentPlayerIndex: number  // 現在のプレイヤーのインデックス
  fieldCards: Card[]          // 場に出されたカード
  isOpposite: boolean         // ターン順序が逆かどうか
  finishedPlayers: Player[]   // ゲームを終了したプレイヤー
  num: number                 // 現在の数字
  color: Color                // 現在の色
  drawNum: number             // 次のプレイヤーが引く枚数
}
```

#### Player（プレイヤー）
```javascript
class Player {
  name: string        // プレイヤー名
  cards: Card[]       // 手札
  isUno: boolean      // UNO宣言したかどうか
}
```

#### Card（カード基底クラス）
```javascript
class Card {
  name: string        // カード名
  step: number        // ターン進行数
  drawNum: number     // 引かせる枚数

  canPut(stage): boolean      // カードを出せるか判定
  handleCard(stage): void     // カードの効果を処理
}
```

#### NumCard（数字カード）
```javascript
class NumCard extends Card {
  num: number         // 数字（0-9）
  color: Color        // 色
}
```

#### SpecialCard（特殊カード）
```javascript
class SpecialCard extends Card {
  symbol: string      // 'skip' | 'reverse' | 'draw2' | 'wild' | 'draw4'
  color: Color        // 色（wildの場合はnull）
  effect: Function    // 特殊効果の関数
}
```

#### Color（色）
```javascript
class Color {
  name: string        // 'red' | 'green' | 'blue' | 'yellow'
  code: string        // カラーコード
}
```

### 5.2 ゲームフロー

#### 初期化フロー
```
1. Stage.setUpField()
   ├─ プレイヤーをシャッフル
   ├─ 各プレイヤーに7枚配布
   └─ 場に最初のカード（数字カード）を配置
```

#### ターンフロー
```
1. Stage.playTurn()
   ├─ drawNum > 0の場合
   │  ├─ commitWithSingleChance()（1回だけ出すチャンス）
   │  │  └─ 出せなければdrawNum枚引く
   │  └─ drawNumをリセット
   │
   └─ drawNum == 0の場合
      ├─ commitWithDoubleChance()（2回チャンス）
      │  ├─ 1回目: 手札から出せるカードを選択
      │  └─ 出せない場合: 1枚引いて再度判定
      └─ カードを場に出す

2. UNOチェック
   └─ 前のプレイヤーがUNO宣言を忘れていたらペナルティ

3. 次のターンへ
   ├─ ターン数をインクリメント
   ├─ 手札が0枚のプレイヤーを終了リストに追加
   └─ 次のプレイヤーにターンを移す
```

### 5.3 カード配布ロジック

#### カード生成
- `cardCreators`: 全カードの生成関数の配列
  - 数字カード: 各色0-9（合計40種類）
  - 特殊カード: Skip, Reverse, Draw2（各色、合計12種類）
  - ワイルドカード: Wild, Wild Draw4（合計2種類）

#### ランダム抽選
```javascript
Stage.draw() {
  return cardCreators[Math.floor(Math.random() * cardCreators.length)]();
}
```

### 5.4 API設計（予定）

#### ゲーム管理
- `POST /api/games` - ゲーム作成
- `GET /api/games/:gameId` - ゲーム状態取得
- `POST /api/games/:gameId/join` - ゲーム参加
- `POST /api/games/:gameId/start` - ゲーム開始

#### ゲームプレイ
- `GET /api/games/:gameId/state` - ゲーム状態取得（ポーリング用）
- `POST /api/games/:gameId/play` - カードを出す
- `POST /api/games/:gameId/draw` - カードを引く
- `POST /api/games/:gameId/uno` - UNO宣言

#### レスポンス形式
```javascript
{
  gameId: string,
  turn: number,
  currentPlayer: string,
  fieldCard: {
    name: string,
    color: string,
    num: number | null
  },
  myCards: Card[],  // 自分の手札のみ
  players: [
    {
      name: string,
      cardCount: number,  // 枚数のみ
      isUno: boolean
    }
  ],
  isOpposite: boolean,
  finishedPlayers: string[]
}
```

## 6. 実装の優先順位

### Phase 1: コアゲームロジック（完了）
- ✅ カードモデルの実装
- ✅ プレイヤーモデルの実装
- ✅ ゲーム進行ロジックの実装
- ✅ 特殊カード効果の実装
- ✅ UNO宣言ロジックの実装

### Phase 2: API実装（次のステップ）
- [ ] ゲーム管理API
- [ ] ゲーム状態取得API（ポーリング）
- [ ] プレイヤーアクションAPI
- [ ] 可視性制御の実装

### Phase 3: フロントエンド実装
- [ ] ゲームルームUI
- [ ] カード表示UI
- [ ] プレイヤー一覧UI
- [ ] アクションボタン（カードを出す、引く、UNO宣言）
- [ ] ポーリング処理の実装

### Phase 4: 最適化・拡張
- [ ] WebSocket対応
- [ ] リアルタイム性の向上
- [ ] パフォーマンス最適化
- [ ] エラーハンドリング強化

## 7. 制約事項・注意点

### 7.1 現在の制約
- ポーリング方式のため、リアルタイム性に若干の遅延がある
- サーバー負荷を考慮したポーリング間隔の設定が必要

### 7.2 セキュリティ考慮事項
- プレイヤー認証の実装
- 不正なカード出しの検証
- セッション管理
- タイムアウト処理

### 7.3 スケーラビリティ
- 同時ゲーム数の上限検討
- データベース設計（ゲーム状態の永続化）
- キャッシュ戦略

## 8. 将来の拡張予定

### 8.1 機能拡張
- [ ] チャット機能
- [ ] ゲーム履歴・統計
- [ ] ランキング機能
- [ ] カスタムルール設定
- [ ] 観戦モード
- [ ] リプレイ機能

### 8.2 技術改善
- [ ] WebSocket対応
- [ ] データベース導入
- [ ] TypeScript完全移行
- [ ] パフォーマンス監視
- [ ] CI/CD パイプライン強化

### 8.3 UX改善
- [ ] アニメーション効果
- [ ] サウンド効果
- [ ] モバイル最適化
- [ ] 多言語対応
- [ ] アクセシビリティ向上

// Polling configuration
export const POLLING_INTERVAL_MS = 2000;

// Card symbols
export const CardSymbol = {
  SKIP: 'skip',
  REVERSE: 'reverse',
  DRAW2: 'draw2',
  WILD: 'wild',
  DRAW4: 'draw4',
} as const;

export type CardSymbolType = typeof CardSymbol[keyof typeof CardSymbol];

// Card image paths
export const CARD_IMAGE_PATHS = {
  [CardSymbol.SKIP]: '/cards/skip-card.png',
  [CardSymbol.REVERSE]: '/cards/skip2-card.png',
  [CardSymbol.DRAW2]: '/cards/draw2-card.png',
  [CardSymbol.WILD]: '/cards/wild-card.png',
  [CardSymbol.DRAW4]: '/cards/draw4-card.png',
  BACK: '/cards/back.jpeg',
} as const;

// Game status
export const GameStatus = {
  WAITING: 'waiting',
  PLAYING: 'playing',
  FINISHED: 'finished',
} as const;

export type GameStatusType = typeof GameStatus[keyof typeof GameStatus];

import Stage from './model/stage';
import Player from './model/player';
import Card from './model/card';

export type GameStatus = 'waiting' | 'playing' | 'finished';

export interface PlayerInfo {
  playerId: string;
  playerName: string;
  position: number;
  player: Player;
}

export interface GameSession {
  gameId: string;
  hostPlayerId: string;
  maxPlayers: number;
  status: GameStatus;
  players: PlayerInfo[];
  stage: Stage | null;
  createdAt: Date;
  startedAt: Date | null;
  lastUpdate: Date;
  drawnCardByPlayer: Map<string, Card>;
}

class GameManager {
  private games: Map<string, GameSession> = new Map();

  generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // WebSocket broadcast helper
  private broadcastGameState(gameId: string): void {
    if (typeof global !== 'undefined' && (global as any).wsServer) {
      const wsServer = (global as any).wsServer;
      const game = this.getGame(gameId);
      if (game && wsServer.hasConnections(gameId)) {
        wsServer.broadcastToGame(gameId, {
          type: 'game_state_update',
          gameId,
          timestamp: new Date().toISOString(),
        });
      }
    }
  }

  private notifyPlayerAction(gameId: string, action: string, data: any): void {
    if (typeof global !== 'undefined' && (global as any).wsServer) {
      const wsServer = (global as any).wsServer;
      if (wsServer.hasConnections(gameId)) {
        wsServer.broadcastToGame(gameId, {
          type: 'player_action',
          action,
          data,
          timestamp: new Date().toISOString(),
        });
      }
    }
  }

  createGame(hostPlayerName: string, maxPlayers: number = 8): { gameId: string; playerId: string } {
    const gameId = this.generateId('game');
    const playerId = this.generateId('player');

    const player = new Player(hostPlayerName);

    const game: GameSession = {
      gameId,
      hostPlayerId: playerId,
      maxPlayers,
      status: 'waiting',
      players: [{
        playerId,
        playerName: hostPlayerName,
        position: 0,
        player,
      }],
      stage: null,
      createdAt: new Date(),
      startedAt: null,
      lastUpdate: new Date(),
      drawnCardByPlayer: new Map(),
    };

    this.games.set(gameId, game);
    return { gameId, playerId };
  }

  getGame(gameId: string): GameSession | null {
    return this.games.get(gameId) || null;
  }

  joinGame(gameId: string, playerName: string): { playerId: string; position: number } {
    const game = this.getGame(gameId);
    if (!game) {
      throw new Error('GAME_NOT_FOUND');
    }
    if (game.status !== 'waiting') {
      throw new Error('GAME_ALREADY_STARTED');
    }
    if (game.players.length >= game.maxPlayers) {
      throw new Error('GAME_FULL');
    }

    const playerId = this.generateId('player');
    const player = new Player(playerName);
    const position = game.players.length;

    game.players.push({
      playerId,
      playerName,
      position,
      player,
    });
    game.lastUpdate = new Date();

    // Broadcast player joined
    this.notifyPlayerAction(gameId, 'player_joined', {
      playerId,
      playerName,
      position,
    });
    this.broadcastGameState(gameId);

    return { playerId, position };
  }

  startGame(gameId: string, playerId: string): void {
    const game = this.getGame(gameId);
    if (!game) {
      throw new Error('GAME_NOT_FOUND');
    }
    if (game.hostPlayerId !== playerId) {
      throw new Error('NOT_HOST');
    }
    if (game.players.length < 2) {
      throw new Error('INSUFFICIENT_PLAYERS');
    }
    if (game.status !== 'waiting') {
      throw new Error('GAME_ALREADY_STARTED');
    }

    const players = game.players.map(p => p.player);
    const stage = new Stage(players);
    stage.setUpField();

    game.stage = stage;
    game.status = 'playing';
    game.startedAt = new Date();
    game.lastUpdate = new Date();

    // Broadcast game started
    this.notifyPlayerAction(gameId, 'game_started', {
      status: 'playing',
      startedAt: game.startedAt.toISOString(),
    });
    this.broadcastGameState(gameId);
  }

  getPlayerInfo(gameId: string, playerId: string): PlayerInfo | null {
    const game = this.getGame(gameId);
    if (!game) return null;
    return game.players.find(p => p.playerId === playerId) || null;
  }

  findPlayerInStage(stage: Stage, player: Player): number {
    return stage.players.findIndex(p => p === player);
  }

  playCard(gameId: string, playerId: string, cardName: string, selectedColor?: string): Card {
    const game = this.getGame(gameId);
    if (!game) {
      throw new Error('GAME_NOT_FOUND');
    }
    if (!game.stage) {
      throw new Error('GAME_NOT_STARTED');
    }

    const playerInfo = this.getPlayerInfo(gameId, playerId);
    if (!playerInfo) {
      throw new Error('PLAYER_NOT_FOUND');
    }

    const stage = game.stage;
    const currentPlayer = stage.currentPlayer;
    if (currentPlayer !== playerInfo.player) {
      throw new Error('NOT_YOUR_TURN');
    }

    // Check if player has drawn a card and must play/pass it first
    if (game.drawnCardByPlayer.has(playerId)) {
      throw new Error('MUST_HANDLE_DRAWN_CARD');
    }

    // Find the card in player's hand
    const card = playerInfo.player.cards.find(c => c.name === cardName);
    if (!card) {
      throw new Error('CARD_NOT_FOUND');
    }

    // Check if card can be played
    if (!card.canPut(stage)) {
      throw new Error('INVALID_CARD');
    }

    // Remove card from player's hand
    playerInfo.player.cards = playerInfo.player.cards.filter(c => c !== card);

    // Handle wild card color selection
    if (selectedColor && (card.symbol === 'wild' || card.symbol === 'draw4')) {
      const colors = require('./constants/colors').default;
      const color = colors.find((c: any) => c.name === selectedColor);
      if (!color) {
        throw new Error('INVALID_COLOR');
      }
      card.color = color;
    }

    // Check UNO declaration
    if (playerInfo.player.cardCount === 1 && !playerInfo.player.isUno) {
      playerInfo.player.sayUno();
    }

    // Put card on field
    stage.putCard(card);

    // Check UNO penalty for previous player
    const previousPlayer = stage.previousPlayer;
    if ((previousPlayer.cardCount === 1 && !previousPlayer.isUno) ||
        (previousPlayer.cardCount > 1 && previousPlayer.isUno)) {
      previousPlayer.getCard(stage.draw());
      previousPlayer.getCard(stage.draw());
    }

    // Move to next turn
    stage.nextTurn(card);

    // Check if game is finished
    if (stage.shouldEndField()) {
      game.status = 'finished';
    }

    game.lastUpdate = new Date();

    // Broadcast card played
    this.notifyPlayerAction(gameId, 'card_played', {
      playerId,
      cardName: card.name,
      selectedColor,
    });
    this.broadcastGameState(gameId);

    return card;
  }

  drawCard(gameId: string, playerId: string): Card {
    const game = this.getGame(gameId);
    if (!game) {
      throw new Error('GAME_NOT_FOUND');
    }
    if (!game.stage) {
      throw new Error('GAME_NOT_STARTED');
    }

    const playerInfo = this.getPlayerInfo(gameId, playerId);
    if (!playerInfo) {
      throw new Error('PLAYER_NOT_FOUND');
    }

    const stage = game.stage;
    const currentPlayer = stage.currentPlayer;
    if (currentPlayer !== playerInfo.player) {
      throw new Error('NOT_YOUR_TURN');
    }

    // Check if already drawn a card
    if (game.drawnCardByPlayer.has(playerId)) {
      throw new Error('ALREADY_DRAWN');
    }

    // If drawNum > 0, player must draw multiple cards
    if (stage.drawNum > 0) {
      // Try to put a card with single chance first
      const canPutCards = playerInfo.player.canPutCards(stage);
      if (canPutCards.length === 0) {
        // Must draw drawNum cards
        for (let i = 0; i < stage.drawNum; i++) {
          playerInfo.player.getCard(stage.draw());
        }
        stage.resetDrawNum();
        stage.nextTurn(null);
        game.lastUpdate = new Date();
        throw new Error('DREW_PENALTY_CARDS');
      }
      throw new Error('CAN_PUT_CARD');
    }

    // Normal draw
    const drawnCard = stage.draw();
    game.drawnCardByPlayer.set(playerId, drawnCard);
    game.lastUpdate = new Date();

    // Broadcast card drawn
    this.notifyPlayerAction(gameId, 'card_drawn', {
      playerId,
    });
    this.broadcastGameState(gameId);

    return drawnCard;
  }

  playDrawnCard(gameId: string, playerId: string, selectedColor?: string): Card {
    const game = this.getGame(gameId);
    if (!game) {
      throw new Error('GAME_NOT_FOUND');
    }
    if (!game.stage) {
      throw new Error('GAME_NOT_STARTED');
    }

    const playerInfo = this.getPlayerInfo(gameId, playerId);
    if (!playerInfo) {
      throw new Error('PLAYER_NOT_FOUND');
    }

    const stage = game.stage;
    const currentPlayer = stage.currentPlayer;
    if (currentPlayer !== playerInfo.player) {
      throw new Error('NOT_YOUR_TURN');
    }

    const drawnCard = game.drawnCardByPlayer.get(playerId);
    if (!drawnCard) {
      throw new Error('NO_DRAWN_CARD');
    }

    if (!drawnCard.canPut(stage)) {
      throw new Error('INVALID_CARD');
    }

    // Handle wild card color selection
    if (selectedColor && (drawnCard.symbol === 'wild' || drawnCard.symbol === 'draw4')) {
      const colors = require('./constants/colors').default;
      const color = colors.find((c: any) => c.name === selectedColor);
      if (!color) {
        throw new Error('INVALID_COLOR');
      }
      drawnCard.color = color;
    }

    // Check UNO declaration
    if (playerInfo.player.cardCount === 0 && !playerInfo.player.isUno) {
      playerInfo.player.sayUno();
    }

    // Put card on field
    stage.putCard(drawnCard);
    game.drawnCardByPlayer.delete(playerId);

    // Move to next turn
    stage.nextTurn(drawnCard);

    // Check if game is finished
    if (stage.shouldEndField()) {
      game.status = 'finished';
    }

    game.lastUpdate = new Date();

    // Broadcast drawn card played
    this.notifyPlayerAction(gameId, 'drawn_card_played', {
      playerId,
      cardName: drawnCard.name,
      selectedColor,
    });
    this.broadcastGameState(gameId);

    return drawnCard;
  }

  passTurn(gameId: string, playerId: string): void {
    const game = this.getGame(gameId);
    if (!game) {
      throw new Error('GAME_NOT_FOUND');
    }
    if (!game.stage) {
      throw new Error('GAME_NOT_STARTED');
    }

    const playerInfo = this.getPlayerInfo(gameId, playerId);
    if (!playerInfo) {
      throw new Error('PLAYER_NOT_FOUND');
    }

    const stage = game.stage;
    const currentPlayer = stage.currentPlayer;
    if (currentPlayer !== playerInfo.player) {
      throw new Error('NOT_YOUR_TURN');
    }

    const drawnCard = game.drawnCardByPlayer.get(playerId);
    if (!drawnCard) {
      throw new Error('NO_DRAWN_CARD');
    }

    // Add drawn card to hand
    playerInfo.player.getCard(drawnCard);
    game.drawnCardByPlayer.delete(playerId);

    // Move to next turn
    stage.nextTurn(null);
    game.lastUpdate = new Date();

    // Broadcast turn passed
    this.notifyPlayerAction(gameId, 'turn_passed', {
      playerId,
    });
    this.broadcastGameState(gameId);
  }

  declareUno(gameId: string, playerId: string): void {
    const game = this.getGame(gameId);
    if (!game) {
      throw new Error('GAME_NOT_FOUND');
    }
    if (!game.stage) {
      throw new Error('GAME_NOT_STARTED');
    }

    const playerInfo = this.getPlayerInfo(gameId, playerId);
    if (!playerInfo) {
      throw new Error('PLAYER_NOT_FOUND');
    }

    if (playerInfo.player.cardCount !== 1) {
      throw new Error('UNO_NOT_APPLICABLE');
    }

    playerInfo.player.isUno = true;
    game.lastUpdate = new Date();

    // Broadcast UNO declared
    this.notifyPlayerAction(gameId, 'uno_declared', {
      playerId,
      playerName: playerInfo.playerName,
    });
    this.broadcastGameState(gameId);
  }

  challengeUno(gameId: string, playerId: string, targetPlayerId: string): number {
    const game = this.getGame(gameId);
    if (!game) {
      throw new Error('GAME_NOT_FOUND');
    }
    if (!game.stage) {
      throw new Error('GAME_NOT_STARTED');
    }

    const targetPlayerInfo = this.getPlayerInfo(gameId, targetPlayerId);
    if (!targetPlayerInfo) {
      throw new Error('TARGET_PLAYER_NOT_FOUND');
    }

    if (targetPlayerInfo.player.cardCount !== 1) {
      throw new Error('TARGET_NOT_ONE_CARD');
    }

    if (targetPlayerInfo.player.isUno) {
      throw new Error('TARGET_ALREADY_DECLARED');
    }

    // Apply penalty
    const stage = game.stage;
    targetPlayerInfo.player.getCard(stage.draw());
    targetPlayerInfo.player.getCard(stage.draw());
    game.lastUpdate = new Date();

    // Broadcast UNO challenge
    this.notifyPlayerAction(gameId, 'uno_challenged', {
      challengerId: playerId,
      targetPlayerId,
      targetPlayerName: targetPlayerInfo.playerName,
      penaltyCards: 2,
    });
    this.broadcastGameState(gameId);

    return 2;
  }
}

// Singleton instance
const gameManager = new GameManager();
export default gameManager;

import { describe, it, expect, beforeEach, vi } from 'vitest';
import Stage from '../model/stage.js';
import Player from '../model/player.js';
import NumCard from '../model/num_card.js';
import SpecialCard from '../model/special_card.js';
import Color from '../model/color.js';

describe('UNO Game Integration Tests', () => {
  let stage: Stage;
  let players: Player[];

  beforeEach(() => {
    players = [
      new Player('Alice'),
      new Player('Bob'),
      new Player('Charlie'),
      new Player('Diana')
    ];
    stage = new Stage(players);
  });

  describe('Game Setup and Flow', () => {
    it('should setup the game field correctly', () => {
      stage.setUpField();

      // Each player should have 7 cards
      stage.players.forEach(player => {
        expect(player.cardCount).toBe(7);
      });

      // Field should have at least one card
      expect(stage.fieldCards.length).toBeGreaterThan(0);

      // First card should be a number card
      expect((stage.latestCard as any).num).not.toBeNull();
    });

    it('should complete a full game and determine a winner', () => {
      const result = stage.play();

      // Game should have a winner and a loser
      expect(result.winner).toBeDefined();
      expect(result.looser).toBeDefined();

      // Winner should have 0 cards
      expect(result.winner.cardCount).toBe(0);

      // Loser should have at least 1 card
      expect(result.looser.cardCount).toBeGreaterThan(0);

      // Winner should be in finished players
      expect(stage.finishedPlayers).toContain(result.winner);

      // Only one player should remain playing
      expect(stage.playablePlayers.length).toBe(1);
    });
  });

  describe('Player and Stage Integration', () => {
    it('should allow players to draw and put cards', () => {
      const redColor = new Color({ name: 'red', code: '#ff0000' });
      const card1 = new NumCard({ name: 'red5', num: 5, color: redColor });
      const card2 = new NumCard({ name: 'red7', num: 7, color: redColor });

      const player = new Player('TestPlayer');
      player.getCard(card1);
      player.getCard(card2);

      expect(player.cardCount).toBe(2);

      // Setup stage with a matching card
      stage.fieldCards = [new NumCard({ name: 'red3', num: 3, color: redColor })];
      stage.setColor(redColor);
      stage.setNum(3);

      // Player should be able to put a card
      const putCard = player.putCard(stage);

      expect(putCard).not.toBeNull();
      expect(player.cardCount).toBe(1);
    });

    it('should handle turn progression correctly', () => {
      stage.setUpField();
      const initialPlayer = stage.currentPlayer;
      const initialTurn = stage.turn;

      stage.playTurn();

      // Turn should have progressed
      expect(stage.turn).toBe(initialTurn + 1);

      // Current player should have changed (unless it was a skip or similar)
      // We can't guarantee player change due to special cards, but we can check turn increased
      expect(stage.turn).toBeGreaterThan(initialTurn);
    });

    it('should finish a player when they have no cards', () => {
      const player = players[0];
      const redColor = new Color({ name: 'red', code: '#ff0000' });

      // Give player only one card
      player.cards = [new NumCard({ name: 'red5', num: 5, color: redColor })];

      // Set up field so player can put the card
      stage.fieldCards = [new NumCard({ name: 'red3', num: 3, color: redColor })];
      stage.setColor(redColor);
      stage.setNum(3);
      stage.currentPlayerIndex = 0;

      // Play the card
      const card = player.putCard(stage);
      stage.putCard(card);
      stage.nextTurn(card);

      // Player should be finished
      expect(stage.finishedPlayers).toContain(player);
      expect(player.cardCount).toBe(0);
    });
  });

  describe('Special Cards Effects', () => {
    it('should reverse turn order when reverse card is played', () => {
      const redColor = new Color({ name: 'red', code: '#ff0000' });
      const reverseCard = new SpecialCard({
        name: 'redreverse',
        symbol: 'reverse',
        step: 2,
        drawNum: 0,
        color: redColor,
        effect: (stage) => stage.reverse()
      });

      expect(stage.isOpposite).toBe(false);

      reverseCard.handleCard(stage);

      expect(stage.isOpposite).toBe(true);
    });

    it('should skip next player when skip card is played', () => {
      const redColor = new Color({ name: 'red', code: '#ff0000' });
      const skipCard = new SpecialCard({
        name: 'redskip',
        symbol: 'skip',
        step: 2,
        drawNum: 0,
        color: redColor
      });

      stage.setUpField();
      const initialIndex = stage.currentPlayerIndex;

      // Play skip card
      stage.putCard(skipCard);
      stage.nextTurn(skipCard);

      // Should skip one player (step is 2 for skip card)
      expect(stage.playerIndex(stage.currentPlayerIndex)).toBe(
        stage.playerIndex(initialIndex + 2)
      );
    });

    it('should accumulate draw numbers with draw2 and draw4 cards', () => {
      const redColor = new Color({ name: 'red', code: '#ff0000' });
      const draw2Card = new SpecialCard({
        name: 'reddraw2',
        symbol: 'draw2',
        step: 1,
        drawNum: 2,
        color: redColor
      });

      const draw4Card = new SpecialCard({
        name: 'draw4',
        symbol: 'draw4',
        step: 1,
        drawNum: 4,
        color: null,
        effect: (stage) => stage.setColor(stage.currentPlayer.selectColor())
      });

      stage.drawNum = 0;

      draw2Card.handleCard(stage);
      expect(stage.drawNum).toBe(2);

      draw4Card.handleCard(stage);
      expect(stage.drawNum).toBe(6);
    });

    it('should change color when wild card is played', () => {
      const initialColor = new Color({ name: 'red', code: '#ff0000' });
      stage.setColor(initialColor);

      const wildCard = new SpecialCard({
        name: 'wild',
        symbol: 'wild',
        step: 1,
        drawNum: 0,
        color: null,
        effect: (stage) => {
          const newColor = new Color({ name: 'blue', code: '#0000ff' });
          stage.setColor(newColor);
        }
      });

      wildCard.handleCard(stage);

      // Color should have changed
      expect(stage.color).not.toEqual(initialColor);
    });
  });

  describe('Card Matching Logic', () => {
    it('should allow same color cards to be played', () => {
      const redColor = new Color({ name: 'red', code: '#ff0000' });
      const card1 = new NumCard({ name: 'red5', num: 5, color: redColor });
      const card2 = new NumCard({ name: 'red7', num: 7, color: redColor });

      stage.fieldCards = [card1];
      stage.setColor(redColor);
      stage.setNum(5);
      stage.drawNum = 0;

      expect(card2.canPut(stage)).toBe(true);
    });

    it('should allow same number cards to be played', () => {
      const redColor = new Color({ name: 'red', code: '#ff0000' });
      const blueColor = new Color({ name: 'blue', code: '#0000ff' });
      const card1 = new NumCard({ name: 'red5', num: 5, color: redColor });
      const card2 = new NumCard({ name: 'blue5', num: 5, color: blueColor });

      stage.fieldCards = [card1];
      stage.setColor(redColor);
      stage.setNum(5);
      stage.drawNum = 0;

      expect(card2.canPut(stage)).toBe(true);
    });

    it('should not allow mismatched cards to be played', () => {
      const redColor = new Color({ name: 'red', code: '#ff0000' });
      const blueColor = new Color({ name: 'blue', code: '#0000ff' });
      const card1 = new NumCard({ name: 'red5', num: 5, color: redColor });
      const card2 = new NumCard({ name: 'blue7', num: 7, color: blueColor });

      stage.fieldCards = [card1];
      stage.setColor(redColor);
      stage.setNum(5);
      stage.drawNum = 0;

      expect(card2.canPut(stage)).toBe(false);
    });

    it('should only allow draw cards when drawNum is active', () => {
      const redColor = new Color({ name: 'red', code: '#ff0000' });
      const blueColor = new Color({ name: 'blue', code: '#0000ff' });

      const numCard = new NumCard({ name: 'red5', num: 5, color: redColor });
      const draw2Card = new SpecialCard({
        name: 'bluedraw2',
        symbol: 'draw2',
        step: 1,
        drawNum: 2,
        color: blueColor
      });

      stage.fieldCards = [draw2Card];
      stage.setColor(blueColor);
      stage.setNum(null);
      stage.drawNum = 2;

      // Number cards should not be playable when drawNum is active
      expect(numCard.canPut(stage)).toBe(false);

      // Only matching draw cards should be playable
      const matchingDraw2 = new SpecialCard({
        name: 'reddraw2',
        symbol: 'draw2',
        step: 1,
        drawNum: 2,
        color: redColor
      });

      expect(matchingDraw2.canPut(stage)).toBe(true);
    });
  });

  describe('UNO Declaration Logic', () => {
    it('should allow players to say UNO when they have 2 cards', () => {
      const player = new Player('TestPlayer');
      const redColor = new Color({ name: 'red', code: '#ff0000' });

      player.getCard(new NumCard({ name: 'red5', num: 5, color: redColor }));
      player.getCard(new NumCard({ name: 'red7', num: 7, color: redColor }));

      expect(player.cardCount).toBe(2);

      // Mock random to always say UNO
      vi.spyOn(Math, 'random').mockReturnValue(0.3);

      player.sayUno();

      // UNO status should be set based on random (we mocked it to < 0.5)
      expect(player.isUno).toBe(true);

      vi.restoreAllMocks();
    });

    it('should reset UNO status when player draws a card', () => {
      const player = new Player('TestPlayer');
      const redColor = new Color({ name: 'red', code: '#ff0000' });

      player.isUno = true;
      player.getCard(new NumCard({ name: 'red5', num: 5, color: redColor }));

      expect(player.isUno).toBe(false);
    });
  });

  describe('Multiple Players Game Flow', () => {
    it('should handle a game with 2 players', () => {
      const twoPlayers = [new Player('Player1'), new Player('Player2')];
      const twoPlayerStage = new Stage(twoPlayers);

      const result = twoPlayerStage.play();

      expect(result.winner).toBeDefined();
      expect(result.looser).toBeDefined();
      expect(twoPlayerStage.finishedPlayers.length).toBe(1);
    });

    it('should handle a game with 4 players', () => {
      const fourPlayers = [
        new Player('Player1'),
        new Player('Player2'),
        new Player('Player3'),
        new Player('Player4')
      ];
      const fourPlayerStage = new Stage(fourPlayers);

      const result = fourPlayerStage.play();

      expect(result.winner).toBeDefined();
      expect(result.looser).toBeDefined();
      expect(fourPlayerStage.finishedPlayers.length).toBe(3);
    });
  });

  describe('Player Index Calculation', () => {
    it('should correctly wrap player indices in normal order', () => {
      stage.setUpField();
      const playerCount = stage.playablePlayers.length;

      // Test wrapping
      expect(stage.playerIndex(0)).toBe(0);
      expect(stage.playerIndex(playerCount)).toBe(0);
      expect(stage.playerIndex(playerCount + 1)).toBe(1);
    });

    it('should correctly handle negative indices', () => {
      stage.setUpField();
      const playerCount = stage.playablePlayers.length;

      // Test negative wrapping
      expect(stage.playerIndex(-1)).toBe(playerCount - 1);
      expect(stage.playerIndex(-2)).toBe(playerCount - 2);
    });

    it('should correctly advance turns in opposite direction', () => {
      stage.setUpField();
      const initialIndex = stage.currentPlayerIndex;

      stage.isOpposite = true;
      stage.nextPlayerIndex(1);

      // In opposite direction, should go backwards
      expect(stage.currentPlayerIndex).toBe(initialIndex - 1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle when player has no valid cards to play', () => {
      const player = new Player('TestPlayer');
      const redColor = new Color({ name: 'red', code: '#ff0000' });
      const blueColor = new Color({ name: 'blue', code: '#0000ff' });

      // Player only has blue cards
      player.getCard(new NumCard({ name: 'blue3', num: 3, color: blueColor }));
      player.getCard(new NumCard({ name: 'blue7', num: 7, color: blueColor }));

      // Field requires red 5
      stage.fieldCards = [new NumCard({ name: 'red5', num: 5, color: redColor })];
      stage.setColor(redColor);
      stage.setNum(5);
      stage.drawNum = 0;

      const selectedCard = player.selectCard(stage);

      expect(selectedCard).toBeNull();
    });

    it('should ensure first card is always a number card', () => {
      // Run multiple times to ensure consistency
      for (let i = 0; i < 10; i++) {
        const firstCard = stage.drawFirstCard();
        expect((firstCard as any).num).not.toBeNull();
      }
    });

    it('should handle game end condition correctly', () => {
      stage.setUpField();

      // Initially, game should not end
      expect(stage.shouldEndField()).toBe(false);

      // Finish all but one player
      for (let i = 0; i < stage.players.length - 1; i++) {
        stage.finishPlayer(stage.players[i]);
      }

      // Now game should end
      expect(stage.shouldEndField()).toBe(true);
    });
  });
});

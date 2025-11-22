import Stage from '../../model/stage.js';
import Player from '../../model/player.js';
import NumCard from '../../model/num_card.js';
import SpecialCard from '../../model/special_card.js';
import Color from '../../model/color.js';

// Mock console.log to avoid cluttering test output
global.console.log = jest.fn();
global.console.error = jest.fn();

describe('UNO Game Integration Tests', () => {
  let stage;
  let player1, player2, player3, player4;

  beforeEach(() => {
    player1 = new Player('Alice');
    player2 = new Player('Bob');
    player3 = new Player('Charlie');
    player4 = new Player('Diana');
    stage = new Stage([player1, player2, player3, player4]);
    jest.clearAllMocks();
  });

  describe('Game Setup', () => {
    test('should set up a complete game', () => {
      stage.setUpField();

      // All players should have 7 cards
      expect(player1.cardCount).toBe(7);
      expect(player2.cardCount).toBe(7);
      expect(player3.cardCount).toBe(7);
      expect(player4.cardCount).toBe(7);

      // There should be a first card on the field
      expect(stage.fieldCards.length).toBe(1);
      expect(stage.latestCard).toBeDefined();
      expect(stage.latestCard.num).toBeDefined();
    });

    test('should shuffle players', () => {
      const originalPlayers = [...stage.players];
      stage.setUpField();

      // Players should still all be present
      expect(stage.players.length).toBe(4);
      expect(stage.players).toEqual(expect.arrayContaining(originalPlayers));
    });
  });

  describe('Game Flow', () => {
    test('should progress through multiple turns', () => {
      stage.setUpField();

      const initialTurn = stage.turn;

      // Play a few turns
      for (let i = 0; i < 5; i++) {
        if (!stage.shouldEndField()) {
          stage.playTurn();
        }
      }

      expect(stage.turn).toBeGreaterThan(initialTurn);
      expect(stage.fieldCards.length).toBeGreaterThan(1);
    });

    test('should handle player turn progression', () => {
      stage.setUpField();

      const firstPlayer = stage.currentPlayer;
      stage.playTurn();

      // Current player should have changed
      expect(stage.currentPlayer).not.toBe(firstPlayer);
    });

    test('should handle reverse direction', () => {
      stage.setUpField();
      expect(stage.isOpposite).toBe(false);

      stage.reverse();
      expect(stage.isOpposite).toBe(true);

      stage.reverse();
      expect(stage.isOpposite).toBe(false);
    });
  });

  describe('Card Placement Rules', () => {
    let redColor, blueColor;

    beforeEach(() => {
      redColor = new Color({ name: 'red', code: '#ff0000' });
      blueColor = new Color({ name: 'blue', code: '#0000ff' });
    });

    test('should allow placing card with same color', () => {
      const fieldCard = new NumCard({ name: 'red5', num: 5, color: redColor });
      const playerCard = new NumCard({ name: 'red7', num: 7, color: redColor });

      stage.fieldCards = [fieldCard];

      expect(playerCard.canPut(stage)).toBe(true);
    });

    test('should allow placing card with same number', () => {
      const fieldCard = new NumCard({ name: 'red5', num: 5, color: redColor });
      const playerCard = new NumCard({ name: 'blue5', num: 5, color: blueColor });

      stage.fieldCards = [fieldCard];

      expect(playerCard.canPut(stage)).toBe(true);
    });

    test('should not allow placing card with different color and number', () => {
      const fieldCard = new NumCard({ name: 'red5', num: 5, color: redColor });
      const playerCard = new NumCard({ name: 'blue7', num: 7, color: blueColor });

      stage.fieldCards = [fieldCard];
      stage.drawNum = 0;

      expect(playerCard.canPut(stage)).toBe(false);
    });

    test('should allow wild cards on any card', () => {
      const fieldCard = new NumCard({ name: 'red5', num: 5, color: redColor });
      const wildCard = new SpecialCard({
        name: 'wild',
        symbol: 'wild',
        step: 1,
        drawNum: 0,
        color: null,
      });

      stage.fieldCards = [fieldCard];
      stage.drawNum = 0;

      expect(wildCard.canPut(stage)).toBe(true);
    });
  });

  describe('Special Cards', () => {
    let redColor;

    beforeEach(() => {
      redColor = new Color({ name: 'red', code: '#ff0000' });
    });

    test('should handle skip card effect', () => {
      stage.setUpField();

      const skipCard = new SpecialCard({
        name: 'redskip',
        symbol: 'skip',
        step: 2,
        drawNum: 0,
        color: redColor,
      });

      const initialIndex = stage.currentPlayerIndex;
      stage.nextPlayerIndex(skipCard.step);

      // Should skip the next player
      expect(stage.currentPlayerIndex).toBe((initialIndex + 2) % stage.playablePlayers.length);
    });

    test('should handle reverse card effect', () => {
      stage.setUpField();

      const reverseEffect = stage => stage.reverse();
      const reverseCard = new SpecialCard({
        name: 'redreverse',
        symbol: 'reverse',
        step: 2,
        drawNum: 0,
        color: redColor,
        effect: reverseEffect,
      });

      const initialDirection = stage.isOpposite;
      reverseCard.effect(stage);

      expect(stage.isOpposite).toBe(!initialDirection);
    });

    test('should handle draw2 card effect', () => {
      stage.setUpField();

      const draw2Card = new SpecialCard({
        name: 'reddraw2',
        symbol: 'draw2',
        step: 1,
        drawNum: 2,
        color: redColor,
      });

      stage.drawNum = 0;
      draw2Card.handleCard(stage);

      expect(stage.drawNum).toBe(2);
    });

    test('should handle draw4 card effect', () => {
      stage.setUpField();

      const draw4Card = new SpecialCard({
        name: 'draw4',
        symbol: 'draw4',
        step: 1,
        drawNum: 4,
        color: null,
      });

      stage.drawNum = 0;
      draw4Card.handleCard(stage);

      expect(stage.drawNum).toBe(4);
    });
  });

  describe('UNO Rules', () => {
    test('should penalize player who does not say UNO', () => {
      const redColor = new Color({ name: 'red', code: '#ff0000' });
      player1.cards = [
        new NumCard({ name: 'red5', num: 5, color: redColor }),
      ];
      player1.isUno = false;

      const initialCardCount = player1.cardCount;

      // Simulate penalty - player has 1 card and didn't say UNO
      if (player1.cardCount === 1 && !player1.isUno) {
        player1.getCard(stage.draw());
        player1.getCard(stage.draw());
      }

      expect(player1.cardCount).toBe(initialCardCount + 2);
    });

    test('should allow player to say UNO when down to 2 cards', () => {
      const redColor = new Color({ name: 'red', code: '#ff0000' });
      player1.cards = [
        new NumCard({ name: 'red5', num: 5, color: redColor }),
        new NumCard({ name: 'red7', num: 7, color: redColor }),
      ];

      const fieldCard = new NumCard({ name: 'red3', num: 3, color: redColor });
      stage.fieldCards = [fieldCard];

      // When selecting a card with 2 cards in hand, sayUno should be called
      const sayUnoSpy = jest.spyOn(player1, 'sayUno');
      player1.selectCard(stage);

      expect(sayUnoSpy).toHaveBeenCalled();
    });
  });

  describe('Game Completion', () => {
    test('should detect when game should end', () => {
      stage.finishedPlayers = [];
      expect(stage.shouldEndField()).toBe(false);

      stage.finishedPlayers = [player1, player2, player3];
      expect(stage.shouldEndField()).toBe(true);
    });

    test('should finish player when they run out of cards', () => {
      player1.cards = [];
      stage.currentPlayerIndex = 0;

      const card = new NumCard({
        name: 'red5',
        num: 5,
        color: new Color({ name: 'red', code: '#ff0000' })
      });

      stage.nextTurn(card);

      expect(stage.finishedPlayers).toContain(player1);
    });

    test('should return correct winner and loser', () => {
      stage.finishedPlayers = [player1, player2, player3];

      const result = stage.getResult();

      expect(result.winner).toBe(player1);
      expect(result.looser).toBe(player4);
    });

    test('should complete a full game', () => {
      const result = stage.play();

      expect(result.winner).toBeDefined();
      expect(result.looser).toBeDefined();
      expect(stage.finishedPlayers.length).toBe(stage.players.length - 1);
    });
  });

  describe('Draw Mechanics', () => {
    test('should allow player to draw and play', () => {
      stage.setUpField();

      const initialCardCount = stage.currentPlayer.cardCount;
      const mockCard = stage.draw();

      stage.currentPlayer.getCard(mockCard);

      expect(stage.currentPlayer.cardCount).toBe(initialCardCount + 1);
    });

    test('should handle stacking draw cards', () => {
      const redColor = new Color({ name: 'red', code: '#ff0000' });

      const draw2Card1 = new SpecialCard({
        name: 'reddraw2',
        symbol: 'draw2',
        step: 1,
        drawNum: 2,
        color: redColor,
      });

      stage.drawNum = 0;
      draw2Card1.handleCard(stage);
      expect(stage.drawNum).toBe(2);

      const draw2Card2 = new SpecialCard({
        name: 'bluedraw2',
        symbol: 'draw2',
        step: 1,
        drawNum: 2,
        color: new Color({ name: 'blue', code: '#0000ff' }),
      });

      draw2Card2.handleCard(stage);
      expect(stage.drawNum).toBe(4);
    });
  });
});

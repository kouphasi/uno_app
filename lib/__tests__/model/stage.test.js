import Stage from '../../model/stage.js';
import Player from '../../model/player.js';
import NumCard from '../../model/num_card.js';
import SpecialCard from '../../model/special_card.js';
import Color from '../../model/color.js';

// Mock console.log to avoid cluttering test output
global.console.log = jest.fn();
global.console.error = jest.fn();

describe('Stage', () => {
  let stage;
  let player1, player2, player3;
  let redColor, blueColor;

  beforeEach(() => {
    player1 = new Player('Player1');
    player2 = new Player('Player2');
    player3 = new Player('Player3');
    stage = new Stage([player1, player2, player3]);
    redColor = new Color({ name: 'red', code: '#ff0000' });
    blueColor = new Color({ name: 'blue', code: '#0000ff' });
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    test('should create a stage with players', () => {
      expect(stage.players).toEqual([player1, player2, player3]);
      expect(stage.turn).toBe(1);
      expect(stage.currentPlayerIndex).toBe(0);
      expect(stage.fieldCards).toEqual([]);
      expect(stage.isOpposite).toBe(false);
      expect(stage.finishedPlayers).toEqual([]);
    });
  });

  describe('playablePlayers', () => {
    test('should return all players initially', () => {
      expect(stage.playablePlayers).toEqual([player1, player2, player3]);
    });

    test('should exclude finished players', () => {
      stage.finishedPlayers = [player1];
      expect(stage.playablePlayers).toEqual([player2, player3]);
    });
  });

  describe('currentPlayer', () => {
    test('should return the current player', () => {
      expect(stage.currentPlayer).toBe(player1);
    });

    test('should return correct player after index change', () => {
      stage.currentPlayerIndex = 1;
      expect(stage.currentPlayer).toBe(player2);
    });
  });

  describe('previousPlayer', () => {
    test('should return the previous player in normal direction', () => {
      stage.currentPlayerIndex = 1;
      stage.isOpposite = false;
      expect(stage.previousPlayer).toBe(player1);
    });

    test('should return the previous player in opposite direction', () => {
      stage.currentPlayerIndex = 1;
      stage.isOpposite = true;
      expect(stage.previousPlayer).toBe(player1);
    });
  });

  describe('getPlayer', () => {
    test('should return player at given index', () => {
      expect(stage.getPlayer(0)).toBe(player1);
      expect(stage.getPlayer(1)).toBe(player2);
      expect(stage.getPlayer(2)).toBe(player3);
    });
  });

  describe('playerIndex', () => {
    test('should handle positive index', () => {
      expect(stage.playerIndex(0)).toBe(0);
      expect(stage.playerIndex(1)).toBe(1);
      expect(stage.playerIndex(2)).toBe(2);
    });

    test('should wrap around for index >= player count', () => {
      expect(stage.playerIndex(3)).toBe(0);
      expect(stage.playerIndex(4)).toBe(1);
      expect(stage.playerIndex(5)).toBe(2);
    });

    test('should handle negative index', () => {
      expect(stage.playerIndex(-1)).toBe(2);
      expect(stage.playerIndex(-2)).toBe(1);
      expect(Math.abs(stage.playerIndex(-3))).toBe(0);
      expect(stage.playerIndex(-4)).toBe(2);
    });
  });

  describe('latestCard', () => {
    test('should return the last card in fieldCards', () => {
      const card1 = new NumCard({ name: 'red5', num: 5, color: redColor });
      const card2 = new NumCard({ name: 'blue3', num: 3, color: blueColor });
      stage.fieldCards = [card1, card2];

      expect(stage.latestCard).toBe(card2);
    });
  });

  describe('finishPlayer', () => {
    test('should add player to finishedPlayers', () => {
      stage.finishPlayer(player1);
      expect(stage.finishedPlayers).toContain(player1);
    });
  });

  describe('nextPlayerIndex', () => {
    test('should increment by 1 in normal direction', () => {
      stage.currentPlayerIndex = 0;
      stage.isOpposite = false;
      stage.nextPlayerIndex(1);
      expect(stage.currentPlayerIndex).toBe(1);
    });

    test('should decrement by 1 in opposite direction', () => {
      stage.currentPlayerIndex = 1;
      stage.isOpposite = true;
      stage.nextPlayerIndex(1);
      expect(stage.currentPlayerIndex).toBe(0);
    });

    test('should skip players with step > 1', () => {
      stage.currentPlayerIndex = 0;
      stage.isOpposite = false;
      stage.nextPlayerIndex(2);
      expect(stage.currentPlayerIndex).toBe(2);
    });
  });

  describe('draw', () => {
    test('should return a card', () => {
      const card = stage.draw();
      expect(card).toBeDefined();
      expect(card.name).toBeDefined();
    });
  });

  describe('reverse', () => {
    test('should toggle isOpposite', () => {
      expect(stage.isOpposite).toBe(false);
      stage.reverse();
      expect(stage.isOpposite).toBe(true);
      stage.reverse();
      expect(stage.isOpposite).toBe(false);
    });
  });

  describe('setColor', () => {
    test('should set the color', () => {
      stage.setColor(redColor);
      expect(stage.color).toBe(redColor);
    });
  });

  describe('setNum', () => {
    test('should set the num', () => {
      stage.setNum(5);
      expect(stage.num).toBe(5);
    });
  });

  describe('addDrawNum', () => {
    test('should add to drawNum', () => {
      stage.drawNum = 2;
      stage.addDrawNum(2);
      expect(stage.drawNum).toBe(4);
    });
  });

  describe('resetDrawNum', () => {
    test('should reset drawNum to 0', () => {
      stage.drawNum = 4;
      stage.resetDrawNum();
      expect(stage.drawNum).toBe(0);
    });
  });

  describe('putCard', () => {
    test('should add card to fieldCards and call handleCard', () => {
      const card = new NumCard({ name: 'red5', num: 5, color: redColor });
      const handleCardSpy = jest.spyOn(card, 'handleCard');

      stage.putCard(card);

      expect(stage.fieldCards).toContain(card);
      expect(handleCardSpy).toHaveBeenCalledWith(stage);
    });

    test('should do nothing if card is null', () => {
      const initialLength = stage.fieldCards.length;
      stage.putCard(null);
      expect(stage.fieldCards.length).toBe(initialLength);
    });
  });

  describe('nextTurn', () => {
    test('should increment turn and move to next player', () => {
      const card = new NumCard({ name: 'red5', num: 5, color: redColor });
      player1.cards = [card];

      stage.nextTurn(card);

      expect(stage.turn).toBe(2);
      expect(stage.currentPlayerIndex).toBe(1);
    });

    test('should finish player when they have no cards', () => {
      const card = new NumCard({ name: 'red5', num: 5, color: redColor });
      player1.cards = [];

      stage.nextTurn(card);

      expect(stage.finishedPlayers).toContain(player1);
    });

    test('should use card step for next player index', () => {
      const skipCard = new SpecialCard({
        name: 'redskip',
        symbol: 'skip',
        step: 2,
        drawNum: 0,
        color: redColor,
      });

      stage.nextTurn(skipCard);

      expect(stage.currentPlayerIndex).toBe(2);
    });
  });

  describe('shouldEndField', () => {
    test('should return false when game is not over', () => {
      expect(stage.shouldEndField()).toBe(false);
    });

    test('should return true when only one player remains', () => {
      stage.finishedPlayers = [player1, player2];
      expect(stage.shouldEndField()).toBe(true);
    });
  });

  describe('getResult', () => {
    test('should return winner and looser', () => {
      stage.finishedPlayers = [player1];

      const result = stage.getResult();

      expect(result.winner).toBe(player1);
      expect(result.looser).toBe(player2);
    });
  });

  describe('drawFirstCard', () => {
    test('should return a number card', () => {
      // Mock draw to return a special card first, then a number card
      let callCount = 0;
      const originalDraw = stage.draw.bind(stage);
      stage.draw = jest.fn(() => {
        callCount++;
        if (callCount === 1) {
          return new SpecialCard({
            name: 'wild',
            symbol: 'wild',
            step: 1,
            drawNum: 0,
            color: null,
          });
        }
        return new NumCard({ name: 'red5', num: 5, color: redColor });
      });

      const firstCard = stage.drawFirstCard();

      expect(firstCard.num).toBeDefined();
      expect(firstCard.num).not.toBeNull();
    });
  });

  describe('setUpField', () => {
    test('should distribute 7 cards to each player', () => {
      stage.setUpField();

      expect(player1.cardCount).toBe(7);
      expect(player2.cardCount).toBe(7);
      expect(player3.cardCount).toBe(7);
    });

    test('should put a first card on the field', () => {
      stage.setUpField();

      expect(stage.fieldCards.length).toBeGreaterThan(0);
      expect(stage.latestCard).toBeDefined();
    });

    test('should reset finishedPlayers', () => {
      stage.finishedPlayers = [player1];
      stage.setUpField();

      expect(stage.finishedPlayers).toEqual([]);
    });

    test('should shuffle players', () => {
      const originalPlayers = [...stage.players];
      stage.setUpField();

      // Players array should be modified (though could be same order by chance)
      expect(stage.players.length).toBe(originalPlayers.length);
      expect(stage.players).toEqual(expect.arrayContaining(originalPlayers));
    });
  });

  describe('commitWithSingleChance', () => {
    test('should call putCard on current player', () => {
      const putCardSpy = jest.spyOn(player1, 'putCard');
      stage.commitWithSingleChance();

      expect(putCardSpy).toHaveBeenCalledWith(stage);
    });
  });

  describe('commitWithDoubleChance', () => {
    test('should return card if first attempt succeeds', () => {
      const card = new NumCard({ name: 'red5', num: 5, color: redColor });
      player1.putCard = jest.fn().mockReturnValue(card);

      const result = stage.commitWithDoubleChance();

      expect(result).toBe(card);
      expect(player1.putCard).toHaveBeenCalledTimes(1);
    });

    test('should draw card and try again if first attempt fails', () => {
      const card = new NumCard({ name: 'red5', num: 5, color: redColor });
      player1.putCard = jest.fn()
        .mockReturnValueOnce(null)
        .mockReturnValueOnce(card);

      const getCardSpy = jest.spyOn(player1, 'getCard');

      const result = stage.commitWithDoubleChance();

      expect(player1.putCard).toHaveBeenCalledTimes(2);
      expect(getCardSpy).toHaveBeenCalled();
    });
  });
});

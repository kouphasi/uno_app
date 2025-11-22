import Player from '../../model/player.js';
import NumCard from '../../model/num_card.js';
import SpecialCard from '../../model/special_card.js';
import Color from '../../model/color.js';

// Mock console.log to avoid cluttering test output
global.console.log = jest.fn();

describe('Player', () => {
  let player;
  let redColor, blueColor;

  beforeEach(() => {
    player = new Player('TestPlayer');
    redColor = new Color({ name: 'red', code: '#ff0000' });
    blueColor = new Color({ name: 'blue', code: '#0000ff' });
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    test('should create a player with name and empty cards array', () => {
      expect(player.name).toBe('TestPlayer');
      expect(player.cards).toEqual([]);
      expect(player.isUno).toBe(false);
    });
  });

  describe('cardCount', () => {
    test('should return 0 for new player', () => {
      expect(player.cardCount).toBe(0);
    });

    test('should return correct card count', () => {
      const card1 = new NumCard({ name: 'red5', num: 5, color: redColor });
      const card2 = new NumCard({ name: 'blue3', num: 3, color: blueColor });
      player.cards = [card1, card2];

      expect(player.cardCount).toBe(2);
    });
  });

  describe('getCards', () => {
    test('should add multiple cards to player hand', () => {
      const cards = [
        new NumCard({ name: 'red5', num: 5, color: redColor }),
        new NumCard({ name: 'blue3', num: 3, color: blueColor }),
      ];

      player.getCards(cards);

      expect(player.cards).toEqual(cards);
      expect(player.cardCount).toBe(2);
    });

    test('should append cards to existing cards', () => {
      const existingCard = new NumCard({ name: 'red1', num: 1, color: redColor });
      player.cards = [existingCard];

      const newCards = [
        new NumCard({ name: 'red5', num: 5, color: redColor }),
        new NumCard({ name: 'blue3', num: 3, color: blueColor }),
      ];

      player.getCards(newCards);

      expect(player.cardCount).toBe(3);
      expect(player.cards[0]).toBe(existingCard);
    });
  });

  describe('getCard', () => {
    test('should add a single card to player hand', () => {
      const card = new NumCard({ name: 'red5', num: 5, color: redColor });
      player.getCard(card);

      expect(player.cards).toContain(card);
      expect(player.cardCount).toBe(1);
    });

    test('should set isUno to false when getting a card', () => {
      player.isUno = true;
      const card = new NumCard({ name: 'red5', num: 5, color: redColor });
      player.getCard(card);

      expect(player.isUno).toBe(false);
    });

    test('should log player got card', () => {
      const card = new NumCard({ name: 'red5', num: 5, color: redColor });
      player.getCard(card);

      expect(console.log).toHaveBeenCalledWith('TestPlayer got red5');
    });
  });

  describe('sayUno', () => {
    test('should randomly set isUno', () => {
      // Run multiple times to test randomness
      const results = [];
      for (let i = 0; i < 10; i++) {
        const testPlayer = new Player('Test');
        testPlayer.sayUno();
        results.push(testPlayer.isUno);
      }

      // At least one should be true and one should be false (statistically)
      // This test might rarely fail due to randomness
      expect(results).toEqual(expect.arrayContaining([true]));
    });

    test('should log when player says UNO', () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.3); // Will result in isUno = true
      player.sayUno();

      expect(player.isUno).toBe(true);
      expect(console.log).toHaveBeenCalledWith('TestPlayer said UNO!');

      jest.restoreAllMocks();
    });

    test('should not log when player does not say UNO', () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.7); // Will result in isUno = false
      player.sayUno();

      expect(player.isUno).toBe(false);
      expect(console.log).not.toHaveBeenCalled();

      jest.restoreAllMocks();
    });
  });

  describe('canPutCards', () => {
    test('should return cards that can be put on the field', () => {
      const card1 = new NumCard({ name: 'red5', num: 5, color: redColor });
      const card2 = new NumCard({ name: 'red3', num: 3, color: redColor });
      const card3 = new NumCard({ name: 'blue3', num: 3, color: blueColor });
      player.cards = [card1, card2, card3];

      const fieldCard = new NumCard({ name: 'red7', num: 7, color: redColor });
      const mockStage = {
        latestCard: fieldCard,
        drawNum: 0,
      };

      const canPut = player.canPutCards(mockStage);

      expect(canPut).toEqual([card1, card2]);
    });

    test('should return empty array when no cards can be put', () => {
      const card1 = new NumCard({ name: 'blue5', num: 5, color: blueColor });
      const card2 = new NumCard({ name: 'blue3', num: 3, color: blueColor });
      player.cards = [card1, card2];

      const fieldCard = new NumCard({ name: 'red7', num: 7, color: redColor });
      const mockStage = {
        latestCard: fieldCard,
        drawNum: 0,
      };

      const canPut = player.canPutCards(mockStage);

      expect(canPut).toEqual([]);
    });
  });

  describe('selectCard', () => {
    test('should return null when no cards can be put', () => {
      const card1 = new NumCard({ name: 'blue5', num: 5, color: blueColor });
      player.cards = [card1];

      const fieldCard = new NumCard({ name: 'red7', num: 7, color: redColor });
      const mockStage = {
        latestCard: fieldCard,
        drawNum: 0,
      };

      const selected = player.selectCard(mockStage);

      expect(selected).toBeNull();
    });

    test('should return a valid card when cards can be put', () => {
      const card1 = new NumCard({ name: 'red5', num: 5, color: redColor });
      const card2 = new NumCard({ name: 'red3', num: 3, color: redColor });
      player.cards = [card1, card2];

      const fieldCard = new NumCard({ name: 'red7', num: 7, color: redColor });
      const mockStage = {
        latestCard: fieldCard,
        drawNum: 0,
      };

      const selected = player.selectCard(mockStage);

      expect([card1, card2]).toContain(selected);
    });

    test('should say UNO when player has 2 cards and has not said UNO', () => {
      const card1 = new NumCard({ name: 'red5', num: 5, color: redColor });
      const card2 = new NumCard({ name: 'red3', num: 3, color: redColor });
      player.cards = [card1, card2];
      player.isUno = false;

      const fieldCard = new NumCard({ name: 'red7', num: 7, color: redColor });
      const mockStage = {
        latestCard: fieldCard,
        drawNum: 0,
      };

      const sayUnoSpy = jest.spyOn(player, 'sayUno');
      player.selectCard(mockStage);

      expect(sayUnoSpy).toHaveBeenCalled();
    });

    test('should not say UNO when player has already said UNO', () => {
      const card1 = new NumCard({ name: 'red5', num: 5, color: redColor });
      const card2 = new NumCard({ name: 'red3', num: 3, color: redColor });
      player.cards = [card1, card2];
      player.isUno = true;

      const fieldCard = new NumCard({ name: 'red7', num: 7, color: redColor });
      const mockStage = {
        latestCard: fieldCard,
        drawNum: 0,
      };

      const sayUnoSpy = jest.spyOn(player, 'sayUno');
      player.selectCard(mockStage);

      expect(sayUnoSpy).not.toHaveBeenCalled();
    });
  });

  describe('selectColor', () => {
    test('should return a valid color', () => {
      const selectedColor = player.selectColor();

      expect(selectedColor).toBeInstanceOf(Color);
      expect(['red', 'green', 'blue', 'yellow']).toContain(selectedColor.name);
    });
  });

  describe('putCard', () => {
    test('should remove card from player hand and return it', () => {
      const card1 = new NumCard({ name: 'red5', num: 5, color: redColor });
      const card2 = new NumCard({ name: 'red3', num: 3, color: redColor });
      player.cards = [card1, card2];

      const fieldCard = new NumCard({ name: 'red7', num: 7, color: redColor });
      const mockStage = {
        latestCard: fieldCard,
        drawNum: 0,
      };

      const putCard = player.putCard(mockStage);

      expect([card1, card2]).toContain(putCard);
      expect(player.cards).not.toContain(putCard);
      expect(player.cardCount).toBe(1);
    });

    test('should return null when no cards can be put', () => {
      const card1 = new NumCard({ name: 'blue5', num: 5, color: blueColor });
      player.cards = [card1];

      const fieldCard = new NumCard({ name: 'red7', num: 7, color: redColor });
      const mockStage = {
        latestCard: fieldCard,
        drawNum: 0,
      };

      const putCard = player.putCard(mockStage);

      expect(putCard).toBeNull();
      expect(player.cardCount).toBe(1);
    });

    test('should log player put card', () => {
      const card1 = new NumCard({ name: 'red5', num: 5, color: redColor });
      player.cards = [card1];

      const fieldCard = new NumCard({ name: 'red7', num: 7, color: redColor });
      const mockStage = {
        latestCard: fieldCard,
        drawNum: 0,
      };

      player.putCard(mockStage);

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('TestPlayer put'));
    });
  });
});

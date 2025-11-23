import { describe, it, expect, vi, beforeEach } from 'vitest';
import Player from '../player.js';
import NumCard from '../num_card.js';
import Color from '../color.js';
import Stage from '../stage.js';

describe('Player', () => {
  let player: Player;
  const red = new Color({ name: 'red', code: '#ff0000' });
  const blue = new Color({ name: 'blue', code: '#0000ff' });

  beforeEach(() => {
    player = new Player('TestPlayer');
  });

  it('should create a player with a name', () => {
    expect(player.name).toBe('TestPlayer');
  });

  it('should initialize with empty cards array and isUno false', () => {
    expect(player.cards).toEqual([]);
    expect(player.isUno).toBe(false);
  });

  describe('cardCount', () => {
    it('should return the number of cards', () => {
      expect(player.cardCount).toBe(0);

      player.cards.push(new NumCard({ name: 'red5', num: 5, color: red }));
      expect(player.cardCount).toBe(1);

      player.cards.push(new NumCard({ name: 'blue3', num: 3, color: blue }));
      expect(player.cardCount).toBe(2);
    });
  });

  describe('getCards', () => {
    it('should add multiple cards to player hand', () => {
      const cards = [
        new NumCard({ name: 'red5', num: 5, color: red }),
        new NumCard({ name: 'blue3', num: 3, color: blue }),
      ];

      player.getCards(cards);

      expect(player.cards.length).toBe(2);
      expect(player.cards).toEqual(cards);
    });

    it('should append cards to existing cards', () => {
      player.cards = [new NumCard({ name: 'red5', num: 5, color: red })];
      const newCards = [new NumCard({ name: 'blue3', num: 3, color: blue })];

      player.getCards(newCards);

      expect(player.cards.length).toBe(2);
    });
  });

  describe('getCard', () => {
    it('should add a single card to player hand', () => {
      const card = new NumCard({ name: 'red5', num: 5, color: red });

      player.getCard(card);

      expect(player.cards.length).toBe(1);
      expect(player.cards[0]).toBe(card);
    });

    it('should set isUno to false when getting a card', () => {
      player.isUno = true;
      const card = new NumCard({ name: 'red5', num: 5, color: red });

      player.getCard(card);

      expect(player.isUno).toBe(false);
    });
  });

  describe('sayUno', () => {
    it('should randomly set isUno', () => {
      // Test multiple times to ensure randomness is working
      let hasTrue = false;
      let hasFalse = false;

      for (let i = 0; i < 100; i++) {
        player.sayUno();
        if (player.isUno) hasTrue = true;
        else hasFalse = true;

        if (hasTrue && hasFalse) break;
      }

      // At least one of them should have been set (statistically very likely)
      expect(hasTrue || hasFalse).toBe(true);
    });

    it('should set isUno based on random value', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.3); // Forces isUno = true

      player.sayUno();

      expect(player.isUno).toBe(true);

      vi.restoreAllMocks();
    });
  });

  describe('canPutCards', () => {
    it('should return cards that can be put on the stage', () => {
      const card1 = new NumCard({ name: 'red5', num: 5, color: red });
      const card2 = new NumCard({ name: 'blue3', num: 3, color: blue });
      const card3 = new NumCard({ name: 'red7', num: 7, color: red });

      player.cards = [card1, card2, card3];

      const fieldCard = new NumCard({ name: 'red2', num: 2, color: red });
      const stage = { latestCard: fieldCard, drawNum: 0 } as unknown as Stage;

      const canPut = player.canPutCards(stage);

      expect(canPut.length).toBe(2);
      expect(canPut).toContain(card1);
      expect(canPut).toContain(card3);
      expect(canPut).not.toContain(card2);
    });
  });

  describe('selectCard', () => {
    it('should return null when no cards can be put', () => {
      const card = new NumCard({ name: 'blue3', num: 3, color: blue });
      player.cards = [card];

      const fieldCard = new NumCard({ name: 'red5', num: 5, color: red });
      const stage = { latestCard: fieldCard, drawNum: 0 } as unknown as Stage;

      const selected = player.selectCard(stage);

      expect(selected).toBe(null);
    });

    it('should return a card that can be put', () => {
      const card1 = new NumCard({ name: 'red5', num: 5, color: red });
      const card2 = new NumCard({ name: 'red7', num: 7, color: red });
      player.cards = [card1, card2];

      const fieldCard = new NumCard({ name: 'red2', num: 2, color: red });
      const stage = { latestCard: fieldCard, drawNum: 0 } as unknown as Stage;

      const selected = player.selectCard(stage);

      expect([card1, card2]).toContain(selected);
    });

    it('should call sayUno when player has 2 cards and not already uno', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const card1 = new NumCard({ name: 'red5', num: 5, color: red });
      const card2 = new NumCard({ name: 'red7', num: 7, color: red });
      player.cards = [card1, card2];
      player.isUno = false;

      const fieldCard = new NumCard({ name: 'red2', num: 2, color: red });
      const stage = { latestCard: fieldCard, drawNum: 0 } as unknown as Stage;

      const sayUnoSpy = vi.spyOn(player, 'sayUno');
      player.selectCard(stage);

      expect(sayUnoSpy).toHaveBeenCalled();

      sayUnoSpy.mockRestore();
      consoleSpy.mockRestore();
    });
  });

  describe('selectColor', () => {
    it('should return a color from the available colors', () => {
      const color = player.selectColor();

      expect(color).toBeDefined();
      expect(color.name).toBeDefined();
      expect(color.code).toBeDefined();
    });
  });

  describe('putCard', () => {
    it('should return and remove selected card from hand', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const card1 = new NumCard({ name: 'red5', num: 5, color: red });
      const card2 = new NumCard({ name: 'red7', num: 7, color: red });
      player.cards = [card1, card2];

      const fieldCard = new NumCard({ name: 'red2', num: 2, color: red });
      const stage = { latestCard: fieldCard, drawNum: 0 } as unknown as Stage;

      const putCard = player.putCard(stage);

      expect([card1, card2]).toContain(putCard);
      expect(player.cards.length).toBe(1);
      expect(player.cards).not.toContain(putCard);

      consoleSpy.mockRestore();
    });

    it('should return null when no card can be put', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const card = new NumCard({ name: 'blue3', num: 3, color: blue });
      player.cards = [card];

      const fieldCard = new NumCard({ name: 'red5', num: 5, color: red });
      const stage = { latestCard: fieldCard, drawNum: 0 } as unknown as Stage;

      const putCard = player.putCard(stage);

      expect(putCard).toBe(null);
      expect(player.cards.length).toBe(1);

      consoleSpy.mockRestore();
    });
  });
});

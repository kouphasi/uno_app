import cardCreators from '../../constants/card_creators.js';
import NumCard from '../../model/num_card.js';
import SpecialCard from '../../model/special_card.js';

// Mock console.log to avoid cluttering test output
global.console.log = jest.fn();

describe('cardCreators', () => {
  test('should be an array of functions', () => {
    expect(Array.isArray(cardCreators)).toBe(true);
    expect(cardCreators.length).toBeGreaterThan(0);
    cardCreators.forEach(creator => {
      expect(typeof creator).toBe('function');
    });
  });

  test('should create cards when called', () => {
    const card = cardCreators[0]();
    expect(card).toBeDefined();
    expect(card.name).toBeDefined();
  });

  test('should contain number cards (0-9 for each color)', () => {
    const cards = cardCreators.map(creator => creator());
    const numCards = cards.filter(card => card instanceof NumCard);

    // 4 colors × 10 numbers = 40 number cards
    expect(numCards.length).toBe(40);
  });

  test('should contain special cards', () => {
    const cards = cardCreators.map(creator => creator());
    const specialCards = cards.filter(card => card instanceof SpecialCard);

    // 4 colors × (reverse + skip + draw2) + 2 wilds = 12 + 2 = 14 special cards
    expect(specialCards.length).toBe(14);
  });

  test('should contain reverse cards for each color', () => {
    const cards = cardCreators.map(creator => creator());
    const reverseCards = cards.filter(card => card instanceof SpecialCard && card.symbol === 'reverse');

    expect(reverseCards.length).toBe(4);
  });

  test('should contain skip cards for each color', () => {
    const cards = cardCreators.map(creator => creator());
    const skipCards = cards.filter(card => card instanceof SpecialCard && card.symbol === 'skip');

    expect(skipCards.length).toBe(4);
  });

  test('should contain draw2 cards for each color', () => {
    const cards = cardCreators.map(creator => creator());
    const draw2Cards = cards.filter(card => card instanceof SpecialCard && card.symbol === 'draw2');

    expect(draw2Cards.length).toBe(4);
  });

  test('should contain wild cards', () => {
    const cards = cardCreators.map(creator => creator());
    const wildCards = cards.filter(card => card instanceof SpecialCard && card.symbol === 'wild');

    expect(wildCards.length).toBe(1);
  });

  test('should contain draw4 cards', () => {
    const cards = cardCreators.map(creator => creator());
    const draw4Cards = cards.filter(card => card instanceof SpecialCard && card.symbol === 'draw4');

    expect(draw4Cards.length).toBe(1);
  });

  test('should have total of 54 card creators', () => {
    // 40 number cards + 14 special cards = 54 total
    expect(cardCreators.length).toBe(54);
  });

  test('each creator should create a new instance', () => {
    const creator = cardCreators[0];
    const card1 = creator();
    const card2 = creator();

    expect(card1).not.toBe(card2);
    expect(card1.name).toBe(card2.name);
  });
});

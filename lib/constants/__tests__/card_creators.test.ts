import { describe, it, expect } from 'vitest';
import cardCreators from '../card_creators.js';
import NumCard from '../../model/num_card.js';
import SpecialCard from '../../model/special_card.js';
import Card from '../../model/card.js';

describe('cardCreators', () => {
  it('should export an array of creator functions', () => {
    expect(Array.isArray(cardCreators)).toBe(true);
    expect(cardCreators.length).toBeGreaterThan(0);
  });

  it('should have 54 total card creators', () => {
    // Number cards: 4 colors * 10 numbers (0-9) = 40
    // Special cards: 14 (from special_card_creators)
    // Total: 40 + 14 = 54
    expect(cardCreators.length).toBe(54);
  });

  it('should create Card instances when called', () => {
    cardCreators.forEach(creator => {
      const card = creator();
      expect(card).toBeInstanceOf(Card);
    });
  });

  describe('number cards', () => {
    it('should create 40 number cards', () => {
      const numCards = cardCreators.filter(creator => {
        const card = creator();
        return card instanceof NumCard;
      });

      expect(numCards.length).toBe(40);
    });

    it('should create number cards for all 4 colors', () => {
      const numCards = cardCreators
        .map(creator => creator())
        .filter(card => card instanceof NumCard);

      const colors = new Set(numCards.map(card => (card as NumCard).color.name));
      expect(colors.size).toBe(4);
      expect(colors.has('red')).toBe(true);
      expect(colors.has('green')).toBe(true);
      expect(colors.has('blue')).toBe(true);
      expect(colors.has('yellow')).toBe(true);
    });

    it('should create number cards for all numbers 0-9', () => {
      const numCards = cardCreators
        .map(creator => creator())
        .filter(card => card instanceof NumCard);

      const numbers = new Set(numCards.map(card => (card as NumCard).num));
      expect(numbers.size).toBe(10);

      for (let i = 0; i < 10; i++) {
        expect(numbers.has(i)).toBe(true);
      }
    });

    it('should create 10 cards per color', () => {
      const numCards = cardCreators
        .map(creator => creator())
        .filter(card => card instanceof NumCard);

      const colorCounts: Record<string, number> = {};
      numCards.forEach(card => {
        const colorName = (card as NumCard).color.name;
        colorCounts[colorName] = (colorCounts[colorName] || 0) + 1;
      });

      expect(colorCounts.red).toBe(10);
      expect(colorCounts.green).toBe(10);
      expect(colorCounts.blue).toBe(10);
      expect(colorCounts.yellow).toBe(10);
    });
  });

  describe('special cards', () => {
    it('should create 14 special cards', () => {
      const specialCards = cardCreators.filter(creator => {
        const card = creator();
        return card instanceof SpecialCard;
      });

      expect(specialCards.length).toBe(14);
    });

    it('should include reverse cards', () => {
      const reverseCards = cardCreators
        .map(creator => creator())
        .filter(card => card instanceof SpecialCard && (card as SpecialCard).symbol === 'reverse');

      expect(reverseCards.length).toBe(4);
    });

    it('should include skip cards', () => {
      const skipCards = cardCreators
        .map(creator => creator())
        .filter(card => card instanceof SpecialCard && (card as SpecialCard).symbol === 'skip');

      expect(skipCards.length).toBe(4);
    });

    it('should include draw2 cards', () => {
      const draw2Cards = cardCreators
        .map(creator => creator())
        .filter(card => card instanceof SpecialCard && (card as SpecialCard).symbol === 'draw2');

      expect(draw2Cards.length).toBe(4);
    });

    it('should include wild card', () => {
      const wildCards = cardCreators
        .map(creator => creator())
        .filter(card => card instanceof SpecialCard && (card as SpecialCard).symbol === 'wild');

      expect(wildCards.length).toBe(1);
    });

    it('should include draw4 card', () => {
      const draw4Cards = cardCreators
        .map(creator => creator())
        .filter(card => card instanceof SpecialCard && (card as SpecialCard).symbol === 'draw4');

      expect(draw4Cards.length).toBe(1);
    });
  });

  it('should create new instances each time creator is called', () => {
    const creator = cardCreators[0];
    const card1 = creator();
    const card2 = creator();

    expect(card1).not.toBe(card2);
    expect(card1.name).toBe(card2.name);
  });
});

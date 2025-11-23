import { describe, it, expect } from 'vitest';
import specialCardCreators from '../special_card_creators.js';
import SpecialCard from '../../model/special_card.js';

describe('specialCardCreators', () => {
  it('should export an array of creator functions', () => {
    expect(Array.isArray(specialCardCreators)).toBe(true);
    expect(specialCardCreators.length).toBeGreaterThan(0);
  });

  it('should have 14 special card creators', () => {
    // 4 colors * (reverse + skip + draw2) + 2 wilds (wild + draw4)
    // = 4 * 3 + 2 = 14
    expect(specialCardCreators.length).toBe(14);
  });

  it('should create SpecialCard instances when called', () => {
    specialCardCreators.forEach(creator => {
      const card = creator();
      expect(card).toBeInstanceOf(SpecialCard);
    });
  });

  describe('reverse cards', () => {
    it('should create 4 reverse cards (one per color)', () => {
      const reverseCreators = specialCardCreators.filter((creator, index) => {
        const card = creator();
        return card.symbol === 'reverse';
      });

      expect(reverseCreators.length).toBe(4);
    });

    it('should have correct properties for reverse cards', () => {
      const reverseCard = specialCardCreators.find(creator => {
        const card = creator();
        return card.symbol === 'reverse';
      })!();

      expect(reverseCard.symbol).toBe('reverse');
      expect(reverseCard.step).toBe(2);
      expect(reverseCard.drawNum).toBe(0);
      expect(reverseCard.color).toBeDefined();
      expect(reverseCard.effect).toBeInstanceOf(Function);
    });
  });

  describe('skip cards', () => {
    it('should create 4 skip cards (one per color)', () => {
      const skipCreators = specialCardCreators.filter(creator => {
        const card = creator();
        return card.symbol === 'skip';
      });

      expect(skipCreators.length).toBe(4);
    });

    it('should have correct properties for skip cards', () => {
      const skipCard = specialCardCreators.find(creator => {
        const card = creator();
        return card.symbol === 'skip';
      })!();

      expect(skipCard.symbol).toBe('skip');
      expect(skipCard.step).toBe(1);
      expect(skipCard.drawNum).toBe(0);
      expect(skipCard.color).toBeDefined();
    });
  });

  describe('draw2 cards', () => {
    it('should create 4 draw2 cards (one per color)', () => {
      const draw2Creators = specialCardCreators.filter(creator => {
        const card = creator();
        return card.symbol === 'draw2';
      });

      expect(draw2Creators.length).toBe(4);
    });

    it('should have correct properties for draw2 cards', () => {
      const draw2Card = specialCardCreators.find(creator => {
        const card = creator();
        return card.symbol === 'draw2';
      })!();

      expect(draw2Card.symbol).toBe('draw2');
      expect(draw2Card.step).toBe(1);
      expect(draw2Card.drawNum).toBe(2);
      expect(draw2Card.color).toBeDefined();
    });
  });

  describe('wild cards', () => {
    it('should create 1 wild card', () => {
      const wildCreators = specialCardCreators.filter(creator => {
        const card = creator();
        return card.symbol === 'wild';
      });

      expect(wildCreators.length).toBe(1);
    });

    it('should have correct properties for wild card', () => {
      const wildCard = specialCardCreators.find(creator => {
        const card = creator();
        return card.symbol === 'wild';
      })!();

      expect(wildCard.symbol).toBe('wild');
      expect(wildCard.step).toBe(1);
      expect(wildCard.drawNum).toBe(0);
      expect(wildCard.color).toBe(null);
      expect(wildCard.effect).toBeInstanceOf(Function);
    });
  });

  describe('draw4 cards', () => {
    it('should create 1 draw4 card', () => {
      const draw4Creators = specialCardCreators.filter(creator => {
        const card = creator();
        return card.symbol === 'draw4';
      });

      expect(draw4Creators.length).toBe(1);
    });

    it('should have correct properties for draw4 card', () => {
      const draw4Card = specialCardCreators.find(creator => {
        const card = creator();
        return card.symbol === 'draw4';
      })!();

      expect(draw4Card.symbol).toBe('draw4');
      expect(draw4Card.step).toBe(1);
      expect(draw4Card.drawNum).toBe(4);
      expect(draw4Card.color).toBe(null);
      expect(draw4Card.effect).toBeInstanceOf(Function);
    });
  });
});

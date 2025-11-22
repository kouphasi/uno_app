import { describe, it, expect } from 'vitest';
import NumCard from '../num_card.js';
import Color from '../color.js';

describe('NumCard', () => {
  const red = new Color({ name: 'red', code: '#ff0000' });
  const blue = new Color({ name: 'blue', code: '#0000ff' });

  it('should create a number card with name, num, and color', () => {
    const card = new NumCard({ name: 'red5', num: 5, color: red });

    expect(card.name).toBe('red5');
    expect(card.num).toBe(5);
    expect(card.color).toBe(red);
  });

  it('should have static min_num and max_num properties', () => {
    expect(NumCard.min_num).toBe(0);
    expect(NumCard.max_num).toBe(9);
  });

  describe('canPut', () => {
    it('should return true when field card has same number', () => {
      const card = new NumCard({ name: 'red5', num: 5, color: red });
      const fieldCard = new NumCard({ name: 'blue5', num: 5, color: blue });
      const stage = { latestCard: fieldCard, drawNum: 0 };

      expect(card.canPut(stage)).toBe(true);
    });

    it('should return true when field card has same color', () => {
      const card = new NumCard({ name: 'red5', num: 5, color: red });
      const fieldCard = new NumCard({ name: 'red3', num: 3, color: red });
      const stage = { latestCard: fieldCard, drawNum: 0 };

      expect(card.canPut(stage)).toBe(true);
    });

    it('should return true when field card has no color (wild card)', () => {
      const card = new NumCard({ name: 'red5', num: 5, color: red });
      const fieldCard = { color: null, num: null };
      const stage = { latestCard: fieldCard, drawNum: 0 };

      expect(card.canPut(stage)).toBe(true);
    });

    it('should return false when field card has different number and color', () => {
      const card = new NumCard({ name: 'red5', num: 5, color: red });
      const fieldCard = new NumCard({ name: 'blue3', num: 3, color: blue });
      const stage = { latestCard: fieldCard, drawNum: 0 };

      expect(card.canPut(stage)).toBe(false);
    });

    it('should return false when drawNum > 0', () => {
      const card = new NumCard({ name: 'red5', num: 5, color: red });
      const fieldCard = new NumCard({ name: 'red3', num: 3, color: red });
      const stage = { latestCard: fieldCard, drawNum: 2 };

      expect(card.canPut(stage)).toBe(false);
    });
  });

  describe('handleCard', () => {
    it('should set color and num on stage', () => {
      const card = new NumCard({ name: 'red5', num: 5, color: red });
      const stage = {
        setColor: (color) => { stage.color = color; },
        setNum: (num) => { stage.num = num; },
      };

      card.handleCard(stage);

      expect(stage.color).toBe(red);
      expect(stage.num).toBe(5);
    });
  });
});

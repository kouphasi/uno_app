import { describe, it, expect, vi } from 'vitest';
import SpecialCard from '../special_card.js';
import Color from '../color.js';

describe('SpecialCard', () => {
  const red = new Color({ name: 'red', code: '#ff0000' });
  const blue = new Color({ name: 'blue', code: '#0000ff' });

  it('should create a special card with all properties', () => {
    const effect = vi.fn();
    const card = new SpecialCard({
      name: 'redskip',
      symbol: 'skip',
      step: 1,
      drawNum: 0,
      color: red,
      effect,
    });

    expect(card.name).toBe('redskip');
    expect(card.symbol).toBe('skip');
    expect(card.step).toBe(1);
    expect(card.drawNum).toBe(0);
    expect(card.color).toBe(red);
    expect(card.effect).toBe(effect);
  });

  it('should have default effect if not provided', () => {
    const card = new SpecialCard({
      name: 'redskip',
      symbol: 'skip',
      step: 1,
      drawNum: 0,
      color: red,
    });

    expect(typeof card.effect).toBe('function');
  });

  describe('canPut', () => {
    it('should return true when field card has same color', () => {
      const card = new SpecialCard({
        name: 'redskip',
        symbol: 'skip',
        step: 1,
        drawNum: 0,
        color: red,
      });
      const fieldCard = new SpecialCard({
        name: 'redreverse',
        symbol: 'reverse',
        step: 2,
        drawNum: 0,
        color: red,
      });
      const stage = { latestCard: fieldCard, drawNum: 0 };

      expect(card.canPut(stage)).toBe(true);
    });

    it('should return true when field card has same symbol', () => {
      const card = new SpecialCard({
        name: 'redskip',
        symbol: 'skip',
        step: 1,
        drawNum: 0,
        color: red,
      });
      const fieldCard = new SpecialCard({
        name: 'blueskip',
        symbol: 'skip',
        step: 1,
        drawNum: 0,
        color: blue,
      });
      const stage = { latestCard: fieldCard, drawNum: 0 };

      expect(card.canPut(stage)).toBe(true);
    });

    it('should return true when card is wild (color is null)', () => {
      const card = new SpecialCard({
        name: 'wild',
        symbol: 'wild',
        step: 1,
        drawNum: 0,
        color: null,
      });
      const fieldCard = new SpecialCard({
        name: 'redskip',
        symbol: 'skip',
        step: 1,
        drawNum: 0,
        color: red,
      });
      const stage = { latestCard: fieldCard, drawNum: 0 };

      expect(card.canPut(stage)).toBe(true);
    });

    it('should return false when different color and symbol', () => {
      const card = new SpecialCard({
        name: 'redskip',
        symbol: 'skip',
        step: 1,
        drawNum: 0,
        color: red,
      });
      const fieldCard = new SpecialCard({
        name: 'bluereverse',
        symbol: 'reverse',
        step: 2,
        drawNum: 0,
        color: blue,
      });
      const stage = { latestCard: fieldCard, drawNum: 0 };

      expect(card.canPut(stage)).toBe(false);
    });

    it('should return true when drawNum > 0 and same symbol', () => {
      const card = new SpecialCard({
        name: 'reddraw2',
        symbol: 'draw2',
        step: 1,
        drawNum: 2,
        color: red,
      });
      const fieldCard = new SpecialCard({
        name: 'bluedraw2',
        symbol: 'draw2',
        step: 1,
        drawNum: 2,
        color: blue,
      });
      const stage = { latestCard: fieldCard, drawNum: 2 };

      expect(card.canPut(stage)).toBe(true);
    });

    it('should return false when drawNum > 0 and different symbol', () => {
      const card = new SpecialCard({
        name: 'redskip',
        symbol: 'skip',
        step: 1,
        drawNum: 0,
        color: red,
      });
      const fieldCard = new SpecialCard({
        name: 'reddraw2',
        symbol: 'draw2',
        step: 1,
        drawNum: 2,
        color: red,
      });
      const stage = { latestCard: fieldCard, drawNum: 2 };

      expect(card.canPut(stage)).toBe(false);
    });
  });

  describe('handleCard', () => {
    it('should set color, num, drawNum and call effect', () => {
      const effectMock = vi.fn();
      const card = new SpecialCard({
        name: 'reddraw2',
        symbol: 'draw2',
        step: 1,
        drawNum: 2,
        color: red,
        effect: effectMock,
      });
      const stage = {
        drawNum: 0,
        setColor: (color) => { stage.color = color; },
        setNum: (num) => { stage.num = num; },
        addDrawNum: (num) => { stage.drawNum += num; },
      };

      card.handleCard(stage);

      expect(stage.color).toBe(red);
      expect(stage.num).toBe(null);
      expect(stage.drawNum).toBe(2);
      expect(effectMock).toHaveBeenCalledWith(stage);
    });

    it('should not modify color when card is wild', () => {
      const effectMock = vi.fn();
      const card = new SpecialCard({
        name: 'wild',
        symbol: 'wild',
        step: 1,
        drawNum: 0,
        color: null,
        effect: effectMock,
      });
      const stage = {
        drawNum: 0,
        setColor: (color) => { stage.color = color; },
        setNum: (num) => { stage.num = num; },
        addDrawNum: (num) => { stage.drawNum += num; },
      };

      card.handleCard(stage);

      expect(stage.color).toBe(null);
      expect(stage.num).toBe(null);
      expect(stage.drawNum).toBe(0);
      expect(effectMock).toHaveBeenCalledWith(stage);
    });
  });
});

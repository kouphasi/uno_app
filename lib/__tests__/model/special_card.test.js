import SpecialCard from '../../model/special_card.js';
import NumCard from '../../model/num_card.js';
import Color from '../../model/color.js';

describe('SpecialCard', () => {
  let redColor, blueColor;

  beforeEach(() => {
    redColor = new Color({ name: 'red', code: '#ff0000' });
    blueColor = new Color({ name: 'blue', code: '#0000ff' });
  });

  describe('constructor', () => {
    test('should create a special card with all properties', () => {
      const mockEffect = jest.fn();
      const card = new SpecialCard({
        name: 'redskip',
        symbol: 'skip',
        step: 1,
        drawNum: 0,
        color: redColor,
        effect: mockEffect,
      });

      expect(card.name).toBe('redskip');
      expect(card.symbol).toBe('skip');
      expect(card.step).toBe(1);
      expect(card.drawNum).toBe(0);
      expect(card.color).toBe(redColor);
      expect(card.effect).toBe(mockEffect);
    });

    test('should create a special card with default effect', () => {
      const card = new SpecialCard({
        name: 'redskip',
        symbol: 'skip',
        step: 1,
        drawNum: 0,
        color: redColor,
      });

      expect(card.effect).toBeInstanceOf(Function);
    });
  });

  describe('canPut', () => {
    test('should be able to put card with the same color', () => {
      const card = new SpecialCard({
        name: 'redskip',
        symbol: 'skip',
        step: 1,
        drawNum: 0,
        color: redColor,
      });

      const fieldCard = new NumCard({ name: 'red5', num: 5, color: redColor });

      const mockStage = {
        latestCard: fieldCard,
        drawNum: 0,
      };

      expect(card.canPut(mockStage)).toBe(true);
    });

    test('should be able to put card with the same symbol', () => {
      const card = new SpecialCard({
        name: 'redskip',
        symbol: 'skip',
        step: 1,
        drawNum: 0,
        color: redColor,
      });

      const fieldCard = new SpecialCard({
        name: 'blueskip',
        symbol: 'skip',
        step: 1,
        drawNum: 0,
        color: blueColor,
      });

      const mockStage = {
        latestCard: fieldCard,
        drawNum: 0,
      };

      expect(card.canPut(mockStage)).toBe(true);
    });

    test('should not be able to put card with different color and symbol', () => {
      const card = new SpecialCard({
        name: 'redskip',
        symbol: 'skip',
        step: 1,
        drawNum: 0,
        color: redColor,
      });

      const fieldCard = new SpecialCard({
        name: 'bluereverse',
        symbol: 'reverse',
        step: 2,
        drawNum: 0,
        color: blueColor,
      });

      const mockStage = {
        latestCard: fieldCard,
        drawNum: 0,
      };

      expect(card.canPut(mockStage)).toBe(false);
    });

    test('should be able to put wild card (no color) on any card', () => {
      const wildCard = new SpecialCard({
        name: 'wild',
        symbol: 'wild',
        step: 1,
        drawNum: 0,
        color: null,
      });

      const fieldCard = new NumCard({ name: 'red5', num: 5, color: redColor });

      const mockStage = {
        latestCard: fieldCard,
        drawNum: 0,
      };

      expect(wildCard.canPut(mockStage)).toBe(true);
    });

    test('should only be able to put card with same symbol when drawNum > 0', () => {
      const skipCard = new SpecialCard({
        name: 'redskip',
        symbol: 'skip',
        step: 1,
        drawNum: 0,
        color: redColor,
      });

      const draw2Card = new SpecialCard({
        name: 'bluedraw2',
        symbol: 'draw2',
        step: 1,
        drawNum: 2,
        color: blueColor,
      });

      const mockStage = {
        latestCard: draw2Card,
        drawNum: 2,
      };

      expect(skipCard.canPut(mockStage)).toBe(false);
    });

    test('should be able to put draw2 on draw2 when drawNum > 0', () => {
      const draw2Card1 = new SpecialCard({
        name: 'reddraw2',
        symbol: 'draw2',
        step: 1,
        drawNum: 2,
        color: redColor,
      });

      const draw2Card2 = new SpecialCard({
        name: 'bluedraw2',
        symbol: 'draw2',
        step: 1,
        drawNum: 2,
        color: blueColor,
      });

      const mockStage = {
        latestCard: draw2Card2,
        drawNum: 2,
      };

      expect(draw2Card1.canPut(mockStage)).toBe(true);
    });
  });

  describe('handleCard', () => {
    test('should set stage color, num, and drawNum', () => {
      const card = new SpecialCard({
        name: 'reddraw2',
        symbol: 'draw2',
        step: 1,
        drawNum: 2,
        color: redColor,
        effect: jest.fn(),
      });

      const mockStage = {
        setColor: jest.fn(),
        setNum: jest.fn(),
        addDrawNum: jest.fn(),
      };

      card.handleCard(mockStage);

      expect(mockStage.setColor).toHaveBeenCalledWith(redColor);
      expect(mockStage.setNum).toHaveBeenCalledWith(null);
      expect(mockStage.addDrawNum).toHaveBeenCalledWith(2);
      expect(card.effect).toHaveBeenCalledWith(mockStage);
    });

    test('should call effect function', () => {
      const mockEffect = jest.fn();
      const card = new SpecialCard({
        name: 'redreverse',
        symbol: 'reverse',
        step: 2,
        drawNum: 0,
        color: redColor,
        effect: mockEffect,
      });

      const mockStage = {
        setColor: jest.fn(),
        setNum: jest.fn(),
        addDrawNum: jest.fn(),
      };

      card.handleCard(mockStage);

      expect(mockEffect).toHaveBeenCalledWith(mockStage);
    });
  });
});

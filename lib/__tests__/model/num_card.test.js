import NumCard from '../../model/num_card.js';
import Color from '../../model/color.js';

describe('NumCard', () => {
  let redColor, blueColor;

  beforeEach(() => {
    redColor = new Color({ name: 'red', code: '#ff0000' });
    blueColor = new Color({ name: 'blue', code: '#0000ff' });
  });

  describe('constructor', () => {
    test('should create a number card with name, num, and color', () => {
      const card = new NumCard({ name: 'red5', num: 5, color: redColor });
      expect(card.name).toBe('red5');
      expect(card.num).toBe(5);
      expect(card.color).toBe(redColor);
      expect(card.step).toBe(1);
      expect(card.drawNum).toBe(0);
    });
  });

  describe('canPut', () => {
    test('should be able to put card with the same number', () => {
      const card = new NumCard({ name: 'red5', num: 5, color: redColor });
      const fieldCard = new NumCard({ name: 'blue5', num: 5, color: blueColor });

      const mockStage = {
        latestCard: fieldCard,
        drawNum: 0,
      };

      expect(card.canPut(mockStage)).toBe(true);
    });

    test('should be able to put card with the same color', () => {
      const card = new NumCard({ name: 'red5', num: 5, color: redColor });
      const fieldCard = new NumCard({ name: 'red3', num: 3, color: redColor });

      const mockStage = {
        latestCard: fieldCard,
        drawNum: 0,
      };

      expect(card.canPut(mockStage)).toBe(true);
    });

    test('should not be able to put card with different number and color', () => {
      const card = new NumCard({ name: 'red5', num: 5, color: redColor });
      const fieldCard = new NumCard({ name: 'blue3', num: 3, color: blueColor });

      const mockStage = {
        latestCard: fieldCard,
        drawNum: 0,
      };

      expect(card.canPut(mockStage)).toBe(false);
    });

    test('should not be able to put when drawNum is greater than 0', () => {
      const card = new NumCard({ name: 'red5', num: 5, color: redColor });
      const fieldCard = new NumCard({ name: 'red3', num: 3, color: redColor });

      const mockStage = {
        latestCard: fieldCard,
        drawNum: 2,
      };

      expect(card.canPut(mockStage)).toBe(false);
    });

    test('should be able to put when field card has no color (wild card)', () => {
      const card = new NumCard({ name: 'red5', num: 5, color: redColor });
      const mockFieldCard = {
        color: null,
        num: 3,
      };

      const mockStage = {
        latestCard: mockFieldCard,
        drawNum: 0,
      };

      expect(card.canPut(mockStage)).toBe(true);
    });
  });

  describe('handleCard', () => {
    test('should set stage color and num', () => {
      const card = new NumCard({ name: 'red5', num: 5, color: redColor });

      const mockStage = {
        setColor: jest.fn(),
        setNum: jest.fn(),
      };

      card.handleCard(mockStage);

      expect(mockStage.setColor).toHaveBeenCalledWith(redColor);
      expect(mockStage.setNum).toHaveBeenCalledWith(5);
    });
  });

  describe('static properties', () => {
    test('should have min_num of 0', () => {
      expect(NumCard.min_num).toBe(0);
    });

    test('should have max_num of 9', () => {
      expect(NumCard.max_num).toBe(9);
    });
  });
});

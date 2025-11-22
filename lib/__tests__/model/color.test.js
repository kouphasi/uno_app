import Color from '../../model/color.js';

describe('Color', () => {
  describe('constructor', () => {
    test('should create a color with name and code', () => {
      const color = new Color({ name: 'red', code: '#ff0000' });
      expect(color.name).toBe('red');
      expect(color.code).toBe('#ff0000');
    });
  });

  describe('eq', () => {
    test('should return true for colors with the same name', () => {
      const color1 = new Color({ name: 'red', code: '#ff0000' });
      const color2 = new Color({ name: 'red', code: '#ff0000' });
      expect(color1.eq(color2)).toBe(true);
    });

    test('should return false for colors with different names', () => {
      const color1 = new Color({ name: 'red', code: '#ff0000' });
      const color2 = new Color({ name: 'blue', code: '#0000ff' });
      expect(color1.eq(color2)).toBe(false);
    });

    test('should return false when comparing with null', () => {
      const color = new Color({ name: 'red', code: '#ff0000' });
      expect(color.eq(null)).toBe(false);
    });

    test('should return false when comparing with undefined', () => {
      const color = new Color({ name: 'red', code: '#ff0000' });
      expect(color.eq(undefined)).toBe(false);
    });
  });
});

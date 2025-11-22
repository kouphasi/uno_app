import colors from '../../constants/colors.js';
import Color from '../../model/color.js';

// Mock console.log to avoid cluttering test output
global.console.log = jest.fn();

describe('colors constant', () => {
  test('should have 4 colors', () => {
    expect(colors).toHaveLength(4);
  });

  test('should contain all standard UNO colors', () => {
    const colorNames = colors.map(c => c.name);
    expect(colorNames).toContain('red');
    expect(colorNames).toContain('green');
    expect(colorNames).toContain('blue');
    expect(colorNames).toContain('yellow');
  });

  test('should have Color instances', () => {
    colors.forEach(color => {
      expect(color).toBeInstanceOf(Color);
    });
  });

  test('should have correct color codes', () => {
    const redColor = colors.find(c => c.name === 'red');
    const greenColor = colors.find(c => c.name === 'green');
    const blueColor = colors.find(c => c.name === 'blue');
    const yellowColor = colors.find(c => c.name === 'yellow');

    expect(redColor.code).toBe('#ff0000');
    expect(greenColor.code).toBe('#00ff00');
    expect(blueColor.code).toBe('#0000ff');
    expect(yellowColor.code).toBe('#ffff00');
  });
});

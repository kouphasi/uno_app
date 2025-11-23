import { describe, it, expect } from 'vitest';
import colors from '../colors';
import Color from '../../model/color';

describe('colors', () => {
  it('should export an array of 4 colors', () => {
    expect(Array.isArray(colors)).toBe(true);
    expect(colors.length).toBe(4);
  });

  it('should contain Color instances', () => {
    colors.forEach(color => {
      expect(color).toBeInstanceOf(Color);
    });
  });

  it('should contain red color', () => {
    const red = colors.find(c => c.name === 'red');
    expect(red).toBeDefined();
    expect(red!.code).toBe('#ff0000');
  });

  it('should contain green color', () => {
    const green = colors.find(c => c.name === 'green');
    expect(green).toBeDefined();
    expect(green!.code).toBe('#00ff00');
  });

  it('should contain blue color', () => {
    const blue = colors.find(c => c.name === 'blue');
    expect(blue).toBeDefined();
    expect(blue!.code).toBe('#0000ff');
  });

  it('should contain yellow color', () => {
    const yellow = colors.find(c => c.name === 'yellow');
    expect(yellow).toBeDefined();
    expect(yellow!.code).toBe('#ffff00');
  });

  it('should have unique color names', () => {
    const names = colors.map(c => c.name);
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(names.length);
  });
});

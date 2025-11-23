import { describe, it, expect } from 'vitest';
import Color from '../color.js';

describe('Color', () => {
  it('should create a color with name and code', () => {
    const color = new Color({ name: 'red', code: '#ff0000' });

    expect(color.name).toBe('red');
    expect(color.code).toBe('#ff0000');
  });

  it('should compare two colors with eq method', () => {
    const red1 = new Color({ name: 'red', code: '#ff0000' });
    const red2 = new Color({ name: 'red', code: '#ff0000' });
    const blue = new Color({ name: 'blue', code: '#0000ff' });

    expect(red1.eq(red2)).toBe(true);
    expect(red1.eq(blue)).toBe(false);
  });

  it('should handle null or undefined in eq method', () => {
    const red = new Color({ name: 'red', code: '#ff0000' });

    expect(red.eq(null)).toBe(false);
    expect(red.eq(undefined)).toBe(false);
  });

  it('should compare colors only by name, not by code', () => {
    const red1 = new Color({ name: 'red', code: '#ff0000' });
    const red2 = new Color({ name: 'red', code: '#ff1111' });

    expect(red1.eq(red2)).toBe(true);
  });
});

import { describe, it, expect, vi } from 'vitest';
import Card from '../card.js';

describe('Card', () => {
  it('should create a card with a name', () => {
    const card = new Card('test-card');

    expect(card.name).toBe('test-card');
  });

  it('should have default properties', () => {
    const card = new Card('test-card');

    expect(card.step).toBe(1);
    expect(card.drawNum).toBe(0);
  });

  it('should log error when canPut is called (abstract method)', () => {
    const card = new Card('test-card');
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    card.canPut();

    expect(consoleSpy).toHaveBeenCalledWith('canPut() must be implemented');
    consoleSpy.mockRestore();
  });

  it('should log error when handleCard is called (abstract method)', () => {
    const card = new Card('test-card');
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    card.handleCard();

    expect(consoleSpy).toHaveBeenCalledWith('handleCard() must be implemented');
    consoleSpy.mockRestore();
  });
});

import { describe, it, expect } from 'vitest';
import Card from '../card';
import Stage from '../stage';

// Create a concrete implementation of Card for testing
class TestCard extends Card {
  canPut(stage: Stage): boolean {
    return true;
  }

  handleCard(stage: Stage): void {
    // Test implementation
  }
}

describe('Card', () => {
  it('should create a card with a name', () => {
    const card = new TestCard('test-card');

    expect(card.name).toBe('test-card');
  });

  it('should have default properties', () => {
    const card = new TestCard('test-card');

    expect(card.step).toBe(1);
    expect(card.drawNum).toBe(0);
  });
});

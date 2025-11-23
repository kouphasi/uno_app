import { describe, it, expect, vi, beforeEach } from 'vitest';
import Stage from '../stage.js';
import Player from '../player.js';
import NumCard from '../num_card.js';
import Color from '../color.js';
import Card from '../card.js';

describe('Stage', () => {
  let stage: Stage;
  let player1: Player, player2: Player, player3: Player;
  const red = new Color({ name: 'red', code: '#ff0000' });
  const blue = new Color({ name: 'blue', code: '#0000ff' });

  beforeEach(() => {
    player1 = new Player('Player1');
    player2 = new Player('Player2');
    player3 = new Player('Player3');
    stage = new Stage([player1, player2, player3]);
  });

  it('should create a stage with players', () => {
    expect(stage.players).toEqual([player1, player2, player3]);
  });

  it('should initialize with default values', () => {
    expect(stage.turn).toBe(1);
    expect(stage.currentPlayerIndex).toBe(0);
    expect(stage.fieldCards).toEqual([]);
    expect(stage.isOpposite).toBe(false);
    expect(stage.finishedPlayers).toEqual([]);
    expect(stage.num).toBe(0);
    expect(stage.color).toBe(null);
  });

  describe('playablePlayers', () => {
    it('should return all players when none have finished', () => {
      expect(stage.playablePlayers).toEqual([player1, player2, player3]);
    });

    it('should exclude finished players', () => {
      stage.finishedPlayers = [player2];
      expect(stage.playablePlayers).toEqual([player1, player3]);
    });
  });

  describe('currentPlayer', () => {
    it('should return the player at current index', () => {
      expect(stage.currentPlayer).toBe(player1);
      stage.currentPlayerIndex = 1;
      expect(stage.currentPlayer).toBe(player2);
    });
  });

  describe('previousPlayer', () => {
    it('should return the previous player in normal direction', () => {
      stage.currentPlayerIndex = 1;
      expect(stage.previousPlayer).toBe(player1);
    });
  });

  describe('getPlayer', () => {
    it('should return player at given index', () => {
      expect(stage.getPlayer(0)).toBe(player1);
      expect(stage.getPlayer(1)).toBe(player2);
      expect(stage.getPlayer(2)).toBe(player3);
    });
  });

  describe('playerIndex', () => {
    it('should wrap around when index exceeds player count', () => {
      expect(stage.playerIndex(3)).toBe(0);
      expect(stage.playerIndex(4)).toBe(1);
    });

    it('should handle negative indices', () => {
      expect(stage.playerIndex(-1)).toBe(2);
      expect(stage.playerIndex(-2)).toBe(1);
    });
  });

  describe('latestCard', () => {
    it('should return the last card in fieldCards', () => {
      const card1 = new NumCard({ name: 'red5', num: 5, color: red });
      const card2 = new NumCard({ name: 'blue3', num: 3, color: blue });
      stage.fieldCards = [card1, card2];

      expect(stage.latestCard).toBe(card2);
    });
  });

  describe('finishPlayer', () => {
    it('should add player to finishedPlayers', () => {
      stage.finishPlayer(player1);
      expect(stage.finishedPlayers).toContain(player1);
    });
  });

  describe('nextPlayerIndex', () => {
    it('should increment player index in normal direction', () => {
      stage.currentPlayerIndex = 0;
      stage.nextPlayerIndex(1);
      expect(stage.currentPlayerIndex).toBe(1);
    });

    it('should decrement player index in opposite direction', () => {
      stage.isOpposite = true;
      stage.currentPlayerIndex = 1;
      stage.nextPlayerIndex(1);
      expect(stage.currentPlayerIndex).toBe(0);
    });

    it('should handle custom step values', () => {
      stage.currentPlayerIndex = 0;
      stage.nextPlayerIndex(2);
      expect(stage.currentPlayerIndex).toBe(2);
    });
  });

  describe('draw', () => {
    it('should return a card', () => {
      const card = stage.draw();
      expect(card).toBeDefined();
      expect(card.name).toBeDefined();
    });
  });

  describe('reverse', () => {
    it('should toggle isOpposite', () => {
      expect(stage.isOpposite).toBe(false);
      stage.reverse();
      expect(stage.isOpposite).toBe(true);
      stage.reverse();
      expect(stage.isOpposite).toBe(false);
    });
  });

  describe('setColor', () => {
    it('should set the color', () => {
      stage.setColor(red);
      expect(stage.color).toBe(red);
    });
  });

  describe('setNum', () => {
    it('should set the num', () => {
      stage.setNum(5);
      expect(stage.num).toBe(5);
    });
  });

  describe('addDrawNum', () => {
    it('should add to drawNum', () => {
      stage.drawNum = 0;
      stage.addDrawNum(2);
      expect(stage.drawNum).toBe(2);
      stage.addDrawNum(2);
      expect(stage.drawNum).toBe(4);
    });
  });

  describe('resetDrawNum', () => {
    it('should reset drawNum to 0', () => {
      stage.drawNum = 4;
      stage.resetDrawNum();
      expect(stage.drawNum).toBe(0);
    });
  });

  describe('putCard', () => {
    it('should add card to fieldCards and call handleCard', () => {
      const card = new NumCard({ name: 'red5', num: 5, color: red });
      const handleCardSpy = vi.spyOn(card, 'handleCard');

      stage.putCard(card);

      expect(stage.fieldCards).toContain(card);
      expect(handleCardSpy).toHaveBeenCalledWith(stage);
    });

    it('should do nothing when card is null', () => {
      const initialLength = stage.fieldCards.length;
      stage.putCard(null);
      expect(stage.fieldCards.length).toBe(initialLength);
    });
  });

  describe('nextTurn', () => {
    it('should increment turn counter', () => {
      expect(stage.turn).toBe(1);
      stage.nextTurn(null);
      expect(stage.turn).toBe(2);
    });

    it('should finish player if they have no cards', () => {
      player1.cards = [];
      stage.nextTurn(null);
      expect(stage.finishedPlayers).toContain(player1);
    });

    it('should advance to next player', () => {
      expect(stage.currentPlayerIndex).toBe(0);
      stage.nextTurn(null);
      expect(stage.currentPlayerIndex).toBe(1);
    });

    it('should use card step for advancement', () => {
      const card = { step: 2 } as Card;
      stage.currentPlayerIndex = 0;
      stage.nextTurn(card);
      expect(stage.currentPlayerIndex).toBe(2);
    });
  });

  describe('commitWithSingleChance', () => {
    it('should call player putCard method', () => {
      const putCardSpy = vi.spyOn(player1, 'putCard');
      stage.commitWithSingleChance();
      expect(putCardSpy).toHaveBeenCalledWith(stage);
    });
  });

  describe('commitWithDoubleChance', () => {
    it('should return card if player can put on first try', () => {
      const card = new NumCard({ name: 'red5', num: 5, color: red });
      vi.spyOn(player1, 'putCard').mockReturnValueOnce(card);

      const result = stage.commitWithDoubleChance();
      expect(result).toBe(card);
    });

    it('should draw and try again if first attempt fails', () => {
      const card = new NumCard({ name: 'red5', num: 5, color: red });
      const putCardSpy = vi.spyOn(player1, 'putCard')
        .mockReturnValueOnce(null)
        .mockReturnValueOnce(card);
      const getCardSpy = vi.spyOn(player1, 'getCard');

      const result = stage.commitWithDoubleChance();

      expect(getCardSpy).toHaveBeenCalled();
      expect(putCardSpy).toHaveBeenCalledTimes(2);
      expect(result).toBe(card);
    });
  });

  describe('drawFirstCard', () => {
    it('should return a number card', () => {
      // Mock draw to return a number card
      const numCard = new NumCard({ name: 'red5', num: 5, color: red });
      vi.spyOn(stage, 'draw').mockReturnValue(numCard);

      const card = stage.drawFirstCard();
      expect((card as any).num).toBeDefined();
      expect((card as any).num).not.toBe(null);
    });

    it('should keep drawing until a number card is found', () => {
      const specialCard = { num: null } as any as Card;
      const numCard = new NumCard({ name: 'red5', num: 5, color: red });

      const drawSpy = vi.spyOn(stage, 'draw')
        .mockReturnValueOnce(specialCard)
        .mockReturnValueOnce(specialCard)
        .mockReturnValueOnce(numCard);

      const card = stage.drawFirstCard();

      expect(drawSpy).toHaveBeenCalledTimes(3);
      expect(card).toBe(numCard);
    });
  });

  describe('shouldEndField', () => {
    it('should return false when multiple players remain', () => {
      expect(stage.shouldEndField()).toBe(false);
    });

    it('should return true when only one player remains', () => {
      stage.finishedPlayers = [player1, player2];
      expect(stage.shouldEndField()).toBe(true);
    });
  });

  describe('getResult', () => {
    it('should return winner and loser', () => {
      stage.finishedPlayers = [player1];
      const result = stage.getResult();

      expect(result.winner).toBe(player1);
      expect(result.looser).toBeDefined();
    });
  });
});

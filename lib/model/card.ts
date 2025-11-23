import Stage from './stage.js';
import Color from './color.js';

abstract class Card {
  name: string = '';
  step: number = 1;
  drawNum: number = 0;
  num?: number | null;
  color?: Color | null;
  symbol?: string;

  constructor(name: string) {
    this.name = name;
  }

  abstract canPut(stage: Stage): boolean;

  abstract handleCard(stage: Stage): void;
}

export default Card;

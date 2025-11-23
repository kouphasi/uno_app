import Card from './card.js';
import Color from './color.js';
import Stage from './stage.js';

class NumCard extends Card {
  static min_num: number = 0;
  static max_num: number = 9;
  num: number;
  color: Color;

  constructor({name, num, color}: {name: string; num: number; color: Color}) {
    super(name);
    this.num = num;
    this.color = color;
  }

  canPut(stage: Stage): boolean {
    const fieldCard = stage.latestCard;
    if(stage.drawNum > 0) return false;
    return fieldCard.color == null || fieldCard.num === this.num || fieldCard.color.eq(this.color);
  }

  handleCard(stage: Stage): void {
    stage.setColor(this.color);
    stage.setNum(this.num);
  }
}

export default NumCard;

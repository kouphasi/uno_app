import Card from './card.js';
import Color from './color.js';
import Stage from './stage.js';

class SpecialCard extends Card {
  symbol: string;
  color: Color | null;
  effect: (stage: Stage) => void;

  constructor({
    name,
    symbol,
    step,
    drawNum,
    color,
    effect = (stage: Stage) => {}
  }: {
    name: string;
    symbol: string;
    step: number;
    drawNum: number;
    color: Color | null;
    effect?: (stage: Stage) => void;
  }) {
    super(name);
    this.symbol = symbol;
    this.step = step;
    this.drawNum = drawNum;
    this.color = color;
    this.effect = effect;
  }

  canPut(stage: Stage): boolean {
    const fieldCard = stage.latestCard;
    if(stage.drawNum > 0) return this.symbol === fieldCard.symbol;
    return this.color === null || (fieldCard.color !== null && this.color.eq(fieldCard.color)) || this.symbol === fieldCard.symbol;
  }

  handleCard(stage: Stage): void {
    stage.setColor(this.color);
    stage.setNum(null);
    stage.addDrawNum(this.drawNum);
    this.effect(stage);
  }
}

export default SpecialCard;

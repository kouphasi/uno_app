import Card from './card.js';
class SpecialCard extends Card {
  constructor({
    name,
    symbol,
    step,
    drawNum,
    color,
    effect=(stage) => {}
  }) {
    super(name);
    this.symbol = symbol;
    this.step = step;
    this.drawNum = drawNum;
    this.color = color;
    this.effect = effect;
  }

  canPut(stage) {
    const fieldCard = stage.latestCard;
    if(stage.drawNum > 0) return this.symbol === fieldCard.symbol;
    return this.color === null || this.color.eq(fieldCard.color) || this.symbol === fieldCard.symbol;
  }

  handleCard(stage) {
    stage.setColor(this.color);
    stage.setNum(null);
    stage.addDrawNum(this.drawNum);
    this.effect(stage);
  }

  effect(stage) {}
}

export default SpecialCard;

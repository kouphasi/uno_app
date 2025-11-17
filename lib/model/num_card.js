import Card from './card.js';

class NumCard extends Card {
  static min_num = 0;
  static max_num = 9;
  constructor({name, num, color}) {
    super(name);
    this.num = num;
    this.color = color;
  }

  canPut(stage) {
    const fieldCard = stage.latestCard;
    if(stage.drawNum > 0) return false;
    return fieldCard.color == null || fieldCard.num === this.num || fieldCard.color.eq(this.color);
  }

  handleCard(stage) {
    stage.setColor(this.color);
    stage.setNum(this.num);
  }
}

export default NumCard;

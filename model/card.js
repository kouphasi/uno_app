class Card {
  name = '';
  step = 1;
  drawNum = 0;

  constructor(name) {
    this.name = name;
  }

  canPut() {
    console.error('canPut() must be implemented');
  }

  handleCard() {
    console.error('handleCard() must be implemented');
  }
}

export default Card;

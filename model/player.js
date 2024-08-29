import colors from '../constants/colors.js';

class Player {
  cards = [];
  isUno = false;
  constructor(name) {
    this.name = name;
  }

  get cardCount() {
    return this.cards.length;
  }

  getCards(cards) {
    this.cards = [...this.cards, ...cards];
  }

  getCard(card) {
    console.log(`${this.name} got ${card.name}`);
    this.cards.push(card);
    this.isUno = false;
  }

  sayUno() {
    this.isUno = Math.random() < 0.5;
    if(this.isUno) {
      console.log(`${this.name} said UNO!`);
    }
  }

  canPutCards(stage) {
    return this.cards.filter(card => card.canPut(stage));
  }

  selectCard(stage) {
    const cards = this.canPutCards(stage);
    if(cards.length === 0) {
      return null;
    }
    // Card Selection Logic
    if(this.cards.length === 2 && !this.isUno) { this.sayUno(); }
    return cards[Math.floor(Math.random() * cards.length)];
    // return Math.floor(Math.random() * this.cards.length);
  }

  selectColor() {
    // Color Selection Logic
    return colors[Math.floor(Math.random() * colors.length)];
  }

  putCard(stage) {
    const card = this.selectCard(stage);
    console.log(`${this.name} put ${card?.name}`);
    if(card === null) {
      return null
    }
    this.cards = this.cards.filter(c => c !== card);
    return card;
  }
}

export default Player;

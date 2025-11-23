import colors from '../constants/colors.js';
import Card from './card.js';
import Color from './color.js';
import Stage from './stage.js';

class Player {
  name: string;
  cards: Card[] = [];
  isUno: boolean = false;

  constructor(name: string) {
    this.name = name;
  }

  get cardCount(): number {
    return this.cards.length;
  }

  getCards(cards: Card[]): void {
    this.cards = [...this.cards, ...cards];
  }

  getCard(card: Card): void {
    this.cards.push(card);
    this.isUno = false;
  }

  sayUno(): void {
    this.isUno = Math.random() < 0.5;
  }

  canPutCards(stage: Stage): Card[] {
    return this.cards.filter(card => card.canPut(stage));
  }

  selectCard(stage: Stage): Card | null {
    const cards = this.canPutCards(stage);
    if(cards.length === 0) {
      return null;
    }
    // Card Selection Logic
    if(this.cards.length === 2 && !this.isUno) { this.sayUno(); }
    return cards[Math.floor(Math.random() * cards.length)];
    // return Math.floor(Math.random() * this.cards.length);
  }

  selectColor(): Color {
    // Color Selection Logic
    return colors[Math.floor(Math.random() * colors.length)];
  }

  putCard(stage: Stage): Card | null {
    const card = this.selectCard(stage);
    if(card === null) {
      return null
    }
    this.cards = this.cards.filter(c => c !== card);
    return card;
  }
}

export default Player;

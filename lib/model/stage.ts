
import cardCreators from '../constants/card_creators.js';
import Card from './card.js';
import Color from './color.js';
import Player from './player.js';

class Stage {
  players: Player[] = [];
  turn: number = 1;
  currentPlayerIndex: number = 0;
  fieldCards: Card[] = [];
  isOpposite: boolean = false;
  finishedPlayers: Player[] = [];
  num: number = 0;
  color: Color | null = null;
  drawNum: number = 0;

  constructor(players: Player[]) {
    this.players = players;
  }

  get playablePlayers(): Player[] {
    return this.players.filter(player => !this.finishedPlayers.includes(player));
  }

  get currentPlayer(): Player {
    return this.getPlayer(this.playerIndex(this.currentPlayerIndex));
  }

  get previousPlayer(): Player {
    const previousIndex = this.currentPlayerIndex - (this.isOpposite ? -1 : 1);
    return this.getPlayer(this.playerIndex(this.currentPlayerIndex - 1));
  }

  getPlayer(index: number): Player {
    return this.playablePlayers[index];
  }

  playerIndex(index: number): number {
    const playerCount = this.playablePlayers.length;
    return index % playerCount < 0
      ? index % playerCount + playerCount
      : index % playerCount;
  }

  get latestCard(): Card {
    return this.fieldCards[this.fieldCards.length - 1];
  }

  finishPlayer(player: Player): void {
    this.finishedPlayers.push(player);
  }

  nextPlayerIndex(step: number = 1): void {
    this.currentPlayerIndex = this.currentPlayerIndex + (this.isOpposite ? -step : step);
  }

  draw(): Card {
    console.log('draw');
    return cardCreators[Math.floor(Math.random() * cardCreators.length)]();
  }

  reverse(): void {
    this.isOpposite = !this.isOpposite;
  }

  setColor(color: Color | null): void {
    this.color = color;
  }

  setNum(num: number | null): void {
    this.num = num ?? 0;
  }

  addDrawNum(drawNum: number): void {
    this.drawNum += drawNum;
  }

  resetDrawNum(): void {
    this.drawNum = 0;
  }

  putCard(card: Card | null): void {
    if(card == null) return;
    card.handleCard(this);
    this.fieldCards.push(card);
  }

  nextTurn(card: Card | null): void {
    this.turn++;
    if(this.currentPlayer.cardCount === 0) this.finishPlayer(this.currentPlayer);
    this.nextPlayerIndex(card?.step || 1);
  }

  commitWithSingleChance(): Card | null {
    return this.currentPlayer.putCard(this);
  }

  commitWithDoubleChance(): Card | null {
    const firstCard = this.currentPlayer.putCard(this);
    if(firstCard != null) return firstCard;
    this.currentPlayer.getCard(this.draw());
    return this.currentPlayer.putCard(this);
  }

  setUpField(): void {
    this.finishedPlayers = [];
    // shuffle Players
    this.players = this.players.sort(() => Math.random() - 0.5);

    // distribute cards
    this.players.forEach(player => {
      // distribute 7 cards to each player
      player.getCards([...Array(7)].map(() => this.draw()));
    })

    // put first card
    const firstCard = this.drawFirstCard();
    this.putCard(firstCard);
  }

  drawFirstCard(): Card {
    const firstCard = this.draw();
    if((firstCard as any).num == null) return this.drawFirstCard();
    return firstCard;
  }

  playTurn(): void {
    console.log('play turn');
    console.log(
      {
        turn: this.turn,
        card: this.latestCard.name,
        player: this.currentPlayer.name,
        player_card: this.currentPlayer.cards.map(card => card.name),
        finishedPlayers: this.finishedPlayers,
        color: this.color,
        num: this.num,
      }
    )
    let card: Card | null = null;
    if(this.drawNum > 0) {
      card = this.commitWithSingleChance();
      // if (card != null) this.putCard(card);
      if (card != null) {
        console.log('put card', card);
        this.putCard(card);
      }
      else {
        console.log('draw card', this.drawNum);
        [...Array(this.drawNum)].forEach(() => this.currentPlayer.getCard(this.draw()));
        this.drawNum = 0;
      }
    } else {
      card = this.commitWithDoubleChance();
      console.log('put card', card);
      this.putCard(card);
    }
    if((this.previousPlayer.cardCount == 1 && !this.previousPlayer.isUno) || (this.previousPlayer.cardCount > 1 && this.previousPlayer.isUno)) {
      this.previousPlayer.getCard(this.draw());
      this.previousPlayer.getCard(this.draw());
    }
    this.nextTurn(card);
    console.log('end turn');
  }

  shouldEndField(): boolean {
    return this.finishedPlayers.length === this.players.length - 1;
  }

  getResult(): {winner: Player; looser: Player} {
    return {
      winner: this.finishedPlayers[0],
      looser: this.playablePlayers[0],
    };
  }

  play(): {winner: Player; looser: Player} {
    this.setUpField();
    while(!this.shouldEndField()) {
      this.playTurn();
    }
    return {
      winner: this.finishedPlayers[0],
      looser: this.playablePlayers[0],
    }
  }
}

export default Stage;

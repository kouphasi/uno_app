import Stage from './model/stage.js';
import Player from './model/player.js';

const players = [
  ...Array(4).fill(null).map((_, i) => new Player(`player${i+1}`)),
]

const stage = new Stage(players);

const run = () => {
  stage.setUpField();
  while(!stage.shouldEndField()) {
    stage.playTurn();
  }
  console.log(stage.getResult());
}

run();

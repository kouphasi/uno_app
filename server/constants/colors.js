import Color from '../model/color.js';

const colors = [
  new Color({name: 'red', code: '#ff0000'}),
  new Color({name: 'green', code: '#00ff00'}),
  new Color({name: 'blue', code: '#0000ff'}),
  new Color({name: 'yellow', code: '#ffff00'}),
];

console.log(colors);

export default colors;


import SpecialCard from '../model/special_card.js';
import colors from './colors.js';

//reverse
const reverseEffect = stage => stage.reverse();
const reverses = colors.map(color => () => new SpecialCard({name: `${color.name}reverse`, symbol: 'reverse', step: 2, drawNum: 0, color, effect: reverseEffect}));

//skip
const skips = colors.map(color => () => new SpecialCard({name: `${color.name}skip`, symbol: 'skip', step: 1, drawNum: 0, color}));

//draw2
const draw2s = colors.map(color => () => new SpecialCard({name: `${color.name}draw2`, symbol: 'draw2', step: 1, drawNum: 2, color}));

//wilds
const wildEffect = stage => stage.setColor(stage.currentPlayer.selectColor());
const wilds = [
  () => new SpecialCard({name: `wild`, symbol: 'wild', step: 1, drawNum: 0, color: null, effect: wildEffect}),
  () => new SpecialCard({name: `draw4`, symbol: 'draw4', step: 1, drawNum: 4, color: null, effect: wildEffect}),
];


const specialCardCreators = [
  ...reverses,
  ...skips,
  ...draw2s,
  ...wilds,
];

export default specialCardCreators;

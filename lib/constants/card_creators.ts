

import NumCard from '../model/num_card';
import specialCardCreators from './special_card_creators';
import colors from './colors';

const availableNumbers = Array.from({length: 10}, (_, i) => i);

const numCardCreators = colors.map( color => availableNumbers.map( num => () => new NumCard({name: `${color.name}${num}`, num, color}))).flat();

const cardCreators = [
  ...numCardCreators,
  ...specialCardCreators,
];

export default cardCreators;

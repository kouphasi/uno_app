import ZeroCard from '../../assets/cards/0-card.png';
import FirstCard from '../../assets/cards/1-card.png';
import SecondCard from '../../assets/cards/2-card.png';
import ThirdCard from '../../assets/cards/3-card.png';
import FourthCard from '../../assets/cards/4-card.png';
import FifthCard from '../../assets/cards/5-card.png';
import SixthCard from '../../assets/cards/6-card.png';
import SeventhCard from '../../assets/cards/7-card.png';
import EighthCard from '../../assets/cards/8-card.png';
import NinthCard from '../../assets/cards/9-card.png';
import DrawTwoCard from '../../assets/cards/draw2-card.png';
import DrawFourCard from '../../assets/cards/draw4-card.png';
import SkipCard from '../../assets/cards/skip-card.png';
import SkipTwoCard from '../../assets/cards/skip2-card.png';
import WildCard from '../../assets/cards/wild-card.png';
import BackCard from '../../assets/cards/back.jpeg';

export interface CardImage {
  img: string;
  hasColor: boolean;
}

export const frontCardImages: Record<string, CardImage> = {
  '0': { img: ZeroCard, hasColor: true },
  '1': { img: FirstCard, hasColor: true},
  '2': { img: SecondCard, hasColor: true },
  '3': { img: ThirdCard, hasColor: true},
  '4': { img: FourthCard, hasColor: true },
  '5': { img: FifthCard, hasColor: true},
  '6': { img: SixthCard, hasColor: true},
  '7': { img: SeventhCard, hasColor: true},
  '8': { img: EighthCard, hasColor: true },
  '9': { img: NinthCard, hasColor: true},
  'draw2': { img: DrawTwoCard, hasColor: true},
  'skip': { img: SkipCard, hasColor: true},
  'skip2': { img: SkipTwoCard, hasColor: true},
  'draw4': { img: DrawFourCard, hasColor: false},
  'wild': { img: WildCard, hasColor: false},
};

export type FrontCardImage = keyof typeof frontCardImages;

export const backCardImages: Record<string, CardImage> = {
  'back': { img: BackCard, hasColor: false },
} as const;

export type BackCardImage = keyof typeof backCardImages;

export const cardImages: Record<string, CardImage> = {
  ...frontCardImages,
  ...backCardImages,
}

export type CardImageKey = keyof typeof cardImages;

export type CardColor = 'red' | 'green' | 'blue' | 'yellow';

import Image from 'next/image';

interface CardProps {
  card: {
    cardId: string;
    name: string;
    color?: {
      name: string;
      code: string;
    };
    num?: number;
    symbol?: string;
    canPlay?: boolean;
  };
  onClick?: () => void;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
}

export default function Card({ card, onClick, size = 'medium', disabled = false }: CardProps) {
  const getImagePath = () => {
    if (card.symbol === 'skip') return '/cards/skip-card.png';
    if (card.symbol === 'reverse') return '/cards/skip2-card.png';
    if (card.symbol === 'draw2') return '/cards/draw2-card.png';
    if (card.symbol === 'wild' || card.name === 'wild') return '/cards/wild-card.png';
    if (card.symbol === 'draw4' || card.name === 'draw4') return '/cards/draw4-card.png';
    if (card.num !== undefined) return `/cards/${card.num}-card.png`;
    return '/cards/back.jpeg';
  };

  const sizeClasses = {
    small: 'w-16 h-24',
    medium: 'w-24 h-36',
    large: 'w-32 h-48',
  };

  const isClickable = onClick && !disabled;
  const canPlay = card.canPlay !== false;

  return (
    <div
      className={`
        relative rounded-lg overflow-hidden shadow-lg transition-all
        ${sizeClasses[size]}
        ${isClickable ? 'cursor-pointer hover:scale-110 hover:shadow-2xl' : ''}
        ${!canPlay && isClickable ? 'opacity-50' : 'opacity-100'}
        ${disabled ? 'cursor-not-allowed opacity-50' : ''}
      `}
      onClick={isClickable && canPlay ? onClick : undefined}
      style={{
        filter: card.color ? `drop-shadow(0 0 8px ${card.color.code}80)` : undefined,
      }}
    >
      <Image
        src={getImagePath()}
        alt={card.name}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 33vw"
      />
      {!canPlay && isClickable && (
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <span className="text-white font-bold text-sm">Cannot Play</span>
        </div>
      )}
    </div>
  );
}

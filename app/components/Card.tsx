import Image from 'next/image';
import { memo } from 'react';
import { CardSymbol, CARD_IMAGE_PATHS } from '@/app/constants/game';

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

function Card({ card, onClick, size = 'medium', disabled = false }: CardProps) {
  const getImagePath = (): string => {
    // Check for special cards first
    if (card.symbol === CardSymbol.SKIP) return CARD_IMAGE_PATHS[CardSymbol.SKIP];
    if (card.symbol === CardSymbol.REVERSE) return CARD_IMAGE_PATHS[CardSymbol.REVERSE];
    if (card.symbol === CardSymbol.DRAW2) return CARD_IMAGE_PATHS[CardSymbol.DRAW2];
    if (card.symbol === CardSymbol.WILD || card.name === CardSymbol.WILD) {
      return CARD_IMAGE_PATHS[CardSymbol.WILD];
    }
    if (card.symbol === CardSymbol.DRAW4 || card.name === CardSymbol.DRAW4) {
      return CARD_IMAGE_PATHS[CardSymbol.DRAW4];
    }

    // Number cards
    if (card.num !== undefined) return `/cards/${card.num}-card.png`;

    // Default back image
    return CARD_IMAGE_PATHS.BACK;
  };

  const sizeClasses = {
    small: 'w-16 h-24',
    medium: 'w-24 h-36',
    large: 'w-32 h-48',
  };

  const isClickable = onClick && !disabled;
  const canPlay = card.canPlay !== false;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isClickable && canPlay && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick?.();
    }
  };

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
      onKeyDown={handleKeyDown}
      role={isClickable ? 'button' : 'img'}
      tabIndex={isClickable && canPlay ? 0 : -1}
      aria-label={`${card.name} card${canPlay ? '' : ' (cannot play)'}`}
      aria-disabled={!canPlay || disabled}
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

// Memoize the component to prevent unnecessary re-renders
export default memo(Card, (prevProps, nextProps) => {
  return (
    prevProps.card.cardId === nextProps.card.cardId &&
    prevProps.card.canPlay === nextProps.card.canPlay &&
    prevProps.disabled === nextProps.disabled &&
    prevProps.size === nextProps.size
  );
});

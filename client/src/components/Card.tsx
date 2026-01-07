import type { Card as CardType, Suit, Rank } from '@bridge/shared';
import { Suit as S, Rank as R } from '@bridge/shared';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  elevated?: boolean;
  faceDown?: boolean;
}

const suitSymbols: Record<Suit, string> = {
  [S.SPADES]: '♠',
  [S.HEARTS]: '♥',
  [S.DIAMONDS]: '♦',
  [S.CLUBS]: '♣',
};

const suitColors: Record<Suit, string> = {
  [S.SPADES]: 'text-card-spade',
  [S.HEARTS]: 'text-card-heart',
  [S.DIAMONDS]: 'text-card-diamond',
  [S.CLUBS]: 'text-card-club',
};

const rankDisplay: Record<Rank, string> = {
  [R.TWO]: '2',
  [R.THREE]: '3',
  [R.FOUR]: '4',
  [R.FIVE]: '5',
  [R.SIX]: '6',
  [R.SEVEN]: '7',
  [R.EIGHT]: '8',
  [R.NINE]: '9',
  [R.TEN]: '10',
  [R.JACK]: 'J',
  [R.QUEEN]: 'Q',
  [R.KING]: 'K',
  [R.ACE]: 'A',
};

const sizeClasses = {
  sm: {
    card: 'w-10 h-14',
    rank: 'text-xs',
    suit: 'text-[10px]',
    pip: 'top-0.5 left-0.5',
    pipBottom: 'bottom-0.5 right-0.5',
  },
  md: {
    card: 'w-14 h-20',
    rank: 'text-sm font-bold',
    suit: 'text-xs',
    pip: 'top-1 left-1',
    pipBottom: 'bottom-1 right-1',
  },
  lg: {
    card: 'w-20 h-28',
    rank: 'text-lg font-bold',
    suit: 'text-base',
    pip: 'top-1.5 left-1.5',
    pipBottom: 'bottom-1.5 right-1.5',
  },
};

function Card({ card, onClick, disabled = false, size = 'md', elevated = false, faceDown = false }: CardProps) {
  const classes = sizeClasses[size];
  const colorClass = suitColors[card.suit];

  const isInteractive = onClick && !disabled;

  const baseClasses = `
    ${classes.card}
    relative
    bg-white
    rounded-lg
    border border-gray-200
    select-none
    transition-all duration-150
  `;

  const elevationClasses = elevated
    ? 'shadow-lg'
    : 'shadow-md';

  const interactiveClasses = isInteractive
    ? 'cursor-pointer hover:-translate-y-1 hover:shadow-xl card-glow'
    : '';

  const disabledClasses = disabled
    ? 'opacity-50 cursor-not-allowed'
    : '';

  if (faceDown) {
    return (
      <div
        className={`
          ${classes.card}
          relative
          rounded-lg
          border border-gray-300
          shadow-md
          select-none
          bg-gradient-to-br from-blue-800 to-blue-900
        `}
      >
        {/* Card back pattern */}
        <div className="absolute inset-1 rounded border border-blue-600/30">
          <div className="w-full h-full bg-blue-700/20 rounded"
               style={{
                 backgroundImage: `repeating-linear-gradient(
                   45deg,
                   transparent,
                   transparent 4px,
                   rgba(255,255,255,0.05) 4px,
                   rgba(255,255,255,0.05) 8px
                 )`
               }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={isInteractive ? onClick : undefined}
      className={`
        ${baseClasses}
        ${elevationClasses}
        ${interactiveClasses}
        ${disabledClasses}
      `}
    >
      {/* Top-left pip */}
      <div className={`absolute ${classes.pip} flex flex-col items-center leading-none ${colorClass}`}>
        <span className={classes.rank}>{rankDisplay[card.rank]}</span>
        <span className={classes.suit}>{suitSymbols[card.suit]}</span>
      </div>

      {/* Centre suit (large) */}
      <div className={`absolute inset-0 flex items-center justify-center ${colorClass}`}>
        <span className={size === 'sm' ? 'text-xl' : size === 'md' ? 'text-3xl' : 'text-4xl'}>
          {suitSymbols[card.suit]}
        </span>
      </div>

      {/* Bottom-right pip (rotated 180deg) */}
      <div className={`absolute ${classes.pipBottom} flex flex-col items-center leading-none rotate-180 ${colorClass}`}>
        <span className={classes.rank}>{rankDisplay[card.rank]}</span>
        <span className={classes.suit}>{suitSymbols[card.suit]}</span>
      </div>
    </div>
  );
}

export default Card;

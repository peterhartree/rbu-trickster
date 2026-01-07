import type { Card as CardType, Suit, Rank } from '@bridge/shared';
import { Suit as S, Rank as R } from '@bridge/shared';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  elevated?: boolean;
  faceDown?: boolean;
  rotation?: number;
  animationDelay?: number;
}

const suitSymbols: Record<Suit, string> = {
  [S.SPADES]: '\u2660',
  [S.HEARTS]: '\u2665',
  [S.DIAMONDS]: '\u2666',
  [S.CLUBS]: '\u2663',
};

const suitColors: Record<Suit, string> = {
  [S.SPADES]: 'text-deco-spade',
  [S.HEARTS]: 'text-deco-heart',
  [S.DIAMONDS]: 'text-deco-diamond',
  [S.CLUBS]: 'text-deco-club',
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
    rank: 'text-xs font-display font-bold',
    suit: 'text-[10px]',
    pip: 'top-0.5 left-1',
    pipBottom: 'bottom-0.5 right-1',
    centreSuit: 'text-xl',
  },
  md: {
    card: 'w-14 h-20',
    rank: 'text-sm font-display font-bold',
    suit: 'text-xs',
    pip: 'top-1 left-1.5',
    pipBottom: 'bottom-1 right-1.5',
    centreSuit: 'text-3xl',
  },
  lg: {
    card: 'w-20 h-28',
    rank: 'text-lg font-display font-bold',
    suit: 'text-base',
    pip: 'top-1.5 left-2',
    pipBottom: 'bottom-1.5 right-2',
    centreSuit: 'text-4xl',
  },
};

function Card({
  card,
  onClick,
  disabled = false,
  size = 'md',
  elevated = false,
  faceDown = false,
  rotation = 0,
  animationDelay = 0,
}: CardProps) {
  const classes = sizeClasses[size];
  const colorClass = suitColors[card.suit];

  const isInteractive = onClick && !disabled;

  // Art Deco card back design
  if (faceDown) {
    return (
      <div
        className={`
          ${classes.card}
          relative
          rounded-lg
          select-none
          bg-gradient-to-br from-deco-navy to-deco-midnight
          border border-deco-gold/40
          shadow-deco
        `}
        style={{
          transform: `rotate(${rotation}deg)`,
          animationDelay: `${animationDelay}ms`,
        }}
      >
        {/* Art Deco pattern on back */}
        <div className="absolute inset-1 rounded border border-deco-gold/20">
          <div
            className="w-full h-full rounded"
            style={{
              backgroundImage: `
                repeating-linear-gradient(
                  45deg,
                  transparent,
                  transparent 3px,
                  rgba(212, 175, 55, 0.1) 3px,
                  rgba(212, 175, 55, 0.1) 6px
                )
              `,
            }}
          />
          {/* Centre ornament */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 border border-deco-gold/30 rotate-45" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={isInteractive ? onClick : undefined}
      className={`
        ${classes.card}
        relative
        rounded-lg
        select-none
        transition-all duration-200
        bg-deco-cream
        border border-deco-gold/30
        ${elevated ? 'shadow-deco-lg' : 'shadow-deco'}
        ${isInteractive
          ? 'cursor-pointer hover:-translate-y-2 hover:shadow-gold card-glow fan-card'
          : ''
        }
        ${disabled ? 'cursor-not-allowed' : ''}
        card-entrance
      `}
      style={{
        transform: `rotate(${rotation}deg)`,
        animationDelay: `${animationDelay}ms`,
      }}
    >
      {/* Dark overlay when disabled (card stays fully opaque) */}
      {disabled && (
        <div className="absolute inset-0 rounded-lg bg-deco-navy/40 pointer-events-none z-10" />
      )}

      {/* Inner gold border accent */}
      <div className="absolute inset-[2px] rounded-md border border-deco-gold/10 pointer-events-none" />

      {/* Top-left pip */}
      <div className={`absolute ${classes.pip} flex flex-col items-center leading-none ${colorClass}`}>
        <span className={classes.rank}>{rankDisplay[card.rank]}</span>
        <span className={classes.suit}>{suitSymbols[card.suit]}</span>
      </div>

      {/* Centre suit (large) */}
      <div className={`absolute inset-0 flex items-center justify-center ${colorClass}`}>
        <span className={`${classes.centreSuit} opacity-90`}>
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

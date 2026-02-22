import type { Card as CardType, Suit, Rank } from '@bridge/shared';
import { Suit as S, Rank as R } from '@bridge/shared';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  disabled?: boolean;
  dimmed?: boolean;
  isTrump?: boolean;
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

// Suit fill colours for SVG figures
const suitFillColors: Record<Suit, string> = {
  [S.SPADES]: '#1a1a2e',
  [S.HEARTS]: '#c41e3a',
  [S.DIAMONDS]: '#d97706',
  [S.CLUBS]: '#059669',
};

// Art Deco face card figures
function QueenFigure({ color, small }: { color: string; small?: boolean }) {
  if (small) {
    // Simplified silhouette for sm cards
    return (
      <svg viewBox="0 0 40 60" className="w-6 h-9 opacity-80">
        <circle cx="20" cy="10" r="5" fill={color} opacity="0.8" />
        <path d="M14 16 Q20 14 26 16 L24 40 Q20 42 16 40 Z" fill={color} opacity="0.7" />
        <path d="M16 40 Q14 50 12 55 L28 55 Q26 50 24 40" fill={color} opacity="0.6" />
        {/* Crown/headpiece */}
        <path d="M15 6 L20 2 L25 6" stroke={color} strokeWidth="1.5" fill="none" opacity="0.8" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 50 80" className="w-8 h-12 opacity-85">
      {/* Headpiece - Art Deco fan crown */}
      <path d="M19 10 L25 3 L31 10" stroke={color} strokeWidth="1.5" fill="none" />
      <path d="M22 8 L25 5 L28 8" fill={color} opacity="0.5" />
      <line x1="25" y1="3" x2="25" y2="1" stroke={color} strokeWidth="1" />
      <circle cx="25" cy="1" r="1" fill={color} opacity="0.7" />
      {/* Head */}
      <ellipse cx="25" cy="15" rx="6" ry="7" fill={color} opacity="0.75" />
      {/* Neck */}
      <rect x="23" y="21" width="4" height="4" fill={color} opacity="0.6" />
      {/* Shoulders - broad geometric Art Deco */}
      <path d="M12 28 Q18 24 25 25 Q32 24 38 28 L36 32 Q25 30 14 32 Z" fill={color} opacity="0.65" />
      {/* Bodice - geometric gown */}
      <path d="M14 32 Q16 35 18 50 Q20 52 25 53 Q30 52 32 50 Q34 35 36 32" fill={color} opacity="0.6" />
      {/* Flowing skirt - elongated, leggy silhouette */}
      <path d="M18 50 Q15 58 12 72 L22 72 Q24 60 25 53 Q26 60 28 72 L38 72 Q35 58 32 50" fill={color} opacity="0.55" />
      {/* Decorative waist sash */}
      <path d="M17 38 Q25 36 33 38" stroke={color} strokeWidth="1" fill="none" opacity="0.8" />
      <path d="M17 39 Q25 37 33 39" stroke={color} strokeWidth="0.5" fill="none" opacity="0.5" />
      {/* Geometric arm accents */}
      <line x1="14" y1="32" x2="10" y2="44" stroke={color} strokeWidth="1.5" opacity="0.5" />
      <line x1="36" y1="32" x2="40" y2="44" stroke={color} strokeWidth="1.5" opacity="0.5" />
    </svg>
  );
}

function KingFigure({ color, small }: { color: string; small?: boolean }) {
  if (small) {
    return (
      <svg viewBox="0 0 40 60" className="w-6 h-9 opacity-80">
        <circle cx="20" cy="10" r="5" fill={color} opacity="0.8" />
        <path d="M12 16 Q20 14 28 16 L26 45 Q20 47 14 45 Z" fill={color} opacity="0.7" />
        {/* Crown */}
        <path d="M14 6 L17 2 L20 5 L23 2 L26 6" stroke={color} strokeWidth="1.5" fill={color} opacity="0.4" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 50 80" className="w-8 h-12 opacity-85">
      {/* Crown - Art Deco angular */}
      <path d="M15 12 L18 4 L22 9 L25 2 L28 9 L32 4 L35 12 Z" fill={color} opacity="0.5" />
      <path d="M15 12 L35 12" stroke={color} strokeWidth="1.5" />
      <circle cx="25" cy="2" r="1.5" fill={color} opacity="0.7" />
      {/* Head */}
      <ellipse cx="25" cy="18" rx="6.5" ry="7" fill={color} opacity="0.75" />
      {/* Neck */}
      <rect x="22" y="24" width="6" height="3" fill={color} opacity="0.6" />
      {/* Broad geometric shoulders with epaulettes */}
      <path d="M8 32 Q14 26 25 27 Q36 26 42 32 L40 36 Q25 33 10 36 Z" fill={color} opacity="0.65" />
      {/* Angular cape/robe */}
      <path d="M10 36 L13 68 Q25 72 37 68 L40 36" fill={color} opacity="0.55" />
      {/* Centre panel on robe */}
      <path d="M21 36 L21 68 Q25 70 29 68 L29 36" fill={color} opacity="0.35" />
      {/* Belt */}
      <rect x="12" y="44" width="26" height="2" fill={color} opacity="0.7" />
      <rect x="23" y="42" width="4" height="6" rx="1" fill={color} opacity="0.5" />
      {/* Shoulder decorations */}
      <circle cx="12" cy="33" r="2" fill={color} opacity="0.5" />
      <circle cx="38" cy="33" r="2" fill={color} opacity="0.5" />
    </svg>
  );
}

function JackFigure({ color, small }: { color: string; small?: boolean }) {
  if (small) {
    return (
      <svg viewBox="0 0 40 60" className="w-6 h-9 opacity-80">
        <circle cx="20" cy="10" r="5" fill={color} opacity="0.8" />
        <path d="M14 16 Q20 14 26 16 L24 45 Q20 47 16 45 Z" fill={color} opacity="0.65" />
        {/* Cap */}
        <path d="M16 7 Q20 3 24 7" stroke={color} strokeWidth="1.5" fill="none" opacity="0.7" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 50 80" className="w-8 h-12 opacity-85">
      {/* Rakish cap/beret */}
      <path d="M17 12 Q20 6 32 8 L34 11 Q25 9 17 12 Z" fill={color} opacity="0.6" />
      <circle cx="32" cy="8" r="1.5" fill={color} opacity="0.5" />
      {/* Head - in slight profile */}
      <ellipse cx="25" cy="17" rx="6" ry="6.5" fill={color} opacity="0.75" />
      {/* Neck */}
      <rect x="23" y="23" width="4" height="3" fill={color} opacity="0.6" />
      {/* Collar - turned up, dynamic */}
      <path d="M18 27 Q25 25 32 27 L34 30 Q25 28 16 30 Z" fill={color} opacity="0.7" />
      {/* Sleek tunic - shorter than king, more dynamic */}
      <path d="M16 30 Q17 40 18 55 Q25 58 32 55 Q33 40 34 30" fill={color} opacity="0.6" />
      {/* Legs - visible below shorter tunic */}
      <path d="M18 55 L16 72 L21 72 L22 55" fill={color} opacity="0.5" />
      <path d="M28 55 L29 72 L34 72 L32 55" fill={color} opacity="0.5" />
      {/* Belt with dagger */}
      <path d="M17 40 Q25 38 33 40" stroke={color} strokeWidth="1.5" fill="none" opacity="0.7" />
      <line x1="33" y1="40" x2="36" y2="48" stroke={color} strokeWidth="1" opacity="0.5" />
      {/* Dynamic arm pose */}
      <line x1="16" y1="30" x2="10" y2="42" stroke={color} strokeWidth="2" opacity="0.5" />
      <line x1="34" y1="30" x2="38" y2="38" stroke={color} strokeWidth="2" opacity="0.5" />
    </svg>
  );
}

const isFaceCard = (rank: Rank): boolean => rank === R.JACK || rank === R.QUEEN || rank === R.KING;

function FaceCardFigure({ rank, suit, small }: { rank: Rank; suit: Suit; small?: boolean }) {
  const color = suitFillColors[suit];
  switch (rank) {
    case R.QUEEN: return <QueenFigure color={color} small={small} />;
    case R.KING: return <KingFigure color={color} small={small} />;
    case R.JACK: return <JackFigure color={color} small={small} />;
    default: return null;
  }
}

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
  dimmed = false,
  isTrump = false,
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
        ${isTrump
          ? 'bg-gradient-to-br from-deco-cream to-amber-50 border border-deco-gold/50'
          : 'bg-deco-cream border border-deco-gold/30'
        }
        ${elevated ? 'shadow-deco-lg' : 'shadow-deco'}
        ${isInteractive
          ? 'cursor-pointer hover:-translate-y-2 hover:shadow-gold card-glow fan-card'
          : ''
        }
        card-entrance
      `}
      style={{
        transform: `rotate(${rotation}deg)`,
        animationDelay: `${animationDelay}ms`,
      }}
    >
      {/* Dark overlay when dimmed (card stays fully opaque) */}
      {dimmed && (
        <div className="absolute inset-0 rounded-lg bg-deco-navy/40 pointer-events-none z-10" />
      )}

      {/* Inner gold border accent */}
      <div className="absolute inset-[2px] rounded-md border border-deco-gold/10 pointer-events-none" />

      {/* Top-left pip */}
      <div className={`absolute ${classes.pip} flex flex-col items-center leading-none ${colorClass}`}>
        <span className={classes.rank}>{rankDisplay[card.rank]}</span>
        <span className={classes.suit}>{suitSymbols[card.suit]}</span>
      </div>

      {/* Centre: face card figure or suit symbol */}
      <div className={`absolute inset-0 flex items-center justify-center ${colorClass}`}>
        {isFaceCard(card.rank) ? (
          <FaceCardFigure rank={card.rank} suit={card.suit} small={size === 'sm'} />
        ) : (
          <span className={`${classes.centreSuit} opacity-90`}>
            {suitSymbols[card.suit]}
          </span>
        )}
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

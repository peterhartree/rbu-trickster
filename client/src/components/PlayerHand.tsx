import type { Card as CardType, Position, GameState, Suit, Rank } from '@bridge/shared';
import { Suit as SuitEnum, Rank as RankEnum } from '@bridge/shared';
import Card from './Card';

const hcpValues: Partial<Record<Rank, number>> = {
  [RankEnum.ACE]: 4,
  [RankEnum.KING]: 3,
  [RankEnum.QUEEN]: 2,
  [RankEnum.JACK]: 1,
};

function calculateHCP(hand: CardType[]): number {
  return hand.reduce((total, card) => total + (hcpValues[card.rank] || 0), 0);
}

interface PlayerHandProps {
  hand: CardType[];
  myPosition: Position;
  gameState: Partial<GameState>;
  onPlayCard: (card: CardType) => void;
}

function PlayerHand({ hand, myPosition, gameState, onPlayCard }: PlayerHandProps) {
  const isMyTurn = gameState.phase === 'playing' && gameState.currentPlayer === myPosition;

  // Sort all cards by suit then rank for display
  const sortedHand = sortCards(hand);

  // Calculate rotation for each card in fan layout
  const getCardRotation = (index: number, total: number): number => {
    if (total <= 1) return 0;
    const maxRotation = Math.min(total * 1.5, 20); // Max 20 degrees total spread
    const step = maxRotation / (total - 1);
    return -maxRotation / 2 + step * index;
  };

  // Calculate vertical offset for arc effect
  const getCardOffset = (index: number, total: number): number => {
    if (total <= 1) return 0;
    const center = (total - 1) / 2;
    const distance = Math.abs(index - center);
    return distance * distance * 1.5; // Quadratic for smooth arc
  };

  return (
    <div className="bg-deco-midnight rounded-lg shadow-deco border border-deco-gold/20 px-4 py-3">
      {/* Gold accent line above cards */}
      <div className="h-px bg-gradient-to-r from-transparent via-deco-gold/30 to-transparent mb-3" />

      <div className="flex items-end justify-center min-h-[100px]">
        {/* Cards in fan layout */}
        <div className="flex items-end justify-center relative">
          {sortedHand.map((card, index) => {
            const rotation = getCardRotation(index, sortedHand.length);
            const verticalOffset = getCardOffset(index, sortedHand.length);

            return (
              <div
                key={`${card.suit}-${card.rank}-${index}`}
                className="fan-card relative"
                style={{
                  marginLeft: index === 0 ? 0 : '-12px',
                  marginBottom: verticalOffset,
                  zIndex: index,
                }}
              >
                <Card
                  card={card}
                  onClick={() => onPlayCard(card)}
                  disabled={!isMyTurn}
                  dimmed={gameState.phase === 'playing' && !isMyTurn}
                  size="md"
                  rotation={rotation}
                  animationDelay={index * 50}
                />
              </div>
            );
          })}
          {sortedHand.length === 0 && (
            <span className="text-deco-cream/40 italic font-display">No cards</span>
          )}
        </div>
      </div>

      {/* HCP and card count */}
      <div className="text-center mt-2 text-xs text-deco-cream/50 tracking-wide">
        <span className="font-display text-deco-gold/70">{calculateHCP(hand)}</span>
        <span className="ml-1">HCP</span>
        <span className="mx-1.5 text-deco-gold/30">|</span>
        <span className="font-display text-deco-gold/70">{hand.length}</span>
        <span className="ml-1">cards</span>
      </div>
    </div>
  );
}

// Helper function to sort cards by suit then rank
function sortCards(cards: CardType[]): CardType[] {
  const suitOrder = [SuitEnum.SPADES, SuitEnum.HEARTS, SuitEnum.DIAMONDS, SuitEnum.CLUBS];
  const rankOrder = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

  return [...cards].sort((a, b) => {
    const suitDiff = suitOrder.indexOf(a.suit) - suitOrder.indexOf(b.suit);
    if (suitDiff !== 0) return suitDiff;
    return rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank);
  });
}

export default PlayerHand;

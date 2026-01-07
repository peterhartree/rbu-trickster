import type { Card as CardType, Position, GameState, Suit } from '@bridge/shared';
import { Suit as SuitEnum } from '@bridge/shared';
import Card from './Card';

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
    <div className="bg-deco-midnight rounded-lg shadow-deco border border-deco-gold/20 px-4 py-4">
      {/* Gold accent line above cards */}
      <div className="h-px bg-gradient-to-r from-transparent via-deco-gold/30 to-transparent mb-4" />

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

      {/* Card count with elegant styling */}
      <div className="text-center mt-3 text-xs text-deco-cream/50 tracking-wide">
        <span className="font-display text-deco-gold/70">{hand.length}</span>
        <span className="ml-1">card{hand.length !== 1 ? 's' : ''} remaining</span>
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

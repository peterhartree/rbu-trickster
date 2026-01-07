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

  return (
    <div className="bg-white/95 backdrop-blur rounded-lg shadow-lg px-4 py-3">
      <div className="flex items-center justify-center">
        {/* Cards in a single overlapping row */}
        <div className="flex items-center justify-center">
          {sortedHand.map((card, index) => (
            <div
              key={`${card.suit}-${card.rank}-${index}`}
              className="transition-all duration-150"
              style={{ marginLeft: index === 0 ? 0 : '-8px' }}
            >
              <Card
                card={card}
                onClick={() => onPlayCard(card)}
                disabled={!isMyTurn}
                size="md"
              />
            </div>
          ))}
          {sortedHand.length === 0 && (
            <span className="text-gray-400 italic">No cards</span>
          )}
        </div>
      </div>

      {/* Card count */}
      <div className="text-center mt-2 text-xs text-gray-500">
        {hand.length} card{hand.length !== 1 ? 's' : ''}
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

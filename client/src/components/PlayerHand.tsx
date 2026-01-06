import type { Card, Position, GameState, Suit } from '@bridge/shared';
import { Suit as SuitEnum } from '@bridge/shared';

interface PlayerHandProps {
  hand: Card[];
  myPosition: Position;
  gameState: Partial<GameState>;
  onPlayCard: (card: Card) => void;
}

function PlayerHand({ hand, myPosition, gameState, onPlayCard }: PlayerHandProps) {
  const isMyTurn = gameState.phase === 'playing' && gameState.currentPlayer === myPosition;

  // Group and sort cards by suit
  const groupedHand = groupBySuit(hand);

  const suitSymbols: Record<Suit, string> = {
    [SuitEnum.SPADES]: '♠',
    [SuitEnum.HEARTS]: '♥',
    [SuitEnum.DIAMONDS]: '♦',
    [SuitEnum.CLUBS]: '♣',
  };

  const suitColors: Record<Suit, string> = {
    [SuitEnum.SPADES]: 'text-gray-900',
    [SuitEnum.HEARTS]: 'text-red-600',
    [SuitEnum.DIAMONDS]: 'text-orange-600',
    [SuitEnum.CLUBS]: 'text-green-700',
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-green-800">Your hand ({myPosition})</h2>
        {isMyTurn && <span className="text-green-600 font-semibold">Your turn to play</span>}
      </div>

      <div className="space-y-4">
        {[SuitEnum.SPADES, SuitEnum.HEARTS, SuitEnum.DIAMONDS, SuitEnum.CLUBS].map((suit) => (
          <div key={suit} className="flex items-center space-x-2">
            <span className={`text-2xl font-bold ${suitColors[suit]} w-8`}>
              {suitSymbols[suit]}
            </span>
            <div className="flex flex-wrap gap-2">
              {groupedHand[suit].map((card, index) => (
                <button
                  key={`${card.suit}-${card.rank}-${index}`}
                  onClick={() => onPlayCard(card)}
                  disabled={!isMyTurn}
                  className={`px-3 py-2 rounded font-bold text-lg transition-all ${
                    suitColors[suit]
                  } ${
                    isMyTurn
                      ? 'bg-gray-100 hover:bg-green-100 hover:scale-110 cursor-pointer'
                      : 'bg-gray-50 cursor-not-allowed opacity-60'
                  }`}
                >
                  {card.rank}
                </button>
              ))}
              {groupedHand[suit].length === 0 && (
                <span className="text-gray-400 italic text-sm">—</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t text-sm text-gray-600">
        Cards remaining: {hand.length}
      </div>
    </div>
  );
}

// Helper function to group cards by suit and sort
function groupBySuit(cards: Card[]): Record<Suit, Card[]> {
  const grouped: Record<Suit, Card[]> = {
    [SuitEnum.SPADES]: [],
    [SuitEnum.HEARTS]: [],
    [SuitEnum.DIAMONDS]: [],
    [SuitEnum.CLUBS]: [],
  };

  for (const card of cards) {
    grouped[card.suit].push(card);
  }

  // Sort each suit by rank (descending)
  const rankOrder = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

  for (const suit of Object.values(SuitEnum)) {
    grouped[suit].sort((a, b) => rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank));
  }

  return grouped;
}

export default PlayerHand;

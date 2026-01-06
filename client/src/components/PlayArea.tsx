import type { Position, GameState, Suit } from '@bridge/shared';
import { Position as Pos, Suit as SuitEnum } from '@bridge/shared';

interface PlayAreaProps {
  gameState: Partial<GameState>;
  myPosition: Position | null;
}

function PlayArea({ gameState, myPosition }: PlayAreaProps) {
  const currentTrick = gameState.cardPlay?.currentTrick;
  const contract = gameState.contract;

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

  // Position layout for compass display
  const getPositionStyle = (position: Position) => {
    switch (position) {
      case Pos.NORTH:
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case Pos.EAST:
        return 'right-4 top-1/2 transform -translate-y-1/2';
      case Pos.SOUTH:
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      case Pos.WEST:
        return 'left-4 top-1/2 transform -translate-y-1/2';
    }
  };

  // Find card for each position in current trick
  const getCardForPosition = (position: Position) => {
    return currentTrick?.cards.find((c) => c.position === position);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-green-800">Card table</h2>
        {contract && (
          <p className="text-sm text-gray-600">
            Contract: <span className="font-semibold">{contract.level}{suitSymbols[contract.strain]}</span>
            {contract.doubled && 'X'}{contract.redoubled && 'XX'}
            {' by '}<span className="font-semibold">{contract.declarer}</span>
          </p>
        )}
      </div>

      {/* Compass table */}
      <div className="relative bg-gradient-to-br from-green-700 to-green-800 rounded-lg" style={{ height: '400px' }}>
        {/* Position labels and cards */}
        {[Pos.NORTH, Pos.EAST, Pos.SOUTH, Pos.WEST].map((position) => {
          const playedCard = getCardForPosition(position);
          const isCurrentPlayer = gameState.currentPlayer === position;
          const isDeclarer = gameState.contract?.declarer === position;
          const isDummy = gameState.cardPlay?.dummy === position;

          return (
            <div key={position} className={`absolute ${getPositionStyle(position)}`}>
              {/* Position label */}
              <div className="text-centre mb-2">
                <div className={`inline-block px-3 py-1 rounded ${
                  isCurrentPlayer ? 'bg-yellow-400 text-gray-900' : 'bg-white text-gray-800'
                } font-semibold text-sm`}>
                  {position}
                  {isDeclarer && ' (D)'}
                  {isDummy && ' (Dummy)'}
                </div>
              </div>

              {/* Played card */}
              {playedCard && (
                <div className={`bg-white rounded-lg shadow-lg px-6 py-8 text-centre ${suitColors[playedCard.card.suit]}`}>
                  <div className="text-4xl font-bold">{playedCard.card.rank}</div>
                  <div className="text-3xl">{suitSymbols[playedCard.card.suit]}</div>
                </div>
              )}
            </div>
          );
        })}

        {/* Centre info */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-centre text-white">
          {currentTrick && currentTrick.cards.length === 0 && (
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <p className="font-semibold">Trick {currentTrick.number}</p>
              <p className="text-sm">Leader: {currentTrick.leader}</p>
            </div>
          )}
        </div>
      </div>

      {/* Tricks won */}
      {gameState.cardPlay && (
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded p-3">
            <p className="text-sm font-semibold text-blue-900">North-South</p>
            <p className="text-2xl font-bold text-blue-700">{gameState.cardPlay.nsTricks} tricks</p>
          </div>
          <div className="bg-orange-50 rounded p-3">
            <p className="text-sm font-semibold text-orange-900">East-West</p>
            <p className="text-2xl font-bold text-orange-700">{gameState.cardPlay.ewTricks} tricks</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlayArea;

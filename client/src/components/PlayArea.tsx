import type { Position, GameState } from '@bridge/shared';
import { Position as Pos } from '@bridge/shared';
import Card from './Card';

interface PlayAreaProps {
  gameState: Partial<GameState>;
  myPosition: Position | null;
}

const positionNames: Record<Position, string> = {
  N: 'North',
  E: 'East',
  S: 'South',
  W: 'West',
};

function PlayArea({ gameState, myPosition }: PlayAreaProps) {
  const currentTrick = gameState.cardPlay?.currentTrick;

  // Position layout for compass display - adjusted for h-full
  const getPositionStyle = (position: Position) => {
    switch (position) {
      case Pos.NORTH:
        return 'top-2 left-1/2 transform -translate-x-1/2 flex flex-col items-center';
      case Pos.EAST:
        return 'right-2 top-1/2 transform -translate-y-1/2 flex flex-row-reverse items-center';
      case Pos.SOUTH:
        return 'bottom-2 left-1/2 transform -translate-x-1/2 flex flex-col-reverse items-center';
      case Pos.WEST:
        return 'left-2 top-1/2 transform -translate-y-1/2 flex flex-row items-center';
    }
  };

  // Find card for each position in current trick
  const getCardForPosition = (position: Position) => {
    return currentTrick?.cards.find((c) => c.position === position);
  };

  return (
    <div className="h-full flex flex-col bg-white/95 backdrop-blur rounded-lg shadow-lg overflow-hidden">
      {/* Compass table - takes all available space */}
      <div className="flex-1 min-h-[280px] relative bg-gradient-to-br from-table-light to-table-felt rounded-lg m-2 table-texture">
        {/* Decorative centre circle */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-2 border-white/20" />

        {/* Centre info */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white z-10">
          {currentTrick && currentTrick.cards.length === 0 && (
            <div className="bg-black/30 backdrop-blur-sm rounded-lg px-4 py-2">
              <p className="font-semibold text-sm">Trick {currentTrick.number}</p>
              <p className="text-xs opacity-80">Lead: {positionNames[currentTrick.leader]}</p>
            </div>
          )}
        </div>

        {/* Position labels and cards */}
        {[Pos.NORTH, Pos.EAST, Pos.SOUTH, Pos.WEST].map((position) => {
          const playedCard = getCardForPosition(position);
          const isCurrentPlayer = gameState.currentPlayer === position;
          const isDeclarer = gameState.contract?.declarer === position;
          const isDummy = gameState.cardPlay?.dummy === position;

          return (
            <div key={position} className={`absolute ${getPositionStyle(position)}`}>
              {/* Position label */}
              <div
                className={`
                  px-2 py-0.5 rounded text-xs font-semibold transition-all
                  ${isCurrentPlayer
                    ? 'bg-turn-active text-white ring-2 ring-turn-glow ring-offset-1'
                    : 'bg-white/90 text-gray-700'
                  }
                  ${position === Pos.NORTH || position === Pos.SOUTH ? 'mb-1' : 'mx-1'}
                `}
              >
                {position}
                {isDeclarer && ' D'}
                {isDummy && ' 🂠'}
              </div>

              {/* Played card */}
              {playedCard && (
                <Card card={playedCard.card} size="md" elevated />
              )}
            </div>
          );
        })}
      </div>

      {/* Tricks won - compact bar at bottom */}
      {gameState.cardPlay && (
        <div className="shrink-0 grid grid-cols-2 gap-2 px-2 pb-2">
          <div className="bg-blue-50 rounded px-3 py-1.5 flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-800">N-S</span>
            <span className="text-lg font-bold text-blue-700">{gameState.cardPlay.nsTricks}</span>
          </div>
          <div className="bg-orange-50 rounded px-3 py-1.5 flex items-center justify-between">
            <span className="text-xs font-semibold text-orange-800">E-W</span>
            <span className="text-lg font-bold text-orange-700">{gameState.cardPlay.ewTricks}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlayArea;

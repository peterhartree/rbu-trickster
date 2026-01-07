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

  // Position layout for compass display
  const getPositionStyle = (position: Position) => {
    switch (position) {
      case Pos.NORTH:
        return 'top-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center';
      case Pos.EAST:
        return 'right-4 top-1/2 transform -translate-y-1/2 flex flex-row-reverse items-center';
      case Pos.SOUTH:
        return 'bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col-reverse items-center';
      case Pos.WEST:
        return 'left-4 top-1/2 transform -translate-y-1/2 flex flex-row items-center';
    }
  };

  // Find card for each position in current trick
  const getCardForPosition = (position: Position) => {
    return currentTrick?.cards.find((c) => c.position === position);
  };

  return (
    <div className="h-full flex flex-col bg-deco-midnight rounded-lg shadow-deco border border-deco-gold/20 overflow-hidden">
      {/* Art Deco table surface */}
      <div className="flex-1 min-h-[280px] relative bg-deco-navy rounded-lg m-2 deco-table-pattern">
        {/* Decorative gold compass rose at centre */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          {/* Outer ring */}
          <div className="w-28 h-28 rounded-full border border-deco-gold/20" />
          {/* Inner ring */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border border-deco-gold/30" />
          {/* Diamond centre */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-deco-gold/20 rotate-45" />
          {/* Compass lines */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-px bg-deco-gold/15" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-px h-24 bg-deco-gold/15" />
        </div>

        {/* Centre info */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-10">
          {currentTrick && currentTrick.cards.length === 0 && (
            <div className="bg-deco-midnight/90 backdrop-blur-sm rounded-lg px-4 py-2 border border-deco-gold/20">
              <p className="font-display font-semibold text-sm text-deco-gold">Trick {currentTrick.number}</p>
              <p className="text-xs text-deco-cream/60">Lead: {positionNames[currentTrick.leader]}</p>
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
              {/* Position label - Art Deco style */}
              <div
                className={`
                  px-3 py-1 rounded text-xs font-semibold tracking-wide transition-all
                  ${isCurrentPlayer
                    ? 'bg-deco-gold text-deco-navy ring-2 ring-deco-gold/50 ring-offset-2 ring-offset-deco-navy'
                    : 'bg-deco-midnight/80 text-deco-cream/80 border border-deco-gold/20'
                  }
                  ${position === Pos.NORTH || position === Pos.SOUTH ? 'mb-2' : 'mx-2'}
                `}
              >
                {position}
                {isDeclarer && <span className="ml-1 text-deco-gold-light">D</span>}
                {isDummy && <span className="ml-1 opacity-60">*</span>}
              </div>

              {/* Played card */}
              {playedCard && (
                <Card card={playedCard.card} size="md" elevated />
              )}
            </div>
          );
        })}
      </div>

      {/* Tricks won - Art Deco style */}
      {gameState.cardPlay && (
        <div className="shrink-0 grid grid-cols-2 gap-2 px-2 pb-2">
          <div className="bg-deco-accent/30 rounded px-3 py-2 flex items-center justify-between border border-deco-gold/10">
            <span className="text-xs font-semibold text-deco-cream/70 tracking-wide">N-S</span>
            <span className="text-lg font-display font-bold text-deco-gold">{gameState.cardPlay.nsTricks}</span>
          </div>
          <div className="bg-deco-accent/30 rounded px-3 py-2 flex items-center justify-between border border-deco-gold/10">
            <span className="text-xs font-semibold text-deco-cream/70 tracking-wide">E-W</span>
            <span className="text-lg font-display font-bold text-deco-gold">{gameState.cardPlay.ewTricks}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlayArea;

import type { Position, GameState } from '@bridge/shared';

interface TurnIndicatorProps {
  gameState: Partial<GameState>;
  myPosition: Position | null;
}

const positionNames: Record<Position, string> = {
  N: 'North',
  E: 'East',
  S: 'South',
  W: 'West',
};

function TurnIndicator({ gameState, myPosition }: TurnIndicatorProps) {
  const phase = gameState.phase;
  const currentBidder = gameState.currentBidder;
  const currentPlayer = gameState.currentPlayer;

  // Determine whose turn it is based on phase
  const currentTurn = phase === 'bidding' ? currentBidder : currentPlayer;
  const isMyTurn = currentTurn === myPosition;

  // Determine the action type
  const actionText = phase === 'bidding' ? 'bid' : 'play';
  const ActionIcon = phase === 'bidding' ? BidIcon : PlayIcon;

  if (phase === 'complete') {
    return (
      <div className="bg-deco-midnight rounded-lg shadow-deco border border-deco-gold/20 p-6 animate-fade-in-up deco-corner">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-deco-gold/20 flex items-center justify-center mb-4 border border-deco-gold/30">
            <CheckIcon className="w-8 h-8 text-deco-gold" />
          </div>
          <h2 className="text-xl font-display font-bold text-deco-gold mb-2">Hand Complete</h2>
          <p className="text-deco-cream/60">View the score to see results</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`
        rounded-lg shadow-deco p-6 transition-all duration-300 animate-fade-in-up
        ${isMyTurn
          ? 'bg-gradient-to-br from-deco-gold via-deco-gold to-deco-gold-light animate-pulse-glow border-2 border-deco-gold-light'
          : 'bg-deco-midnight border border-deco-gold/20 deco-corner'
        }
      `}
    >
      <div className="flex flex-col items-center text-center">
        {/* Icon */}
        <div
          className={`
            w-16 h-16 rounded-full flex items-center justify-center mb-4 border
            ${isMyTurn
              ? 'bg-deco-navy/30 border-deco-navy/30 animate-bounce-subtle'
              : 'bg-deco-gold/10 border-deco-gold/20'
            }
          `}
        >
          <ActionIcon
            className={`w-8 h-8 ${isMyTurn ? 'text-deco-navy' : 'text-deco-gold/70'}`}
          />
        </div>

        {/* Status text */}
        {isMyTurn ? (
          <>
            <h2 className="text-2xl font-display font-bold text-deco-navy mb-2">Your Turn!</h2>
            <p className="text-deco-navy/70">
              Select your {actionText}
            </p>
          </>
        ) : (
          <>
            <h2 className="text-xl font-display font-bold text-deco-gold mb-2">
              Waiting for {currentTurn ? positionNames[currentTurn] : '...'}
            </h2>
            <p className="text-deco-cream/60">
              {currentTurn ? `${positionNames[currentTurn]} is choosing their ${actionText}` : 'Loading...'}
            </p>
          </>
        )}

        {/* Position badge */}
        {myPosition && (
          <p
            className={`
              mt-4 text-sm italic
              ${isMyTurn ? 'text-deco-navy/60' : 'text-deco-cream/50'}
            `}
          >
            You are {positionNames[myPosition]}
          </p>
        )}

        {/* Contract info during play phase */}
        {phase === 'playing' && gameState.contract && (
          <div
            className={`
              mt-4 pt-4 border-t w-full
              ${isMyTurn ? 'border-deco-navy/20' : 'border-deco-gold/20'}
            `}
          >
            <p className={`text-sm ${isMyTurn ? 'text-deco-navy/60' : 'text-deco-cream/50'}`}>
              Contract
            </p>
            <p className={`text-lg font-display font-bold ${isMyTurn ? 'text-deco-navy' : 'text-deco-gold'}`}>
              {gameState.contract.level}
              {formatStrain(gameState.contract.strain)}
              {gameState.contract.doubled && 'X'}
              {gameState.contract.redoubled && 'XX'}
              {' by '}
              {positionNames[gameState.contract.declarer]}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function formatStrain(strain: string): string {
  const symbols: Record<string, string> = {
    C: '\u2663',
    D: '\u2666',
    H: '\u2665',
    S: '\u2660',
    NT: 'NT',
  };
  return symbols[strain] || strain;
}

// Icon components
function BidIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

export default TurnIndicator;

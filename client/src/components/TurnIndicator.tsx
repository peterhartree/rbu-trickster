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
      <div className="bg-white/95 backdrop-blur rounded-lg shadow-lg p-6 animate-fade-in-up">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <CheckIcon className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Hand complete</h2>
          <p className="text-gray-600">View the score to see results</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`
        rounded-lg shadow-lg p-6 transition-all duration-300 animate-fade-in-up
        ${isMyTurn
          ? 'bg-gradient-to-br from-amber-400 to-amber-500 animate-pulse-glow'
          : 'bg-white/95 backdrop-blur'
        }
      `}
    >
      <div className="flex flex-col items-center text-center">
        {/* Icon */}
        <div
          className={`
            w-16 h-16 rounded-full flex items-center justify-center mb-4
            ${isMyTurn
              ? 'bg-white/30 animate-bounce-subtle'
              : 'bg-gray-100'
            }
          `}
        >
          <ActionIcon
            className={`w-8 h-8 ${isMyTurn ? 'text-white' : 'text-gray-500'}`}
          />
        </div>

        {/* Status text */}
        {isMyTurn ? (
          <>
            <h2 className="text-2xl font-bold text-white mb-2">Your turn!</h2>
            <p className="text-white/90">
              Select your {actionText}
            </p>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Waiting for {currentTurn ? positionNames[currentTurn] : '...'}
            </h2>
            <p className="text-gray-600">
              {currentTurn ? `${positionNames[currentTurn]} is choosing their ${actionText}` : 'Loading...'}
            </p>
          </>
        )}

        {/* Position badge */}
        {myPosition && (
          <div
            className={`
              mt-4 px-4 py-2 rounded-full text-sm font-semibold
              ${isMyTurn
                ? 'bg-white/20 text-white'
                : 'bg-gray-100 text-gray-700'
              }
            `}
          >
            You are {positionNames[myPosition]} ({myPosition})
          </div>
        )}

        {/* Contract info during play phase */}
        {phase === 'playing' && gameState.contract && (
          <div
            className={`
              mt-4 pt-4 border-t w-full
              ${isMyTurn ? 'border-white/20' : 'border-gray-200'}
            `}
          >
            <p className={`text-sm ${isMyTurn ? 'text-white/80' : 'text-gray-500'}`}>
              Contract
            </p>
            <p className={`text-lg font-bold ${isMyTurn ? 'text-white' : 'text-gray-800'}`}>
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
    C: '♣',
    D: '♦',
    H: '♥',
    S: '♠',
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

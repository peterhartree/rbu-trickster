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
  const dummyPosition = gameState.cardPlay?.dummy;
  const declarerPosition = gameState.contract?.declarer;

  // Helper: show "Name (East)" or just "East" if no name
  const getDisplayName = (position: Position | undefined | null): string => {
    if (!position) return '...';
    const name = gameState.players?.[position]?.name;
    return name ? `${name} (${positionNames[position]})` : positionNames[position];
  };

  // Determine whose turn it is based on phase
  const currentTurn = phase === 'bidding' ? currentBidder : currentPlayer;

  // Dummy awareness
  const iAmDummy = phase === 'playing' && myPosition === dummyPosition && myPosition !== declarerPosition;
  const iAmDeclarer = myPosition === declarerPosition;
  const isDummysTurn = phase === 'playing' && currentPlayer === dummyPosition;
  const isDeclarerPlayingDummy = iAmDeclarer && isDummysTurn;

  // My turn: either it's literally my turn, or I'm declarer and it's dummy's turn
  const isMyTurn = (currentTurn === myPosition && !iAmDummy) || isDeclarerPlayingDummy;

  // Determine the action type
  const actionText = phase === 'bidding' ? 'bid' : 'play';
  const ActionIcon = phase === 'bidding' ? BidIcon : PlayIcon;

  if (phase === 'complete') {
    return (
      <div className="bg-deco-midnight rounded-lg shadow-deco border border-deco-gold/20 p-4 animate-fade-in-up deco-corner">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-deco-gold/20 flex items-center justify-center mb-3 border border-deco-gold/30">
            <CheckIcon className="w-6 h-6 text-deco-gold" />
          </div>
          <h2 className="text-lg font-display font-bold text-deco-gold mb-1">Hand Complete</h2>
          <p className="text-sm text-deco-cream/60">View the score to see results</p>
        </div>
      </div>
    );
  }

  // Dummy state — calm, no action needed
  if (iAmDummy) {
    return (
      <div className="bg-deco-midnight rounded-lg shadow-deco border border-deco-gold/20 p-4 animate-fade-in-up deco-corner">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-deco-gold/10 flex items-center justify-center mb-3 border border-deco-gold/20">
            <DummyIcon className="w-6 h-6 text-deco-gold/60" />
          </div>
          <h2 className="text-lg font-display font-bold text-deco-cream/70 mb-2">You are dummy</h2>
          <p className="text-sm text-deco-cream/50">
            {getDisplayName(declarerPosition)} plays your cards
          </p>

          {/* Contract info */}
          {gameState.contract && (
            <div className="mt-4 pt-4 border-t border-deco-gold/20 w-full">
              <p className="text-sm text-deco-cream/50">Contract</p>
              <p className="text-lg font-display font-bold text-deco-gold">
                {gameState.contract.level}
                {formatStrain(gameState.contract.strain)}
                {gameState.contract.doubled && 'X'}
                {gameState.contract.redoubled && 'XX'}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Declarer playing dummy's cards
  if (isDeclarerPlayingDummy) {
    return (
      <div
        className="rounded-lg shadow-deco p-4 transition-all duration-300 animate-fade-in-up bg-gradient-to-br from-deco-gold via-deco-gold to-deco-gold-light animate-pulse-glow border-2 border-deco-gold-light"
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-deco-navy/30 border border-deco-navy/30 animate-bounce-subtle flex items-center justify-center mb-3">
            <PlayIcon className="w-6 h-6 text-deco-navy" />
          </div>
          <h2 className="text-2xl font-display font-bold text-deco-navy mb-2">Play dummy's cards</h2>
          <p className="text-deco-navy/70">
            Select a card from dummy's hand
          </p>

          {gameState.contract && (
            <div className="mt-4 pt-4 border-t border-deco-navy/20 w-full">
              <p className="text-sm text-deco-navy/60">Contract</p>
              <p className="text-lg font-display font-bold text-deco-navy">
                {gameState.contract.level}
                {formatStrain(gameState.contract.strain)}
                {gameState.contract.doubled && 'X'}
                {gameState.contract.redoubled && 'XX'}
                {' by '}
                {getDisplayName(gameState.contract.declarer)}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`
        rounded-lg shadow-deco p-4 transition-all duration-300 animate-fade-in-up
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
            w-12 h-12 rounded-full flex items-center justify-center mb-3 border
            ${isMyTurn
              ? 'bg-deco-navy/30 border-deco-navy/30 animate-bounce-subtle'
              : 'bg-deco-gold/10 border-deco-gold/20'
            }
          `}
        >
          <ActionIcon
            className={`w-6 h-6 ${isMyTurn ? 'text-deco-navy' : 'text-deco-gold/70'}`}
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
              Waiting for {getDisplayName(currentTurn)}
            </h2>
            <p className="text-deco-cream/60">
              {currentTurn ? `Choosing their ${actionText}` : 'Loading...'}
            </p>
          </>
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
              {getDisplayName(gameState.contract.declarer)}
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

function DummyIcon({ className }: { className?: string }) {
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
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );
}

export default TurnIndicator;

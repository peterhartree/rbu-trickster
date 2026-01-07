import type { Position } from '@bridge/shared';

interface WaitingRoomProps {
  roomId: string;
  myPosition: Position | null;
  playerCount: number;
  isConnected: boolean;
  onStartGame: () => void;
}

const positionData = [
  { position: 'N', name: 'North', symbol: '\u2660' },
  { position: 'E', name: 'East', symbol: '\u2666' },
  { position: 'S', name: 'South', symbol: '\u2665' },
  { position: 'W', name: 'West', symbol: '\u2663' },
];

function WaitingRoom({
  roomId,
  myPosition,
  playerCount,
  isConnected,
  onStartGame,
}: WaitingRoomProps) {
  return (
    <div className="min-h-screen bg-deco-navy flex items-center justify-center p-4">
      <div className="bg-deco-midnight rounded-lg shadow-deco-lg p-8 max-w-4xl w-full border border-deco-gold/20 deco-corner">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex justify-center items-center space-x-3 mb-4">
            <div className="w-8 h-px bg-gradient-to-r from-transparent to-deco-gold/50" />
            <div className="w-3 h-3 bg-deco-gold rotate-45" />
            <div className="w-8 h-px bg-gradient-to-l from-transparent to-deco-gold/50" />
          </div>
          <h1 className="text-4xl font-display font-bold text-deco-gold mb-3">Contract Bridge</h1>
          <p className="text-deco-cream/60 tracking-widest uppercase text-sm">
            Room <span className="font-mono text-deco-gold">{roomId}</span>
          </p>
        </div>

        {/* Connection status */}
        <div className="flex items-center justify-center space-x-2 mb-6">
          <div
            className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}
          />
          <span className="text-sm text-deco-cream/60">
            {isConnected ? 'Connected to server' : 'Disconnected'}
          </span>
        </div>

        {/* My position */}
        {myPosition && (
          <div className="text-center mb-6">
            <p className="text-deco-cream/80">
              You are seated at{' '}
              <span className="font-display font-bold text-deco-gold text-lg">
                {positionData.find(p => p.position === myPosition)?.name}
              </span>
            </p>
          </div>
        )}

        {/* Player grid */}
        <div className="bg-deco-navy rounded-lg p-6 mb-8 border border-deco-gold/10">
          <p className="font-display font-semibold text-deco-gold mb-4 text-center">
            Players: <span className="text-2xl">{playerCount}</span>/4
          </p>
          <div className="grid grid-cols-2 gap-4">
            {positionData.map(({ position, name, symbol }) => (
              <div
                key={position}
                className={`
                  p-4 rounded-lg text-center border transition-all
                  ${myPosition === position
                    ? 'bg-deco-gold/20 border-deco-gold/50'
                    : 'bg-deco-midnight border-deco-gold/10'
                  }
                `}
              >
                <div className="text-3xl mb-2 text-deco-gold">{symbol}</div>
                <div className="font-display font-semibold text-deco-cream">{name}</div>
                {myPosition === position && (
                  <div className="text-xs text-deco-gold mt-1">You</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Waiting message */}
        {playerCount < 4 && (
          <div className="bg-deco-accent/30 border border-deco-gold/20 rounded-lg p-4 text-center">
            <p className="text-deco-cream/80">
              Waiting for{' '}
              <span className="font-display font-bold text-deco-gold">{4 - playerCount}</span>
              {' '}more player{4 - playerCount !== 1 ? 's' : ''}...
            </p>
            <p className="text-sm text-deco-cream/60 mt-3">
              Share this code:{' '}
              <button
                onClick={() => navigator.clipboard.writeText(roomId)}
                className="font-mono font-bold text-deco-gold hover:text-deco-gold-light underline transition-colors"
              >
                {roomId}
              </button>
            </p>
          </div>
        )}

        {/* Ready to start */}
        {playerCount === 4 && (
          <div className="bg-deco-gold/20 border border-deco-gold/40 rounded-lg p-6 text-center">
            <p className="text-deco-gold font-display font-semibold text-lg mb-4">
              All players ready!
            </p>
            <button
              onClick={onStartGame}
              className="bg-deco-gold hover:bg-deco-gold-light text-deco-navy font-semibold py-3 px-8 rounded-lg transition-all duration-200 hover:scale-105 shadow-gold"
            >
              Start Game
            </button>
          </div>
        )}

        {/* Footer decoration */}
        <div className="mt-8 flex justify-center items-center space-x-3">
          <div className="w-16 h-px bg-gradient-to-r from-transparent to-deco-gold/30" />
          <div className="w-2 h-2 bg-deco-gold/50 rotate-45" />
          <div className="w-16 h-px bg-gradient-to-l from-transparent to-deco-gold/30" />
        </div>
      </div>
    </div>
  );
}

export default WaitingRoom;

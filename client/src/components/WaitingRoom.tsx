import { useRef } from 'react';
import type { Position, GameState } from '@bridge/shared';

interface WaitingRoomProps {
  roomId: string;
  myPosition: Position | null;
  playerCount: number;
  isConnected: boolean;
  onStartGame: () => void;
  playerName: string;
  onPlayerNameChange: (name: string) => void;
  avatarUrl: string | null;
  onAvatarChange: (dataUrl: string) => void;
  players?: GameState['players'];
}

const positionData = [
  { position: 'N', name: 'North', symbol: '\u2660' },
  { position: 'E', name: 'East', symbol: '\u2666' },
  { position: 'S', name: 'South', symbol: '\u2665' },
  { position: 'W', name: 'West', symbol: '\u2663' },
];

function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 80;
      canvas.height = 80;
      const ctx = canvas.getContext('2d')!;
      // Crop to square from centre, then draw at 80×80
      const size = Math.min(img.width, img.height);
      const sx = (img.width - size) / 2;
      const sy = (img.height - size) / 2;
      ctx.drawImage(img, sx, sy, size, size, 0, 0, 80, 80);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function WaitingRoom({
  roomId,
  myPosition,
  playerCount,
  isConnected,
  onStartGame,
  playerName,
  onPlayerNameChange,
  avatarUrl,
  onAvatarChange,
  players,
}: WaitingRoomProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await resizeImage(file);
    onAvatarChange(dataUrl);
  };

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

        {/* Name and avatar input */}
        {myPosition && (
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-4 mb-3">
              {/* Avatar */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="relative w-16 h-16 rounded-full border-2 border-deco-gold/40 hover:border-deco-gold transition-colors overflow-hidden bg-deco-navy flex items-center justify-center shrink-0 group"
                title="Click to set profile picture"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-deco-cream/40 text-2xl font-display">
                    {playerName ? playerName[0].toUpperCase() : '?'}
                  </span>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-xs">Edit</span>
                </div>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarSelect}
                className="hidden"
              />
              {/* Name */}
              <div>
                <label className="block text-sm text-deco-cream/60 mb-1">Your name</label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => onPlayerNameChange(e.target.value)}
                  placeholder="Enter your name"
                  className="bg-deco-navy border border-deco-gold/30 rounded px-4 py-2 text-deco-cream text-center font-display focus:border-deco-gold focus:outline-none w-48"
                  maxLength={20}
                />
              </div>
            </div>
            <p className="text-deco-cream/80">
              Seated at{' '}
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
            {positionData.map(({ position, name, symbol }) => {
              const player = players?.[position as Position];
              const playerAvatar = myPosition === position ? avatarUrl : player?.avatarUrl;
              const playerDisplayName = myPosition === position ? playerName : player?.name;
              return (
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
                  <div className="flex justify-center mb-2">
                    {playerAvatar ? (
                      <img
                        src={playerAvatar}
                        alt={name}
                        className="w-10 h-10 rounded-full object-cover border border-deco-gold/30"
                      />
                    ) : (
                      <div className="text-3xl text-deco-gold">{symbol}</div>
                    )}
                  </div>
                  <div className="font-display font-semibold text-deco-cream">
                    {playerDisplayName || name}
                  </div>
                  {myPosition === position && (
                    <div className="text-xs text-deco-gold mt-1">You</div>
                  )}
                </div>
              );
            })}
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

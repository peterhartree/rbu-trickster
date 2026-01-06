import type { Position } from '@bridge/shared';

interface WaitingRoomProps {
  roomId: string;
  myPosition: Position | null;
  playerCount: number;
  isConnected: boolean;
  onStartGame: () => void;
}

function WaitingRoom({
  roomId,
  myPosition,
  playerCount,
  isConnected,
  onStartGame,
}: WaitingRoomProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 to-green-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-4xl w-full">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-green-800 mb-2">Game Room</h1>
          <p className="text-gray-600">
            Room code: <span className="font-mono font-bold text-lg">{roomId}</span>
          </p>
        </div>

        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <div
              className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
            ></div>
            <span className="text-sm text-gray-600">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          {myPosition && (
            <p className="text-lg mb-4">
              You are seated at: <span className="font-bold">{myPosition}</span>
            </p>
          )}

          <div className="bg-gray-100 rounded-lg p-6">
            <p className="font-semibold mb-4">Players: {playerCount}/4</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg text-centre">
                <div className="text-2xl mb-2">♠</div>
                <div className="font-semibold">North</div>
              </div>
              <div className="bg-white p-4 rounded-lg text-centre">
                <div className="text-2xl mb-2">♦</div>
                <div className="font-semibold">East</div>
              </div>
              <div className="bg-white p-4 rounded-lg text-centre">
                <div className="text-2xl mb-2">♥</div>
                <div className="font-semibold">South</div>
              </div>
              <div className="bg-white p-4 rounded-lg text-centre">
                <div className="text-2xl mb-2">♣</div>
                <div className="font-semibold">West</div>
              </div>
            </div>
          </div>
        </div>

        {playerCount < 4 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-centre">
            <p className="text-blue-800">
              Waiting for {4 - playerCount} more player{4 - playerCount !== 1 ? 's' : ''}...
            </p>
            <p className="text-sm text-blue-600 mt-2">
              Share this code with your friends:{' '}
              <button
                onClick={() => navigator.clipboard.writeText(roomId)}
                className="font-mono font-bold underline hover:text-blue-800"
              >
                {roomId}
              </button>
            </p>
          </div>
        )}

        {playerCount === 4 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-centre">
            <p className="text-green-800 font-semibold mb-4">All players ready!</p>
            <button
              onClick={onStartGame}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
            >
              Start game
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default WaitingRoom;

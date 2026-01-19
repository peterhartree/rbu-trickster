import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

// In production (same domain), use relative URL; in dev, use localhost
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.PROD ? '' : 'http://localhost:3001');

function Home() {
  const [joinCode, setJoinCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  const handleCreateGame = async () => {
    setIsCreating(true);
    try {
      const socket = io(SOCKET_URL);

      socket.emit('room:create', (response: { roomId: string; position: string }) => {
        navigate(`/game/${response.roomId}`);
        socket.disconnect();
      });
    } catch (error) {
      console.error('Failed to create game:', error);
      setIsCreating(false);
    }
  };

  const handleJoinGame = () => {
    if (joinCode.trim()) {
      navigate(`/game/${joinCode.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 to-green-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-4xl font-bold text-center text-green-800 mb-2">
          RBU Trickster
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Real-time multiplayer bridge with SAYC conventions
        </p>

        <div className="space-y-4">
          <button
            onClick={handleCreateGame}
            disabled={isCreating}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            {isCreating ? 'Creating game...' : 'Create new game'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          <div className="space-y-2">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleJoinGame()}
              placeholder="Enter game code"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={handleJoinGame}
              disabled={!joinCode.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Join game
            </button>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <h2 className="font-semibold text-gray-900 mb-2">How to play:</h2>
          <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
            <li>Create a game and share the code with 3 friends</li>
            <li>Once all 4 players join, the game starts automatically</li>
            <li>Follow standard bridge rules with SAYC conventions</li>
            <li>Scores calculated using duplicate/IMP scoring</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default Home;

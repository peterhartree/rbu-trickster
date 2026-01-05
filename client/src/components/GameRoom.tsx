import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import type { Position } from '@bridge/shared';

const SOCKET_URL = 'http://localhost:3001';

function GameRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [myPosition, setMyPosition] = useState<Position | null>(null);
  const [playerCount, setPlayerCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!roomId) return;

    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to server');

      // Join the room
      newSocket.emit('room:join', { roomId }, (response: any) => {
        if (response.success) {
          setMyPosition(response.position);
          setPlayerCount(Object.keys(response.players || {}).length);
        } else {
          console.error('Failed to join room:', response.error);
        }
      });
    });

    newSocket.on('room:player-joined', (data: any) => {
      setPlayerCount(data.playerCount);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from server');
    });

    return () => {
      newSocket.disconnect();
    };
  }, [roomId]);

  if (!roomId) {
    return <div className="p-4">Invalid room ID</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 to-green-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-4xl w-full">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-green-800 mb-2">Game Room</h1>
          <p className="text-grey-600">
            Room code: <span className="font-mono font-bold">{roomId}</span>
          </p>
        </div>

        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-grey-600">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          {myPosition && (
            <p className="text-lg mb-4">
              You are: <span className="font-bold">{myPosition}</span>
            </p>
          )}

          <div className="bg-grey-100 rounded-lg p-4">
            <p className="font-semibold mb-2">Players: {playerCount}/4</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white p-2 rounded">North</div>
              <div className="bg-white p-2 rounded">East</div>
              <div className="bg-white p-2 rounded">South</div>
              <div className="bg-white p-2 rounded">West</div>
            </div>
          </div>
        </div>

        {playerCount < 4 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-centre">
            <p className="text-blue-800">
              Waiting for {4 - playerCount} more player{4 - playerCount !== 1 ? 's' : ''}...
            </p>
            <p className="text-sm text-blue-600 mt-2">
              Share this code with your friends: <span className="font-mono font-bold">{roomId}</span>
            </p>
          </div>
        )}

        {playerCount === 4 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-centre">
            <p className="text-green-800 font-semibold">All players ready!</p>
            <button className="mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200">
              Start game
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default GameRoom;

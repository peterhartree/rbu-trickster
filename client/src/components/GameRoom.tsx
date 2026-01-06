import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import type { Position, GameState, BidAction, Card } from '@bridge/shared';
import WaitingRoom from './WaitingRoom';
import BiddingPanel from './BiddingPanel';
import PlayerHand from './PlayerHand';
import PlayArea from './PlayArea';
import ScoreBoard from './ScoreBoard';
import SAYCReference from './SAYCReference';
import HandHistory from './HandHistory';

const SOCKET_URL = 'http://localhost:3001';

function GameRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [myPosition, setMyPosition] = useState<Position | null>(null);
  const [gameState, setGameState] = useState<Partial<GameState> | null>(null);
  const [playerCount, setPlayerCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSAYCReference, setShowSAYCReference] = useState(false);
  const [showHandHistory, setShowHandHistory] = useState(false);

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
          setError(response.error || 'Failed to join room');
        }
      });
    });

    newSocket.on('room:player-joined', (data: any) => {
      setPlayerCount(data.playerCount);
    });

    newSocket.on('game:started', (state: Partial<GameState>) => {
      setGameState(state);
    });

    newSocket.on('bid:made', (data: any) => {
      setGameState(data.gameState);
    });

    newSocket.on('card:played', (data: any) => {
      setGameState(data.gameState);
    });

    newSocket.on('trick:complete', (data: any) => {
      setGameState(data.gameState);
    });

    newSocket.on('hand:complete', (data: any) => {
      setGameState((prev) => ({ ...prev, score: data.score, result: data.result }));
    });

    newSocket.on('room:error', (data: any) => {
      setError(data.message);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from server');
    });

    return () => {
      newSocket.disconnect();
    };
  }, [roomId]);

  const handleStartGame = () => {
    if (socket && roomId) {
      socket.emit('game:start', { roomId });
    }
  };

  const handlePlaceBid = (bid: BidAction) => {
    if (socket && roomId) {
      socket.emit('bid:place', { roomId, bid });
    }
  };

  const handlePlayCard = (card: Card) => {
    if (socket && roomId) {
      socket.emit('card:play', { roomId, card });
    }
  };

  if (!roomId) {
    return <div className="p-4">Invalid room ID</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-800 to-red-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-800 mb-4">Error</h1>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => setError(null)}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  // Waiting for players
  if (!gameState || gameState.phase === 'waiting') {
    return (
      <WaitingRoom
        roomId={roomId}
        myPosition={myPosition}
        playerCount={playerCount}
        isConnected={isConnected}
        onStartGame={handleStartGame}
      />
    );
  }

  // Game in progress
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 to-green-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-green-800">Contract Bridge</h1>
              <p className="text-sm text-gray-600">
                Room: <span className="font-mono">{roomId}</span> | You are:{' '}
                <span className="font-bold">{myPosition}</span>
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowHandHistory(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded transition-colors"
              >
                Hand History
              </button>
              <button
                onClick={() => setShowSAYCReference(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors"
              >
                SAYC Reference
              </button>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
                ></div>
                <span className="text-sm text-gray-600">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Game area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: Bidding/Controls */}
          <div className="lg:col-span-1">
            {gameState.phase === 'bidding' && (
              <BiddingPanel
                gameState={gameState}
                myPosition={myPosition}
                onPlaceBid={handlePlaceBid}
              />
            )}
            {(gameState.phase === 'playing' || gameState.phase === 'complete') && (
              <ScoreBoard gameState={gameState} />
            )}
          </div>

          {/* Center: Play area */}
          <div className="lg:col-span-2">
            <PlayArea gameState={gameState} myPosition={myPosition} />
          </div>
        </div>

        {/* Player's hand */}
        {myPosition && gameState.hands && (
          <div className="mt-4">
            <PlayerHand
              hand={gameState.hands[myPosition] || []}
              myPosition={myPosition}
              gameState={gameState}
              onPlayCard={handlePlayCard}
            />
          </div>
        )}
      </div>

      {/* SAYC Reference Modal */}
      <SAYCReference isOpen={showSAYCReference} onClose={() => setShowSAYCReference(false)} />

      {/* Hand History Modal */}
      {roomId && (
        <HandHistory
          roomId={roomId}
          isOpen={showHandHistory}
          onClose={() => setShowHandHistory(false)}
        />
      )}
    </div>
  );
}

export default GameRoom;

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
import TurnIndicator from './TurnIndicator';
import HandReview from './HandReview';

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
      // Update with full game state including originalHands for review
      if (data.gameState) {
        setGameState(data.gameState);
      } else {
        setGameState((prev) => ({ ...prev, score: data.score, result: data.result }));
      }
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

  const handleNewHand = () => {
    if (socket && roomId) {
      socket.emit('game:new-hand', { roomId });
    }
  };

  if (!roomId) {
    return <div className="p-4 text-deco-cream">Invalid room ID</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-deco-navy flex items-center justify-center p-4">
        <div className="bg-deco-midnight rounded-lg shadow-deco-lg p-8 max-w-md w-full border border-deco-gold/20 deco-corner">
          <h1 className="text-2xl font-display font-bold text-deco-gold mb-4">Error</h1>
          <p className="text-deco-cream/80 mb-6">{error}</p>
          <button
            onClick={() => setError(null)}
            className="w-full bg-deco-gold hover:bg-deco-gold-light text-deco-navy font-semibold py-3 px-6 rounded transition-colors"
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

  // Game in progress - Art Deco design
  return (
    <div className="h-screen overflow-hidden bg-deco-navy flex flex-col p-3">
      {/* Art Deco Header */}
      <header className="shrink-0 bg-deco-midnight rounded-lg shadow-deco border border-deco-gold/20 px-5 py-3 mb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {/* Decorative element */}
            <div className="hidden sm:flex items-center space-x-1">
              <div className="w-2 h-2 bg-deco-gold rotate-45" />
              <div className="w-1 h-6 bg-gradient-to-b from-deco-gold to-transparent" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-deco-gold tracking-wide">
                Contract Bridge
              </h1>
              <p className="text-xs text-deco-cream/60 tracking-widest uppercase">
                Room <span className="font-mono text-deco-gold/80">{roomId}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowHandHistory(true)}
              className="bg-deco-accent hover:bg-deco-accent/80 text-deco-cream text-sm font-semibold py-1.5 px-4 rounded border border-deco-gold/20 transition-colors"
            >
              History
            </button>
            <button
              onClick={() => setShowSAYCReference(true)}
              className="bg-deco-accent hover:bg-deco-accent/80 text-deco-cream text-sm font-semibold py-1.5 px-4 rounded border border-deco-gold/20 transition-colors"
            >
              SAYC
            </button>
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-deco-navy/50 rounded border border-deco-gold/10">
              <div
                className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}
              />
              <span className="text-xs text-deco-cream/60">
                {isConnected ? 'Live' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
        {/* Gold underline accent */}
        <div className="mt-3 h-px bg-gradient-to-r from-transparent via-deco-gold/40 to-transparent" />
      </header>

      {/* Main game area */}
      <main className="flex-1 min-h-0 grid grid-cols-12 gap-3">
        {gameState.phase === 'complete' ? (
          /* Hand Review - full width when complete */
          <div className="col-span-12">
            <HandReview gameState={gameState} onNewHand={handleNewHand} />
          </div>
        ) : (
          <>
            {/* Left column: Bidding/Score (3 cols) */}
            <div className="col-span-3 overflow-y-auto">
              {gameState.phase === 'bidding' && (
                <BiddingPanel
                  gameState={gameState}
                  myPosition={myPosition}
                  onPlaceBid={handlePlaceBid}
                />
              )}
              {gameState.phase === 'playing' && (
                <ScoreBoard gameState={gameState} />
              )}
            </div>

            {/* Centre column: Play area (6 cols) */}
            <div className="col-span-6">
              <PlayArea gameState={gameState} myPosition={myPosition} />
            </div>

            {/* Right column: Turn indicator (3 cols) */}
            <div className="col-span-3">
              <TurnIndicator gameState={gameState} myPosition={myPosition} />
            </div>
          </>
        )}
      </main>

      {/* Footer: Player's hand (hidden during review) */}
      {myPosition && gameState.hands && gameState.phase !== 'complete' && (
        <footer className="shrink-0 mt-3">
          <PlayerHand
            hand={gameState.hands[myPosition] || []}
            myPosition={myPosition}
            gameState={gameState}
            onPlayCard={handlePlayCard}
          />
        </footer>
      )}

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

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import type { Position, GameState, BidAction, Card, SessionScore, Trick } from '@bridge/shared';
import WaitingRoom from './WaitingRoom';
import BiddingPanel from './BiddingPanel';
import PlayerHand from './PlayerHand';
import PlayArea from './PlayArea';
import ScoreBoard from './ScoreBoard';
import SAYCReference from './SAYCReference';
import HandHistory from './HandHistory';
import TurnIndicator from './TurnIndicator';
import HandReview from './HandReview';
import SessionScoreDisplay from './SessionScoreDisplay';

// In production (same domain), use relative URL; in dev, use localhost
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.PROD ? '' : 'http://localhost:3001');

// Session storage key for player identity
const PLAYER_ID_KEY = 'bridge_player_id';
const SESSION_KEY_PREFIX = 'bridge_session_';

// Get or create a persistent player ID
function getOrCreatePlayerId(): string {
  let playerId = localStorage.getItem(PLAYER_ID_KEY);
  if (!playerId) {
    playerId = `player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(PLAYER_ID_KEY, playerId);
  }
  return playerId;
}

// Store session info for a room
function storeSession(roomId: string, position: Position, playerId: string) {
  const session = { roomId, position, playerId, timestamp: Date.now() };
  localStorage.setItem(`${SESSION_KEY_PREFIX}${roomId}`, JSON.stringify(session));
}

// Get stored session for a room
function getStoredSession(roomId: string): { position: Position; playerId: string } | null {
  try {
    const data = localStorage.getItem(`${SESSION_KEY_PREFIX}${roomId}`);
    if (data) {
      const session = JSON.parse(data);
      // Session valid for 24 hours
      if (Date.now() - session.timestamp < 24 * 60 * 60 * 1000) {
        return { position: session.position, playerId: session.playerId };
      }
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

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
  const [sessionScore, setSessionScore] = useState<SessionScore | null>(null);
  const [lastCompletedTrick, setLastCompletedTrick] = useState<Trick | null>(null);
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('bridge_player_name') || '');

  useEffect(() => {
    if (!roomId) return;

    // Get stored session or create new player ID
    const storedSession = getStoredSession(roomId);
    const playerId = storedSession?.playerId || getOrCreatePlayerId();

    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to server');

      // Join the room with our persistent player ID
      const savedName = localStorage.getItem('bridge_player_name') || '';
      newSocket.emit('room:join', { roomId, playerId, playerName: savedName }, (response: any) => {
        if (response.success) {
          setMyPosition(response.position);
          setPlayerCount(Object.keys(response.players || {}).length);

          // Store session for reconnection
          storeSession(roomId, response.position, response.playerId || playerId);

          // If game is in progress, restore state immediately from join response
          if (response.gameInProgress && response.gameState) {
            console.log('Reconnecting - restoring game state from join response');
            setGameState(response.gameState);
            if (response.gameState.session) {
              setSessionScore(response.gameState.session);
            }
          }
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
      // Update session from game state if available
      if (state.session) {
        setSessionScore(state.session);
      }
    });

    newSocket.on('bid:made', (data: any) => {
      setGameState(data.gameState);
    });

    newSocket.on('card:played', (data: any) => {
      setGameState(data.gameState);
    });

    newSocket.on('trick:complete', (data: any) => {
      // Show the completed trick for a moment before updating to new trick
      const completedTrick = data.gameState?.cardPlay?.tricks?.slice(-1)[0];
      if (completedTrick) {
        setLastCompletedTrick(completedTrick);
        setTimeout(() => {
          setLastCompletedTrick(null);
          setGameState(data.gameState);
        }, 1500);
      } else {
        setGameState(data.gameState);
      }
    });

    newSocket.on('hand:complete', (data: any) => {
      // Update with full game state including originalHands for review
      if (data.gameState) {
        setGameState(data.gameState);
      } else {
        setGameState((prev) => ({ ...prev, score: data.score, result: data.result }));
      }
      // Update session score
      if (data.sessionScore) {
        setSessionScore(data.sessionScore);
      }
    });

    newSocket.on('session:complete', (data: any) => {
      if (data.sessionScore) {
        setSessionScore(data.sessionScore);
      }
    });

    newSocket.on('session:started', (data: any) => {
      if (data.sessionScore) {
        setSessionScore(data.sessionScore);
      }
    });

    newSocket.on('room:error', (data: any) => {
      setError(data.message);
    });

    // Handle sync response for reconnection
    newSocket.on('sync:response', (data: any) => {
      console.log('Received sync response:', data);
      if (data.gameState) {
        setGameState(data.gameState);
        if (data.gameState.session) {
          setSessionScore(data.gameState.session);
        }
      }
      if (data.yourPosition) {
        setMyPosition(data.yourPosition);
      }
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

  const handlePlayerNameChange = (name: string) => {
    setPlayerName(name);
    localStorage.setItem('bridge_player_name', name);
    if (socket && roomId) {
      socket.emit('player:set-name', { roomId, name });
    }
  };

  const handleNewSession = () => {
    if (socket && roomId) {
      socket.emit('session:new', { roomId });
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
        playerName={playerName}
        onPlayerNameChange={handlePlayerNameChange}
      />
    );
  }

  // Game in progress - Art Deco design
  return (
    <div className="h-screen overflow-hidden bg-deco-navy flex flex-col p-2">
      {/* Art Deco Header */}
      <header className="shrink-0 bg-deco-midnight rounded-lg shadow-deco border border-deco-gold/20 px-4 py-2 mb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {/* Decorative element */}
            <div className="hidden sm:flex items-center space-x-1">
              <div className="w-2 h-2 bg-deco-gold rotate-45" />
              <div className="w-1 h-6 bg-gradient-to-b from-deco-gold to-transparent" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-deco-gold tracking-wide">
                RBU Trickster
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

      {/* Session Score Display */}
      {sessionScore && (
        <div className="shrink-0 mb-2">
          <SessionScoreDisplay session={sessionScore} />
        </div>
      )}

      {/* Main game area */}
      <main className="flex-1 min-h-0 grid grid-cols-12 gap-2">
        {gameState.phase === 'complete' ? (
          /* Hand Review - full width when complete */
          <div className="col-span-12">
            <HandReview
              gameState={gameState}
              sessionScore={sessionScore}
              onNewHand={handleNewHand}
              onNewSession={handleNewSession}
            />
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
              <PlayArea gameState={gameState} myPosition={myPosition} onPlayCard={handlePlayCard} lastCompletedTrick={lastCompletedTrick} />
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
        <footer className="shrink-0 mt-2">
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

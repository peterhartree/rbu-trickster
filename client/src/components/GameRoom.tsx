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
import { useSoundEffects } from '../hooks/useSoundEffects';

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
  const [reviewableTrick, setReviewableTrick] = useState<Trick | null>(null);
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('bridge_player_name') || '');
  const { cardPlayed: playCardSound, trumpPlayed: playTrumpSound, yourTurn: playYourTurnSound, trickWon: playTrickWonSound, bidPlaced: playBidSound } = useSoundEffects();

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
      playBidSound();
    });

    newSocket.on('card:played', (data: any) => {
      // Detect trump ruff: played card suit = contract strain ≠ led suit
      const cardPlay = data.gameState?.cardPlay;
      const contract = data.gameState?.contract;
      const currentTrick = cardPlay?.currentTrick;
      if (contract && currentTrick && currentTrick.cards.length >= 2) {
        const ledSuit = currentTrick.cards[0]?.card?.suit;
        const lastCard = currentTrick.cards[currentTrick.cards.length - 1]?.card;
        const trumpStrain = contract.strain;
        // Map strain to suit (NT has no trump suit)
        const strainToSuit: Record<string, string> = { C: 'C', D: 'D', H: 'H', S: 'S' };
        const trumpSuit = strainToSuit[trumpStrain];
        if (trumpSuit && lastCard?.suit === trumpSuit && ledSuit !== trumpSuit) {
          playTrumpSound();
        } else {
          playCardSound();
        }
      } else {
        playCardSound();
      }
      setGameState(data.gameState);
    });

    newSocket.on('trick:complete', (data: any) => {
      playTrickWonSound();
      // Show the completed trick for a moment before updating to new trick
      const completedTrick = data.gameState?.cardPlay?.tricks?.slice(-1)[0];
      if (completedTrick) {
        setLastCompletedTrick(completedTrick);
        setReviewableTrick(completedTrick);
        setTimeout(() => {
          setLastCompletedTrick(null);
          setGameState(data.gameState);
        }, 2000);
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

    // Keep player info in sync on reconnection or name changes
    newSocket.on('player:updated', (data: any) => {
      if (data.players) {
        setGameState((prev) => prev ? { ...prev, players: data.players } : prev);
      }
    });

    newSocket.on('player:name-updated', (data: any) => {
      if (data.position && data.name !== undefined) {
        const pos = data.position as Position;
        setGameState((prev) => {
          if (!prev?.players) return prev;
          return {
            ...prev,
            players: {
              ...prev.players,
              [pos]: { ...prev.players[pos], name: data.name },
            },
          };
        });
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
  }, [roomId, playBidSound, playCardSound, playTrickWonSound]);

  // Play sound when it becomes your turn
  useEffect(() => {
    if (!gameState || !myPosition) return;
    const currentTurn = gameState.phase === 'bidding' ? gameState.currentBidder : gameState.currentPlayer;
    const dummyPosition = gameState.cardPlay?.dummy;
    const declarerPosition = gameState.contract?.declarer;
    const iAmDummy = gameState.phase === 'playing' && myPosition === dummyPosition && myPosition !== declarerPosition;

    // Don't play sound when you're dummy
    if (iAmDummy) return;

    // Play sound for declarer when it's dummy's turn
    if (gameState.phase === 'playing' && myPosition === declarerPosition && currentTurn === dummyPosition) {
      playYourTurnSound();
      return;
    }

    if (currentTurn === myPosition) {
      playYourTurnSound();
    }
  }, [gameState?.currentBidder, gameState?.currentPlayer, myPosition, playYourTurnSound, gameState?.phase, gameState?.cardPlay?.dummy, gameState?.contract?.declarer]);

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
    <div className="h-screen overflow-y-auto md:overflow-hidden bg-deco-navy flex flex-col p-2">
      {/* Compact header with session info */}
      <header className="shrink-0 bg-deco-midnight rounded-lg shadow-deco border border-deco-gold/20 px-3 py-1.5 mb-2">
        <div className="flex items-center justify-between gap-3">
          {/* Title */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-2 h-2 bg-deco-gold rotate-45 hidden sm:block" />
            <h1 className="text-lg font-display font-bold text-deco-gold tracking-wide">
              RBU Trickster
            </h1>
          </div>

          {/* Session score inline */}
          {sessionScore && (
            <div className="flex items-center gap-3 flex-1 justify-center">
              <span className="text-xs text-deco-cream/50">Hand {sessionScore.handNumber}/{sessionScore.totalHands}</span>
              <div className="flex items-center gap-1">
                {Array.from({ length: sessionScore.totalHands }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < sessionScore.handNumber ? 'bg-deco-gold' : 'bg-deco-navy border border-deco-gold/30'
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className={`font-display font-bold ${sessionScore.nsTotal >= sessionScore.ewTotal ? 'text-deco-gold' : 'text-deco-cream/70'}`}>
                  NS {sessionScore.nsTotal}
                </span>
                <span className="text-deco-gold/30">·</span>
                <span className={`font-display font-bold ${sessionScore.ewTotal > sessionScore.nsTotal ? 'text-deco-gold' : 'text-deco-cream/70'}`}>
                  EW {sessionScore.ewTotal}
                </span>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowHandHistory(true)}
              className="bg-deco-accent hover:bg-deco-accent/80 text-deco-cream text-xs font-semibold py-1 px-3 rounded border border-deco-gold/20 transition-colors"
            >
              History
            </button>
            <button
              onClick={() => setShowSAYCReference(true)}
              className="bg-deco-accent hover:bg-deco-accent/80 text-deco-cream text-xs font-semibold py-1 px-3 rounded border border-deco-gold/20 transition-colors"
            >
              SAYC
            </button>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-deco-navy/50 rounded border border-deco-gold/10">
              <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className="text-[10px] text-deco-cream/60">{isConnected ? 'Live' : 'Offline'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main game area */}
      <main className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 gap-2">
        {gameState.phase === 'complete' ? (
          /* Hand Review - full width when complete */
          <div className="md:col-span-12">
            <HandReview
              gameState={gameState}
              sessionScore={sessionScore}
              onNewHand={handleNewHand}
              onNewSession={handleNewSession}
            />
          </div>
        ) : (
          <>
            {/* Left column: Bidding/Score */}
            <div className="md:col-span-3 overflow-y-auto">
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

            {/* Centre column: Play area */}
            <div className="md:col-span-6">
              <PlayArea gameState={gameState} myPosition={myPosition} onPlayCard={handlePlayCard} lastCompletedTrick={lastCompletedTrick} reviewableTrick={reviewableTrick} />
            </div>

            {/* Right column: Turn indicator */}
            <div className="md:col-span-3">
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

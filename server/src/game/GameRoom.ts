import type {
  Position,
  Player,
  GameState,
  GamePhase,
  BidAction,
  Card,
  BidCall,
  SessionScore,
} from '@bridge/shared';
import { Position as Pos, GamePhase as Phase } from '@bridge/shared';
import { dealCards, getNextPosition } from '../domain/cards/deck.js';
import { gameReducer } from '../domain/game-state/reducer.js';
import { HandHistory } from './HandHistory.js';
import { SessionManager } from './SessionManager.js';

export class GameRoom {
  public roomId: string;
  public players: Partial<Record<Position, Player>> = {};
  private gameState: GameState;
  private lastActivity: number = Date.now();
  private handHistory: HandHistory;
  private sessionManager: SessionManager;
  private gameStartTime: number = 0;

  constructor(roomId: string) {
    this.roomId = roomId;
    this.handHistory = new HandHistory();
    this.sessionManager = new SessionManager();
    this.gameState = {
      roomId,
      phase: Phase.WAITING,
      players: {},
      hands: {
        [Pos.NORTH]: [],
        [Pos.SOUTH]: [],
        [Pos.EAST]: [],
        [Pos.WEST]: [],
      },
    };
  }

  addPlayer(socketId: string, playerId?: string): Position {
    const positions: Position[] = [Pos.NORTH, Pos.EAST, Pos.SOUTH, Pos.WEST];

    // If playerId provided, check if this player was already in the room (reconnection)
    if (playerId) {
      for (const position of positions) {
        const existingPlayer = this.players[position];
        if (existingPlayer && existingPlayer.id === playerId) {
          // Reconnecting player - update their socket and mark connected
          existingPlayer.socketId = socketId;
          existingPlayer.connected = true;
          this.gameState.players[position] = existingPlayer;
          this.lastActivity = Date.now();
          console.log(`Player ${playerId} reconnected to position ${position} in room ${this.roomId}`);
          return position;
        }
      }
    }

    // Generate a new playerId if not provided
    const newPlayerId = playerId || `player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // First, try to find an empty position
    for (const position of positions) {
      if (!this.players[position]) {
        const player: Player = {
          id: newPlayerId,
          socketId,
          position,
          connected: true,
        };

        this.players[position] = player;
        this.gameState.players[position] = player;
        this.lastActivity = Date.now();
        return position;
      }
    }

    // No empty positions - check for disconnected players to replace (only if no playerId match found above)
    for (const position of positions) {
      const existingPlayer = this.players[position];
      if (existingPlayer && !existingPlayer.connected) {
        // Allow takeover of abandoned slot
        const player: Player = {
          id: newPlayerId,
          socketId,
          position,
          connected: true,
        };

        this.players[position] = player;
        this.gameState.players[position] = player;
        this.lastActivity = Date.now();
        console.log(`New player took over disconnected position ${position} in room ${this.roomId}`);
        return position;
      }
    }

    throw new Error('Room is full');
  }

  getPlayerById(playerId: string): Player | null {
    for (const player of Object.values(this.players)) {
      if (player?.id === playerId) {
        return player;
      }
    }
    return null;
  }

  getPlayerPosition(socketId: string): Position | null {
    for (const [position, player] of Object.entries(this.players)) {
      if (player?.socketId === socketId) {
        return position as Position;
      }
    }
    return null;
  }

  startGame(): GameState {
    // Check all positions filled
    if (Object.keys(this.players).length < 4) {
      throw new Error('Need 4 players to start');
    }

    // Start a new hand in the session
    const session = this.sessionManager.startHand();

    // Deal cards starting with North as dealer
    const deal = dealCards(Pos.NORTH);

    // Use reducer to transition to bidding phase
    this.gameState = gameReducer(this.gameState, {
      type: 'DEAL_CARDS',
      deal,
    });

    // Add session to game state
    this.gameState.session = session;

    this.gameStartTime = Date.now();
    this.lastActivity = Date.now();
    return this.gameState;
  }

  placeBid(socketId: string, bid: BidAction) {
    const position = this.getPlayerPosition(socketId);
    if (!position) {
      throw new Error('Player not in room');
    }

    const bidCall: BidCall = {
      position,
      action: bid,
      timestamp: Date.now(),
    };

    // Use reducer to handle bid
    this.gameState = gameReducer(this.gameState, {
      type: 'MAKE_BID',
      bid: bidCall,
    });

    this.lastActivity = Date.now();
    return { gameState: this.gameState, position };
  }

  playCard(socketId: string, card: Card) {
    const socketPosition = this.getPlayerPosition(socketId);
    if (!socketPosition) {
      throw new Error('Player not in room');
    }

    // Determine the actual playing position
    // Declarer can play cards from dummy's hand when it's dummy's turn
    let playingPosition = socketPosition;
    const currentPlayer = this.gameState.currentPlayer;
    const dummyPosition = this.gameState.cardPlay?.dummy;
    const declarerPosition = this.gameState.cardPlay?.declarer;

    if (
      dummyPosition &&
      currentPlayer === dummyPosition &&
      socketPosition === declarerPosition
    ) {
      // Declarer is playing dummy's cards
      playingPosition = dummyPosition;
    }

    // Store trick count before playing card
    const tricksBeforePlay = this.gameState.cardPlay?.tricks.length || 0;

    // Use reducer to handle card play
    this.gameState = gameReducer(this.gameState, {
      type: 'PLAY_CARD',
      card,
      position: playingPosition,
    });

    // Check if trick was completed
    const tricksAfterPlay = this.gameState.cardPlay?.tricks.length || 0;
    const trickComplete = tricksAfterPlay > tricksBeforePlay;

    // Check if hand is complete and store history
    if (this.gameState.phase === Phase.COMPLETE && this.gameState.result && this.gameState.score && this.gameState.deal && this.gameState.bidding && this.gameState.cardPlay) {
      const duration = Date.now() - this.gameStartTime;

      // Record score in session
      const session = this.sessionManager.recordScore(this.gameState.score);
      this.gameState.session = session;

      this.handHistory.storeHand(
        this.gameState.deal,
        this.gameState.bidding,
        this.gameState.cardPlay.tricks,
        this.gameState.result,
        this.gameState.score,
        {
          players: {
            north: this.players[Pos.NORTH]?.id || 'North',
            east: this.players[Pos.EAST]?.id || 'East',
            south: this.players[Pos.SOUTH]?.id || 'South',
            west: this.players[Pos.WEST]?.id || 'West',
          },
          duration,
        }
      );
    }

    this.lastActivity = Date.now();
    return { gameState: this.gameState, position: playingPosition, trickComplete };
  }

  handleDisconnect(socketId: string) {
    const position = this.getPlayerPosition(socketId);
    if (position && this.players[position]) {
      this.players[position]!.connected = false;
      console.log(`Player ${position} disconnected from room ${this.roomId}`);
    }
  }

  getStateForPlayer(position: Position): Partial<GameState> {
    // Return filtered state based on game phase
    const dummyPosition = this.gameState.cardPlay?.dummy;

    // Dummy is revealed after opening lead (at least one card played)
    const cardsPlayed = this.gameState.cardPlay?.currentTrick?.cards?.length || 0;
    const tricksPlayed = this.gameState.cardPlay?.tricks?.length || 0;
    const openingLeadPlayed = cardsPlayed > 0 || tricksPlayed > 0;
    const showDummy = this.gameState.phase === Phase.PLAYING && dummyPosition && openingLeadPlayed;

    // In COMPLETE phase, show all original hands for review
    const isReviewPhase = this.gameState.phase === Phase.COMPLETE;

    return {
      ...this.gameState,
      // Include original deal for review phase
      originalHands: isReviewPhase && this.gameState.deal ? {
        [Pos.NORTH]: this.gameState.deal.north,
        [Pos.SOUTH]: this.gameState.deal.south,
        [Pos.EAST]: this.gameState.deal.east,
        [Pos.WEST]: this.gameState.deal.west,
      } : undefined,
      hands: {
        [Pos.NORTH]:
          position === Pos.NORTH || (showDummy && dummyPosition === Pos.NORTH) || isReviewPhase
            ? this.gameState.hands[Pos.NORTH]
            : [],
        [Pos.SOUTH]:
          position === Pos.SOUTH || (showDummy && dummyPosition === Pos.SOUTH) || isReviewPhase
            ? this.gameState.hands[Pos.SOUTH]
            : [],
        [Pos.EAST]:
          position === Pos.EAST || (showDummy && dummyPosition === Pos.EAST) || isReviewPhase
            ? this.gameState.hands[Pos.EAST]
            : [],
        [Pos.WEST]:
          position === Pos.WEST || (showDummy && dummyPosition === Pos.WEST) || isReviewPhase
            ? this.gameState.hands[Pos.WEST]
            : [],
      },
    };
  }

  getFullState(): GameState {
    return this.gameState;
  }

  dealNewHand(): GameState {
    // Start a new hand in the session
    const session = this.sessionManager.startHand();

    // Get next dealer (rotate clockwise from previous dealer)
    const previousDealer = this.gameState.deal?.dealer || Pos.NORTH;
    const nextDealer = getNextPosition(previousDealer);

    // Deal new cards
    const deal = dealCards(nextDealer);

    // Use reducer to transition to bidding phase
    this.gameState = gameReducer(this.gameState, {
      type: 'DEAL_CARDS',
      deal,
    });

    // Add session to game state
    this.gameState.session = session;

    this.gameStartTime = Date.now();
    this.lastActivity = Date.now();
    return this.gameState;
  }

  isInactive(): boolean {
    // Consider room inactive if no activity for 30 minutes
    const INACTIVE_THRESHOLD = 30 * 60 * 1000;
    return Date.now() - this.lastActivity > INACTIVE_THRESHOLD;
  }

  getHandHistory() {
    return this.handHistory;
  }

  getSessionScore(): SessionScore {
    return this.sessionManager.getSession();
  }

  resetSession(): SessionScore {
    const session = this.sessionManager.resetSession();
    this.gameState.session = session;
    return session;
  }

  isSessionComplete(): boolean {
    return this.sessionManager.isSessionComplete();
  }
}

import type {
  Position,
  Player,
  GameState,
  GamePhase,
  BidAction,
  Card,
  BidCall,
} from '@bridge/shared';
import { Position as Pos, GamePhase as Phase } from '@bridge/shared';
import { dealCards, getNextPosition } from '../domain/cards/deck.js';
import { gameReducer } from '../domain/game-state/reducer.js';
import { HandHistory } from './HandHistory.js';

export class GameRoom {
  public roomId: string;
  public players: Partial<Record<Position, Player>> = {};
  private gameState: GameState;
  private lastActivity: number = Date.now();
  private handHistory: HandHistory;
  private gameStartTime: number = 0;

  constructor(roomId: string) {
    this.roomId = roomId;
    this.handHistory = new HandHistory();
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

  addPlayer(socketId: string): Position {
    const positions: Position[] = [Pos.NORTH, Pos.EAST, Pos.SOUTH, Pos.WEST];

    // First, try to find an empty position
    for (const position of positions) {
      if (!this.players[position]) {
        const player: Player = {
          id: socketId,
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

    // No empty positions - check for disconnected players to replace
    for (const position of positions) {
      const existingPlayer = this.players[position];
      if (existingPlayer && !existingPlayer.connected) {
        // Allow reconnection to this slot
        const player: Player = {
          id: socketId,
          socketId,
          position,
          connected: true,
        };

        this.players[position] = player;
        this.gameState.players[position] = player;
        this.lastActivity = Date.now();
        console.log(`Player reconnected to position ${position} in room ${this.roomId}`);
        return position;
      }
    }

    throw new Error('Room is full');
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

    // Deal cards starting with North as dealer
    const deal = dealCards(Pos.NORTH);

    // Use reducer to transition to bidding phase
    this.gameState = gameReducer(this.gameState, {
      type: 'DEAL_CARDS',
      deal,
    });

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
    const position = this.getPlayerPosition(socketId);
    if (!position) {
      throw new Error('Player not in room');
    }

    // Store trick count before playing card
    const tricksBeforePlay = this.gameState.cardPlay?.tricks.length || 0;

    // Use reducer to handle card play
    this.gameState = gameReducer(this.gameState, {
      type: 'PLAY_CARD',
      card,
      position,
    });

    // Check if trick was completed
    const tricksAfterPlay = this.gameState.cardPlay?.tricks.length || 0;
    const trickComplete = tricksAfterPlay > tricksBeforePlay;

    // Check if hand is complete and store history
    if (this.gameState.phase === Phase.COMPLETE && this.gameState.result && this.gameState.score && this.gameState.deal && this.gameState.bidding && this.gameState.cardPlay) {
      const duration = Date.now() - this.gameStartTime;

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
    return { gameState: this.gameState, position, trickComplete };
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
}

import type {
  Position,
  Player,
  GameState,
  GamePhase,
  BidAction,
  Card,
} from '@bridge/shared';
import { Position as Pos, GamePhase as Phase } from '@bridge/shared';

export class GameRoom {
  public roomId: string;
  public players: Partial<Record<Position, Player>> = {};
  private gameState: GameState;
  private lastActivity: number = Date.now();

  constructor(roomId: string) {
    this.roomId = roomId;
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
    // Assign next available position
    const positions: Position[] = [Pos.NORTH, Pos.EAST, Pos.SOUTH, Pos.WEST];

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

    // TODO: Implement actual game start logic (deal cards, etc.)
    // For now, just transition to bidding phase
    this.gameState.phase = Phase.BIDDING;
    this.lastActivity = Date.now();

    return this.gameState;
  }

  placeBid(socketId: string, bid: BidAction) {
    const position = this.getPlayerPosition(socketId);
    if (!position) {
      throw new Error('Player not in room');
    }

    // TODO: Implement bid validation and state update
    this.lastActivity = Date.now();

    return { gameState: this.gameState, position };
  }

  playCard(socketId: string, card: Card) {
    const position = this.getPlayerPosition(socketId);
    if (!position) {
      throw new Error('Player not in room');
    }

    // TODO: Implement card play validation and state update
    this.lastActivity = Date.now();

    return { gameState: this.gameState, position, trickComplete: false };
  }

  handleDisconnect(socketId: string) {
    const position = this.getPlayerPosition(socketId);
    if (position && this.players[position]) {
      this.players[position]!.connected = false;
      console.log(`Player ${position} disconnected from room ${this.roomId}`);
    }
  }

  getStateForPlayer(position: Position): Partial<GameState> {
    // Return filtered state (only show player's own hand until dummy is exposed)
    return {
      ...this.gameState,
      hands: {
        [Pos.NORTH]: position === Pos.NORTH ? this.gameState.hands[Pos.NORTH] : [],
        [Pos.SOUTH]: position === Pos.SOUTH ? this.gameState.hands[Pos.SOUTH] : [],
        [Pos.EAST]: position === Pos.EAST ? this.gameState.hands[Pos.EAST] : [],
        [Pos.WEST]: position === Pos.WEST ? this.gameState.hands[Pos.WEST] : [],
      },
    };
  }

  isInactive(): boolean {
    // Consider room inactive if no activity for 30 minutes
    const INACTIVE_THRESHOLD = 30 * 60 * 1000;
    return Date.now() - this.lastActivity > INACTIVE_THRESHOLD;
  }
}

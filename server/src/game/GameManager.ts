import { nanoid } from 'nanoid';
import { GameRoom } from './GameRoom.js';
import type { Position, BidAction, Card, GameState } from '@bridge/shared';

export class GameManager {
  private rooms: Map<string, GameRoom> = new Map();

  createRoom(socketId: string): { roomId: string; position: Position } {
    const roomId = nanoid(8);
    const room = new GameRoom(roomId);
    this.rooms.set(roomId, room);

    const position = room.addPlayer(socketId);
    return { roomId, position };
  }

  joinRoom(roomId: string, socketId: string) {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    const position = room.addPlayer(socketId);
    return { position, players: room.players };
  }

  getRoom(roomId: string): GameRoom | undefined {
    return this.rooms.get(roomId);
  }

  startGame(roomId: string): GameState {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    return room.startGame();
  }

  placeBid(roomId: string, socketId: string, bid: BidAction) {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    return room.placeBid(socketId, bid);
  }

  playCard(roomId: string, socketId: string, card: Card) {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    return room.playCard(socketId, card);
  }

  handleDisconnect(socketId: string) {
    // Mark player as disconnected but keep room alive
    for (const room of this.rooms.values()) {
      room.handleDisconnect(socketId);
    }
  }

  // Optional: cleanup inactive rooms
  cleanupInactive() {
    for (const [id, room] of this.rooms) {
      if (room.isInactive()) {
        this.rooms.delete(id);
        console.log(`🧹 Cleaned up inactive room: ${id}`);
      }
    }
  }
}

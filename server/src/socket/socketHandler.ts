import { Server, Socket } from 'socket.io';
import { SOCKET_EVENTS } from './events.js';
import { GameManager } from '../game/GameManager.js';
import type { Position, BidAction, Card } from '@bridge/shared';

const gameManager = new GameManager();

export function setupSocketHandlers(io: Server) {
  io.on(SOCKET_EVENTS.CONNECTION, (socket: Socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    // Create room
    socket.on(SOCKET_EVENTS.ROOM_CREATE, (callback) => {
      try {
        const { roomId, position } = gameManager.createRoom(socket.id);
        socket.join(roomId);

        callback({ roomId, position });
        console.log(`🎲 Room created: ${roomId}, player position: ${position}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create room';
        socket.emit(SOCKET_EVENTS.ROOM_ERROR, { message });
      }
    });

    // Join room
    socket.on(SOCKET_EVENTS.ROOM_JOIN, ({ roomId }, callback) => {
      try {
        const { position, players } = gameManager.joinRoom(roomId, socket.id);
        socket.join(roomId);

        // Notify joiner
        callback({ success: true, position });

        // Notify others in room
        socket.to(roomId).emit(SOCKET_EVENTS.ROOM_PLAYER_JOINED, {
          playerPosition: position,
          playerCount: Object.keys(players).length,
        });

        console.log(`👤 Player joined room ${roomId} as ${position}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to join room';
        callback({ success: false, error: message });
      }
    });

    // Start game
    socket.on(SOCKET_EVENTS.GAME_START, ({ roomId }) => {
      try {
        const gameState = gameManager.startGame(roomId);

        // Send full state to all players (with their respective hands)
        const room = gameManager.getRoom(roomId);
        if (room) {
          for (const position of Object.keys(room.players)) {
            const playerPosition = position as Position;
            const player = room.players[playerPosition];
            if (player) {
              const filteredState = room.getStateForPlayer(playerPosition);
              io.to(player.socketId).emit(SOCKET_EVENTS.GAME_STARTED, {
                hands: { [playerPosition]: gameState.hands[playerPosition] },
                dealer: gameState.dealer,
                gameState: filteredState,
              });
            }
          }
        }

        console.log(`🃏 Game started in room ${roomId}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to start game';
        socket.emit(SOCKET_EVENTS.ROOM_ERROR, { message });
      }
    });

    // Place bid
    socket.on(SOCKET_EVENTS.BID_PLACE, ({ roomId, bid }: { roomId: string; bid: BidAction }) => {
      try {
        const { gameState, position } = gameManager.placeBid(roomId, socket.id, bid);

        // Broadcast updated state to all players
        io.to(roomId).emit(SOCKET_EVENTS.BID_MADE, {
          position,
          bid,
          gameState,
        });

        console.log(`🎺 Bid placed in room ${roomId}: ${position} - ${bid.type}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to place bid';
        socket.emit(SOCKET_EVENTS.ROOM_ERROR, { message });
      }
    });

    // Play card
    socket.on(SOCKET_EVENTS.CARD_PLAY, ({ roomId, card }: { roomId: string; card: Card }) => {
      try {
        const { gameState, position, trickComplete } = gameManager.playCard(
          roomId,
          socket.id,
          card
        );

        // Broadcast card played
        io.to(roomId).emit(SOCKET_EVENTS.CARD_PLAYED, {
          position,
          card,
          gameState,
        });

        // If trick is complete, notify
        if (trickComplete) {
          const trick = gameState.cardPlay?.currentTrick;
          io.to(roomId).emit(SOCKET_EVENTS.TRICK_COMPLETE, {
            winner: trick?.winner,
            gameState,
          });
        }

        console.log(`🃏 Card played in room ${roomId}: ${position} - ${card.rank}${card.suit}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to play card';
        socket.emit(SOCKET_EVENTS.ROOM_ERROR, { message });
      }
    });

    // Sync request (reconnection)
    socket.on(SOCKET_EVENTS.SYNC_REQUEST, ({ roomId }) => {
      try {
        const room = gameManager.getRoom(roomId);
        if (!room) {
          throw new Error('Room not found');
        }

        const playerPosition = room.getPlayerPosition(socket.id);
        if (!playerPosition) {
          throw new Error('Player not found in room');
        }

        const gameState = room.getStateForPlayer(playerPosition);
        socket.emit(SOCKET_EVENTS.SYNC_RESPONSE, {
          gameState,
          yourPosition: playerPosition,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to sync';
        socket.emit(SOCKET_EVENTS.ROOM_ERROR, { message });
      }
    });

    // Disconnection
    socket.on(SOCKET_EVENTS.DISCONNECT, () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
      gameManager.handleDisconnect(socket.id);
    });
  });
}

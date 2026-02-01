import { Server, Socket } from 'socket.io';
import { SOCKET_EVENTS } from './events.js';
import { GameManager } from '../game/GameManager.js';
import type { Position, BidAction, Card } from '@bridge/shared';

const gameManager = new GameManager();

// Export gameManager for use in Express routes
export { gameManager };

export function setupSocketHandlers(io: Server) {
  io.on(SOCKET_EVENTS.CONNECTION, (socket: Socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    // Create room
    socket.on(SOCKET_EVENTS.ROOM_CREATE, (callback) => {
      try {
        const { roomId } = gameManager.createRoom();
        // Don't join socket room here - player will join via room:join after navigation
        callback({ roomId });
        console.log(`🎲 Room created: ${roomId}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create room';
        socket.emit(SOCKET_EVENTS.ROOM_ERROR, { message });
      }
    });

    // Join room
    socket.on(SOCKET_EVENTS.ROOM_JOIN, ({ roomId, playerId }, callback) => {
      try {
        const { position, players, playerId: assignedPlayerId } = gameManager.joinRoom(roomId, socket.id, playerId);
        socket.join(roomId);

        // Notify joiner - include players count and their persistent playerId
        callback({ success: true, position, players, playerId: assignedPlayerId });

        // Notify others in room
        socket.to(roomId).emit(SOCKET_EVENTS.ROOM_PLAYER_JOINED, {
          playerPosition: position,
          playerCount: Object.keys(players).length,
        });

        console.log(`👤 Player joined room ${roomId} as ${position} (playerId: ${assignedPlayerId})`);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to join room';
        callback({ success: false, error: message });
      }
    });

    // Start game
    socket.on(SOCKET_EVENTS.GAME_START, ({ roomId }) => {
      try {
        gameManager.startGame(roomId);
        const room = gameManager.getRoom(roomId);

        if (room) {
          // Send filtered state to each player
          for (const position of Object.keys(room.players)) {
            const playerPosition = position as Position;
            const player = room.players[playerPosition];
            if (player) {
              const filteredState = room.getStateForPlayer(playerPosition);
              io.to(player.socketId).emit(SOCKET_EVENTS.GAME_STARTED, filteredState);
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
        const { position } = gameManager.placeBid(roomId, socket.id, bid);
        const room = gameManager.getRoom(roomId);

        if (room) {
          // Send filtered state to each player
          for (const pos of Object.keys(room.players)) {
            const playerPosition = pos as Position;
            const player = room.players[playerPosition];
            if (player) {
              const filteredState = room.getStateForPlayer(playerPosition);
              io.to(player.socketId).emit(SOCKET_EVENTS.BID_MADE, {
                position,
                bid,
                gameState: filteredState,
              });
            }
          }
        }

        console.log(`🎺 Bid placed in room ${roomId}: ${position} - ${bid.type}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to place bid';
        socket.emit(SOCKET_EVENTS.ROOM_ERROR, { message });
      }
    });

    // Play card
    socket.on(SOCKET_EVENTS.CARD_PLAY, ({ roomId, card }: { roomId: string; card: Card }) => {
      try {
        const { position, trickComplete } = gameManager.playCard(roomId, socket.id, card);
        const room = gameManager.getRoom(roomId);

        if (room) {
          const fullState = room.getFullState();

          // Send filtered state to each player
          for (const pos of Object.keys(room.players)) {
            const playerPosition = pos as Position;
            const player = room.players[playerPosition];
            if (player) {
              const filteredState = room.getStateForPlayer(playerPosition);
              io.to(player.socketId).emit(SOCKET_EVENTS.CARD_PLAYED, {
                position,
                card,
                gameState: filteredState,
              });

              // If trick is complete, send trick complete event
              if (trickComplete) {
                const lastTrick = fullState.cardPlay?.tricks[fullState.cardPlay.tricks.length - 1];
                io.to(player.socketId).emit(SOCKET_EVENTS.TRICK_COMPLETE, {
                  winner: lastTrick?.winner,
                  gameState: filteredState,
                });
              }
            }
          }

          // If hand is complete, send hand complete event with full filtered state
          if (fullState.phase === 'complete' && fullState.score) {
            const sessionScore = room.getSessionScore();
            const isSessionComplete = room.isSessionComplete();

            for (const pos of Object.keys(room.players)) {
              const playerPosition = pos as Position;
              const player = room.players[playerPosition];
              if (player) {
                const filteredState = room.getStateForPlayer(playerPosition);
                io.to(player.socketId).emit(SOCKET_EVENTS.HAND_COMPLETE, {
                  score: fullState.score,
                  result: fullState.result,
                  gameState: filteredState,
                  sessionScore,
                });

                // Emit session complete if 4 hands done
                if (isSessionComplete) {
                  io.to(player.socketId).emit(SOCKET_EVENTS.SESSION_COMPLETE, {
                    sessionScore,
                  });
                }
              }
            }
          }
        }

        console.log(`🃏 Card played in room ${roomId}: ${position} - ${card.rank}${card.suit}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to play card';
        socket.emit(SOCKET_EVENTS.ROOM_ERROR, { message });
      }
    });

    // New hand (after review)
    socket.on(SOCKET_EVENTS.GAME_NEW_HAND, ({ roomId }) => {
      try {
        const room = gameManager.getRoom(roomId);
        if (!room) {
          throw new Error('Room not found');
        }

        room.dealNewHand();

        // Send filtered state to each player
        for (const pos of Object.keys(room.players)) {
          const playerPosition = pos as Position;
          const player = room.players[playerPosition];
          if (player) {
            const filteredState = room.getStateForPlayer(playerPosition);
            io.to(player.socketId).emit(SOCKET_EVENTS.GAME_STARTED, filteredState);
          }
        }

        console.log(`🃏 New hand dealt in room ${roomId}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to deal new hand';
        socket.emit(SOCKET_EVENTS.ROOM_ERROR, { message });
      }
    });

    // New session (after session complete)
    socket.on(SOCKET_EVENTS.SESSION_NEW, ({ roomId }) => {
      try {
        const room = gameManager.getRoom(roomId);
        if (!room) {
          throw new Error('Room not found');
        }

        // Reset session and deal new hand
        room.resetSession();
        room.dealNewHand();

        // Send filtered state to each player with session started event
        for (const pos of Object.keys(room.players)) {
          const playerPosition = pos as Position;
          const player = room.players[playerPosition];
          if (player) {
            const filteredState = room.getStateForPlayer(playerPosition);
            io.to(player.socketId).emit(SOCKET_EVENTS.SESSION_STARTED, {
              sessionScore: room.getSessionScore(),
            });
            io.to(player.socketId).emit(SOCKET_EVENTS.GAME_STARTED, filteredState);
          }
        }

        console.log(`🎯 New session started in room ${roomId}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to start new session';
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

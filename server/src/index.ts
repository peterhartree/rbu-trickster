import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { setupSocketHandlers, gameManager } from './socket/socketHandler.js';
import { saycConventions, searchBidMeaning, searchByCategory, searchByKeyword } from './conventions/sayc/index.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173', // Vite default dev server
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// SAYC conventions endpoints
app.get('/api/conventions/sayc', (req, res) => {
  res.json(saycConventions);
});

app.get('/api/conventions/sayc/search', (req, res) => {
  const { pattern, category, keyword } = req.query;

  let results;
  if (pattern) {
    results = searchBidMeaning(pattern as string);
  } else if (category) {
    results = searchByCategory(category as any);
  } else if (keyword) {
    results = searchByKeyword(keyword as string);
  } else {
    return res.status(400).json({ error: 'Must provide pattern, category, or keyword' });
  }

  res.json(results);
});

// Hand history endpoints
app.get('/api/rooms/:roomId/history', (req, res) => {
  const { roomId } = req.params;
  const room = gameManager.getRoom(roomId);

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const history = room.getHandHistory();
  const hands = history.getAllHands();

  res.json({ hands, count: history.getCount() });
});

app.get('/api/rooms/:roomId/history/:handId', (req, res) => {
  const { roomId, handId } = req.params;
  const room = gameManager.getRoom(roomId);

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const history = room.getHandHistory();
  const hand = history.getHand(handId);

  if (!hand) {
    return res.status(404).json({ error: 'Hand not found' });
  }

  res.json(hand);
});

app.get('/api/rooms/:roomId/history/:handId/pbn', (req, res) => {
  const { roomId, handId } = req.params;
  const room = gameManager.getRoom(roomId);

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const history = room.getHandHistory();
  const pbn = history.exportToPBN(handId);

  if (!pbn) {
    return res.status(404).json({ error: 'Hand not found' });
  }

  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Disposition', `attachment; filename="hand-${handId}.pbn"`);
  res.send(pbn);
});

// Setup Socket.IO handlers
setupSocketHandlers(io);

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`🃏 Bridge server running on port ${PORT}`);
});

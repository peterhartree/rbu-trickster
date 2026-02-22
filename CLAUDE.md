# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

RBU Trickster — a real-time multiplayer contract bridge training app. Four players connect via WebSockets, bid using SAYC conventions, play 13-trick hands, and track scores across 4-hand sessions. Deployed on Railway at `rbu-trickster-production.up.railway.app`.

## Commands

```bash
yarn dev              # Run server + client concurrently (hot reload)
yarn dev:server       # Server only (tsx watch, port 3001)
yarn dev:client       # Client only (Vite, port 5173)
yarn build            # Build all workspaces: shared → server → client
```

Build order matters: shared must build before server and client (the `yarn build` script handles this). After changing types in `shared/`, rebuild it with `yarn workspace @bridge/shared build`.

No test runner is configured.

## Architecture

**Monorepo** with three Yarn workspaces:

- **`shared/`** (`@bridge/shared`) — TypeScript enums and interfaces. All domain types (Card, Position, GameState, BidCall, Contract, etc.) live in `shared/src/types.ts`. Both server and client import from here.
- **`server/`** (`@bridge/server`) — Express + Socket.io. Source of truth for all game state.
- **`client/`** (`@bridge/client`) — React 18 + Vite + TailwindCSS. Receives filtered state via WebSocket.

### Server structure

- **`server/src/domain/`** — Pure game logic, no side effects:
  - `game-state/reducer.ts` — State machine: DEAL_CARDS → MAKE_BID → PLAY_CARD → COMPLETE_HAND
  - `bidding/bid-validator.ts` — Bid validation, contract determination, declarer logic
  - `play/play-validator.ts` + `trick-winner.ts` — Follow-suit rules, trick winner
  - `scoring/duplicate-scorer.ts` — Duplicate bridge scoring
  - `cards/deck.ts` — Dealing (Fisher-Yates shuffle), position helpers
- **`server/src/game/`** — Stateful game management:
  - `GameRoom.ts` — Holds mutable GameState per room, delegates to reducer. Filters state per player (hides opponents' hands).
  - `GameManager.ts` — Room registry (create/lookup/cleanup). Room IDs are 8-char nanoid.
  - `SessionManager.ts` — Tracks cumulative scores across 4-hand sessions
  - `HandHistory.ts` — Immutable records of completed hands
- **`server/src/socket/`** — WebSocket event handlers. Events defined in `events.ts`.
- **`server/src/conventions/sayc/`** — SAYC convention reference data (searchable via REST API)

### Information hiding

The server holds complete game state but each player only receives their own hand plus public information (bids, played cards, dummy's hand after opening lead). Filtering happens in `GameRoom.getStateForPlayer()`.

### Client state

React hooks + localStorage for persistence. Key localStorage keys:
- `bridge_player_id` — Persistent player identity (survives browser close)
- `bridge_session_{roomId}` — Reconnection data (24h TTL)

### Communication

Socket.io events follow a request/response pattern: client sends actions (`room:join`, `bid:place`, `card:play`), server validates and broadcasts filtered state updates (`game:state-update`). Event constants in `server/src/socket/events.ts`.

### Styling

Art Deco theme using Tailwind with custom colours (navy, midnight, gold, cream, bronze) and fonts (Playfair Display for headings, DM Sans for body). Config in `client/tailwind.config.js`.

## Deployment

Railway (nixpacks, Node 20). In production the Express server serves the built client from `client/dist/` as static files, with SPA fallback for client-side routing. Config in `railway.toml`.

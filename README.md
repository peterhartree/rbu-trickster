# RBU Trickster

A real-time multiplayer contract bridge training app built with React, Node.js, and WebSockets.

## Features

- **Real-time multiplayer**: 4 players connect via WebSockets for instant updates
- **Secret game links**: Create games and share unique room codes
- **SAYC conventions**: Reference material for Standard American Yellow Card
- **Duplicate/IMP scoring**: Professional bridge scoring system
- **Hand history**: Review and replay completed hands

## Technology stack

- **Frontend**: React 18, TypeScript, Vite, TailwindCSS, Socket.io-client, Zustand
- **Backend**: Node.js, Express, TypeScript, Socket.io
- **Architecture**: Monorepo with Yarn workspaces

## Project structure

```
bridge-game/
├── shared/          # Shared TypeScript types
├── server/          # Node.js backend
└── client/          # React frontend
```

## Getting started

### Prerequisites

- Node.js >= 18.0.0
- Yarn >= 1.22.0

### Installation

```bash
# Install all dependencies
yarn install

# Build shared types
yarn workspace @bridge/shared build
```

### Development

Run both client and server in development mode with hot reload:

```bash
yarn dev
```

Or run them separately:

```bash
# Terminal 1 - Server
yarn dev:server

# Terminal 2 - Client
yarn dev:client
```

The server will run on `http://localhost:3001` and the client on `http://localhost:5173`.

### Building for production

```bash
yarn build
```

## How to play

1. Create a game and share the room code with 3 friends
2. Once all 4 players join, start the game
3. Follow standard bridge rules with SAYC conventions
4. Scores calculated using duplicate/IMP scoring

## Development status

- [x] Phase 1: Project foundation
- [ ] Phase 2: Core bridge logic
- [ ] Phase 3: Real-time multiplayer
- [ ] Phase 4: User interface
- [ ] Phase 5: SAYC convention data
- [ ] Phase 6: Hand history system
- [ ] Phase 7: Polish and testing

## Licence

Private project

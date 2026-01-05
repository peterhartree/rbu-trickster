// Socket.IO event name constants
export const SOCKET_EVENTS = {
  // Room management
  ROOM_CREATE: 'room:create',
  ROOM_CREATED: 'room:created',
  ROOM_JOIN: 'room:join',
  ROOM_JOINED: 'room:joined',
  ROOM_PLAYER_JOINED: 'room:player-joined',
  ROOM_FULL: 'room:full',
  ROOM_ERROR: 'room:error',

  // Game flow
  GAME_START: 'game:start',
  GAME_STARTED: 'game:started',
  GAME_STATE_UPDATE: 'game:state-update',

  // Bidding
  BID_PLACE: 'bid:place',
  BID_MADE: 'bid:made',

  // Card play
  CARD_PLAY: 'card:play',
  CARD_PLAYED: 'card:played',
  TRICK_COMPLETE: 'trick:complete',
  HAND_COMPLETE: 'hand:complete',

  // Synchronisation
  SYNC_REQUEST: 'sync:request',
  SYNC_RESPONSE: 'sync:response',

  // Connection
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
} as const;

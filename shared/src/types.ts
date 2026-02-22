// ============================================================================
// Core Domain Types
// ============================================================================

export enum Suit {
  CLUBS = 'C',
  DIAMONDS = 'D',
  HEARTS = 'H',
  SPADES = 'S',
}

export enum Rank {
  TWO = '2',
  THREE = '3',
  FOUR = '4',
  FIVE = '5',
  SIX = '6',
  SEVEN = '7',
  EIGHT = '8',
  NINE = '9',
  TEN = 'T',
  JACK = 'J',
  QUEEN = 'Q',
  KING = 'K',
  ACE = 'A',
}

export interface Card {
  suit: Suit;
  rank: Rank;
}

export enum Position {
  NORTH = 'N',
  EAST = 'E',
  SOUTH = 'S',
  WEST = 'W',
}

export interface Vulnerability {
  ns: boolean;
  ew: boolean;
}

export interface Deal {
  id: string;
  north: Card[];
  east: Card[];
  south: Card[];
  west: Card[];
  dealer: Position;
  vulnerability: Vulnerability;
  timestamp: number;
}

// ============================================================================
// Bidding Types
// ============================================================================

export enum BidLevel {
  ONE = 1,
  TWO = 2,
  THREE = 3,
  FOUR = 4,
  FIVE = 5,
  SIX = 6,
  SEVEN = 7,
}

export enum Strain {
  CLUBS = 'C',
  DIAMONDS = 'D',
  HEARTS = 'H',
  SPADES = 'S',
  NO_TRUMP = 'NT',
}

export type BidAction =
  | { type: 'BID'; level: BidLevel; strain: Strain }
  | { type: 'PASS' }
  | { type: 'DOUBLE' }
  | { type: 'REDOUBLE' };

export interface BidCall {
  position: Position;
  action: BidAction;
  timestamp: number;
  alert?: string;
}

export interface Contract {
  level: BidLevel;
  strain: Strain;
  declarer: Position;
  doubled: boolean;
  redoubled: boolean;
}

export interface BiddingSequence {
  calls: BidCall[];
  dealer: Position;
  isComplete: boolean;
  finalContract?: Contract;
}

// ============================================================================
// Card Play Types
// ============================================================================

export interface PlayedCard {
  card: Card;
  position: Position;
  timestamp: number;
}

export interface Trick {
  number: number;
  leader: Position;
  cards: PlayedCard[];
  winner?: Position;
  isComplete: boolean;
}

export interface CardPlayState {
  tricks: Trick[];
  currentTrick: Trick;
  leader: Position;
  declarer: Position;
  dummy: Position;
  contract: Contract;
  nsTricks: number;
  ewTricks: number;
}

// ============================================================================
// Scoring Types
// ============================================================================

export interface ScoreBreakdown {
  contractPoints: number;
  overtricks: number;
  undertricks: number;
  doubleBonus: number;
  gameBonus: number;
  slamBonus: number;
  insultBonus: number;
  totalScore: number;
  isGame: boolean;
  isSlam: boolean;
}

export interface DuplicateScore extends ScoreBreakdown {
  nsScore: number;
  ewScore: number;
}

export interface SessionScore {
  sessionId: string;
  handNumber: number;        // 1-4
  totalHands: number;        // 4
  nsTotal: number;           // Cumulative NS score
  ewTotal: number;           // Cumulative EW score
  handScores: DuplicateScore[]; // Per-hand scores
  isComplete: boolean;       // True after hand 4
  startedAt: number;
}

export interface ContractResult {
  contract: Contract;
  tricksMade: number;
  declarer: Position;
  vulnerability: Vulnerability;
}

// ============================================================================
// Game State Types
// ============================================================================

export enum GamePhase {
  WAITING = 'waiting',
  BIDDING = 'bidding',
  PLAYING = 'playing',
  COMPLETE = 'complete',
}

export interface Player {
  id: string;           // Persistent player UUID (survives reconnection)
  socketId: string;     // Current socket connection ID (changes on reconnect)
  position: Position;
  connected: boolean;
  name?: string;        // Player display name
}

export interface GameState {
  roomId: string;
  phase: GamePhase;
  players: {
    [Position.NORTH]?: Player;
    [Position.SOUTH]?: Player;
    [Position.EAST]?: Player;
    [Position.WEST]?: Player;
  };
  deal?: Deal;
  dealer?: Position;
  currentBidder?: Position;
  currentPlayer?: Position;
  bidding?: BiddingSequence;
  contract?: Contract;
  cardPlay?: CardPlayState;
  result?: ContractResult;
  score?: DuplicateScore;
  hands: {
    [Position.NORTH]: Card[];
    [Position.SOUTH]: Card[];
    [Position.EAST]: Card[];
    [Position.WEST]: Card[];
  };
  // Original hands for review after hand completes
  originalHands?: {
    [Position.NORTH]: Card[];
    [Position.SOUTH]: Card[];
    [Position.EAST]: Card[];
    [Position.WEST]: Card[];
  };
  session?: SessionScore;
  validBids?: BidAction[];
}

export type GameAction =
  | { type: 'DEAL_CARDS'; deal: Deal }
  | { type: 'MAKE_BID'; bid: BidCall }
  | { type: 'PLAY_CARD'; card: Card; position: Position }
  | { type: 'COMPLETE_HAND' };

// ============================================================================
// WebSocket Event Types
// ============================================================================

export interface RoomCreatedEvent {
  roomId: string;
  playerPosition: Position;
}

export interface RoomJoinedEvent {
  roomId: string;
  playerPosition: Position;
  players: { [key in Position]?: Player };
}

export interface PlayerJoinedEvent {
  playerPosition: Position;
  playerCount: number;
}

export interface GameStartedEvent {
  hands: { [key in Position]: Card[] };
  dealer: Position;
  gameState: GameState;
}

export interface GameStateUpdateEvent {
  gameState: Partial<GameState>;
}

export interface BidMadeEvent {
  position: Position;
  bid: BidAction;
  gameState: Partial<GameState>;
}

export interface CardPlayedEvent {
  position: Position;
  card: Card;
  gameState: Partial<GameState>;
}

export interface TrickCompleteEvent {
  winner: Position;
  gameState: Partial<GameState>;
}

export interface HandCompleteEvent {
  score: DuplicateScore;
  gameState: GameState;
  sessionScore: SessionScore;
}

// ============================================================================
// Hand History Types
// ============================================================================

export interface CompletedCardPlay {
  tricks: Trick[];
  openingLead: PlayedCard;
  declarerPlay: PlayedCard[];
  dummyExposed: Card[];
}

export interface HandMetadata {
  players: {
    north: string;
    east: string;
    south: string;
    west: string;
  };
  duration: number;
  boardNumber?: number;
  event?: string;
  notes?: string;
}

export interface HandRecord {
  id: string;
  timestamp: number;
  deal: Deal;
  biddingSequence: BiddingSequence;
  cardPlay: CompletedCardPlay;
  result: ContractResult;
  score: DuplicateScore;
  metadata: HandMetadata;
}

// ============================================================================
// SAYC Convention Types
// ============================================================================

export interface PointRange {
  min: number;
  max: number;
}

export interface SuitRequirement {
  suit: Suit;
  minLength: number;
  maxLength?: number;
  minHonours?: number; // Number of top honours (A, K, Q)
}

export interface ShapeRequirement {
  balanced?: boolean; // 4-3-3-3, 4-4-3-2, 5-3-3-2
  semiBalanced?: boolean; // 5-4-2-2, 6-3-2-2
  unbalanced?: boolean;
  pattern?: string; // e.g., "5-4-3-1", "6-4-2-1"
}

export interface BidRequirement {
  hcp: PointRange;
  totalPoints?: PointRange; // HCP + distribution points
  suits?: SuitRequirement[];
  shape?: ShapeRequirement;
  stoppers?: Suit[]; // For NT bids
}

export enum BidCategory {
  OPENING = 'opening',
  RESPONSE = 'response',
  REBID = 'rebid',
  COMPETITIVE = 'competitive',
  DEFENSIVE = 'defensive',
  CONVENTIONAL = 'conventional',
}

export interface BidMeaning {
  bidSequence: string; // e.g., "1C", "1NT-2C", "1H-2D-2NT"
  description: string;
  requirements: BidRequirement;
  forcing: boolean;
  gameForcing?: boolean;
  responses?: BidMeaning[];
  category: BidCategory;
  alertable?: boolean;
  notes?: string;
}

export interface SAYCConventions {
  openingBids: BidMeaning[];
  responses: BidMeaning[];
  rebids: BidMeaning[];
  competitiveBids: BidMeaning[];
  conventionalBids: BidMeaning[];
  leadConventions: LeadConvention[];
  defensiveSignals: DefensiveSignal[];
}

export interface LeadConvention {
  name: string;
  description: string;
  situation: string; // "Opening lead vs NT", "Opening lead vs suit", etc.
  rules: string[];
}

export interface DefensiveSignal {
  name: string;
  description: string;
  type: 'attitude' | 'count' | 'suit-preference';
  rules: string[];
}

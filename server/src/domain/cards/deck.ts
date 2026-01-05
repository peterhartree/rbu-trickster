import { nanoid } from 'nanoid';
import type { Card, Suit, Rank, Deal, Position, Vulnerability } from '@bridge/shared';
import { Suit as SuitEnum, Rank as RankEnum, Position as PosEnum } from '@bridge/shared';

/**
 * Fisher-Yates shuffle algorithm
 * Randomly shuffles an array in-place
 */
function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Creates a standard 52-card deck
 */
export function createDeck(): Card[] {
  const deck: Card[] = [];
  const suits = Object.values(SuitEnum);
  const ranks = Object.values(RankEnum);

  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank });
    }
  }

  return deck;
}

/**
 * Shuffles and deals cards to 4 players
 */
export function dealCards(dealer: Position): Deal {
  const deck = createDeck();
  const shuffled = shuffle(deck);

  // Deal 13 cards to each position
  const north = shuffled.slice(0, 13);
  const east = shuffled.slice(13, 26);
  const south = shuffled.slice(26, 39);
  const west = shuffled.slice(39, 52);

  // Calculate vulnerability based on board number
  // For now, use simple rotation
  const vulnerability = calculateVulnerability(dealer);

  return {
    id: nanoid(),
    north,
    east,
    south,
    west,
    dealer,
    vulnerability,
    timestamp: Date.now(),
  };
}

/**
 * Calculates vulnerability based on dealer position (simplified)
 * In actual duplicate bridge, vulnerability is determined by board number
 */
function calculateVulnerability(dealer: Position): Vulnerability {
  // Simplified vulnerability rotation
  switch (dealer) {
    case PosEnum.NORTH:
      return { ns: false, ew: false }; // Board 1, 5, 9, 13
    case PosEnum.EAST:
      return { ns: true, ew: false }; // Board 2, 6, 10, 14
    case PosEnum.SOUTH:
      return { ns: false, ew: true }; // Board 3, 7, 11, 15
    case PosEnum.WEST:
      return { ns: true, ew: true }; // Board 4, 8, 12, 16
    default:
      return { ns: false, ew: false };
  }
}

/**
 * Calculates vulnerability based on board number (proper duplicate bridge)
 */
export function calculateVulnerabilityByBoard(boardNumber: number): Vulnerability {
  const mod = ((boardNumber - 1) % 16) + 1;

  if ([1, 8, 11, 14].includes(mod)) {
    return { ns: false, ew: false }; // None vulnerable
  } else if ([2, 5, 12, 15].includes(mod)) {
    return { ns: true, ew: false }; // NS vulnerable
  } else if ([3, 6, 9, 16].includes(mod)) {
    return { ns: false, ew: true }; // EW vulnerable
  } else {
    return { ns: true, ew: true }; // Both vulnerable
  }
}

/**
 * Gets the next position clockwise
 */
export function getNextPosition(position: Position): Position {
  const rotation: Record<Position, Position> = {
    [PosEnum.NORTH]: PosEnum.EAST,
    [PosEnum.EAST]: PosEnum.SOUTH,
    [PosEnum.SOUTH]: PosEnum.WEST,
    [PosEnum.WEST]: PosEnum.NORTH,
  };
  return rotation[position];
}

/**
 * Gets partner position
 */
export function getPartner(position: Position): Position {
  const partners: Record<Position, Position> = {
    [PosEnum.NORTH]: PosEnum.SOUTH,
    [PosEnum.SOUTH]: PosEnum.NORTH,
    [PosEnum.EAST]: PosEnum.WEST,
    [PosEnum.WEST]: PosEnum.EAST,
  };
  return partners[position];
}

/**
 * Checks if two positions are opponents
 */
export function areOpponents(pos1: Position, pos2: Position): boolean {
  return getPartner(pos1) !== pos2 && pos1 !== pos2;
}

/**
 * Checks if two positions are partners
 */
export function arePartners(pos1: Position, pos2: Position): boolean {
  return getPartner(pos1) === pos2;
}

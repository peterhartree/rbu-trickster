import type { Card, Suit, Rank } from '@bridge/shared';
import { Suit as SuitEnum, Rank as RankEnum } from '@bridge/shared';

/**
 * Rank values for comparison (2 = 2, ..., A = 14)
 */
const RANK_VALUES: Record<Rank, number> = {
  [RankEnum.TWO]: 2,
  [RankEnum.THREE]: 3,
  [RankEnum.FOUR]: 4,
  [RankEnum.FIVE]: 5,
  [RankEnum.SIX]: 6,
  [RankEnum.SEVEN]: 7,
  [RankEnum.EIGHT]: 8,
  [RankEnum.NINE]: 9,
  [RankEnum.TEN]: 10,
  [RankEnum.JACK]: 11,
  [RankEnum.QUEEN]: 12,
  [RankEnum.KING]: 13,
  [RankEnum.ACE]: 14,
};

/**
 * Suit order for bidding (C < D < H < S)
 */
const SUIT_ORDER: Record<Suit, number> = {
  [SuitEnum.CLUBS]: 0,
  [SuitEnum.DIAMONDS]: 1,
  [SuitEnum.HEARTS]: 2,
  [SuitEnum.SPADES]: 3,
};

/**
 * Gets numeric value of a rank
 */
export function rankValue(rank: Rank): number {
  return RANK_VALUES[rank];
}

/**
 * Gets numeric order of a suit
 */
export function suitOrder(suit: Suit): number {
  return SUIT_ORDER[suit];
}

/**
 * Compares two cards by rank
 * Returns positive if card1 > card2, negative if card1 < card2, 0 if equal
 */
export function compareRank(card1: Card, card2: Card): number {
  return rankValue(card1.rank) - rankValue(card2.rank);
}

/**
 * Compares two cards by suit order
 */
export function compareSuit(card1: Card, card2: Card): number {
  return suitOrder(card1.suit) - suitOrder(card2.suit);
}

/**
 * Checks if two cards are equal
 */
export function cardsEqual(card1: Card, card2: Card): boolean {
  return card1.suit === card2.suit && card1.rank === card2.rank;
}

/**
 * Sorts cards by suit (descending: S, H, D, C) then by rank (descending: A-2)
 * This is the standard bridge hand display order
 */
export function sortHand(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => {
    // First sort by suit (descending: Spades, Hearts, Diamonds, Clubs)
    const suitDiff = suitOrder(b.suit) - suitOrder(a.suit);
    if (suitDiff !== 0) return suitDiff;

    // Then sort by rank (descending: A, K, Q, ..., 2)
    return rankValue(b.rank) - rankValue(a.rank);
  });
}

/**
 * Groups cards by suit
 */
export function groupBySuit(cards: Card[]): Record<Suit, Card[]> {
  const grouped: Record<Suit, Card[]> = {
    [SuitEnum.SPADES]: [],
    [SuitEnum.HEARTS]: [],
    [SuitEnum.DIAMONDS]: [],
    [SuitEnum.CLUBS]: [],
  };

  for (const card of cards) {
    grouped[card.suit].push(card);
  }

  // Sort each suit by rank
  for (const suit of Object.values(SuitEnum)) {
    grouped[suit].sort((a, b) => rankValue(b.rank) - rankValue(a.rank));
  }

  return grouped;
}

/**
 * Calculates High Card Points (HCP)
 * A = 4, K = 3, Q = 2, J = 1
 */
export function calculateHCP(cards: Card[]): number {
  const HCP_VALUES: Partial<Record<Rank, number>> = {
    [RankEnum.ACE]: 4,
    [RankEnum.KING]: 3,
    [RankEnum.QUEEN]: 2,
    [RankEnum.JACK]: 1,
  };

  return cards.reduce((total, card) => {
    return total + (HCP_VALUES[card.rank] || 0);
  }, 0);
}

/**
 * Analyses hand shape (distribution)
 * Returns array of suit lengths sorted descending
 * E.g., [5, 4, 2, 2] for a 5-4-2-2 hand
 */
export function analyseShape(cards: Card[]): number[] {
  const distribution: Record<Suit, number> = {
    [SuitEnum.SPADES]: 0,
    [SuitEnum.HEARTS]: 0,
    [SuitEnum.DIAMONDS]: 0,
    [SuitEnum.CLUBS]: 0,
  };

  for (const card of cards) {
    distribution[card.suit]++;
  }

  return Object.values(distribution).sort((a, b) => b - a);
}

/**
 * Checks if hand is balanced (4-3-3-3, 4-4-3-2, 5-3-3-2)
 */
export function isBalanced(cards: Card[]): boolean {
  const shape = analyseShape(cards);

  // 5-3-3-2
  if (shape[0] === 5 && shape[1] === 3 && shape[2] === 3 && shape[3] === 2) return true;
  // 4-4-3-2
  if (shape[0] === 4 && shape[1] === 4 && shape[2] === 3 && shape[3] === 2) return true;
  // 4-3-3-3
  if (shape[0] === 4 && shape[1] === 3 && shape[2] === 3 && shape[3] === 3) return true;

  return false;
}

/**
 * Gets suit length in hand
 */
export function getSuitLength(cards: Card[], suit: Suit): number {
  return cards.filter((c) => c.suit === suit).length;
}

/**
 * Checks if hand contains a card
 */
export function hasCard(hand: Card[], card: Card): boolean {
  return hand.some((c) => cardsEqual(c, card));
}

/**
 * Removes a card from hand
 */
export function removeCard(hand: Card[], card: Card): Card[] {
  return hand.filter((c) => !cardsEqual(c, card));
}

/**
 * Formats card for display (e.g., "A♠", "K♥")
 */
export function formatCard(card: Card): string {
  const suitSymbols: Record<Suit, string> = {
    [SuitEnum.SPADES]: '♠',
    [SuitEnum.HEARTS]: '♥',
    [SuitEnum.DIAMONDS]: '♦',
    [SuitEnum.CLUBS]: '♣',
  };

  return `${card.rank}${suitSymbols[card.suit]}`;
}

/**
 * Formats multiple cards (e.g., "AK♠ QJ♥")
 */
export function formatHand(cards: Card[]): string {
  const grouped = groupBySuit(cards);
  const suitOrder: Suit[] = [SuitEnum.SPADES, SuitEnum.HEARTS, SuitEnum.DIAMONDS, SuitEnum.CLUBS];

  return suitOrder
    .map((suit) => {
      const suitCards = grouped[suit];
      if (suitCards.length === 0) return '';

      const suitSymbols: Record<Suit, string> = {
        [SuitEnum.SPADES]: '♠',
        [SuitEnum.HEARTS]: '♥',
        [SuitEnum.DIAMONDS]: '♦',
        [SuitEnum.CLUBS]: '♣',
      };

      const ranks = suitCards.map((c) => c.rank).join('');
      return `${ranks}${suitSymbols[suit]}`;
    })
    .filter(Boolean)
    .join(' ');
}

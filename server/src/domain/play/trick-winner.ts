import type { Trick, Position, Suit } from '@bridge/shared';
import { rankValue } from '../cards/card-utils.js';

/**
 * Determines the winner of a completed trick
 *
 * Rules:
 * 1. If any trump was played, highest trump wins
 * 2. Otherwise, highest card of led suit wins
 */
export function determineTrickWinner(trick: Trick, trumpSuit: Suit | null): Position {
  if (trick.cards.length !== 4) {
    throw new Error('Trick must have 4 cards to determine winner');
  }

  const ledSuit = trick.cards[0].card.suit;
  let winningCard = trick.cards[0];

  for (let i = 1; i < trick.cards.length; i++) {
    const currentCard = trick.cards[i];

    // Current card is trump, winning card is not
    if (trumpSuit && currentCard.card.suit === trumpSuit && winningCard.card.suit !== trumpSuit) {
      winningCard = currentCard;
      continue;
    }

    // Winning card is trump, current card is not
    if (trumpSuit && winningCard.card.suit === trumpSuit && currentCard.card.suit !== trumpSuit) {
      continue; // Winning card remains
    }

    // Both cards are same suit (either both trump or both non-trump matching suit)
    if (currentCard.card.suit === winningCard.card.suit) {
      if (rankValue(currentCard.card.rank) > rankValue(winningCard.card.rank)) {
        winningCard = currentCard;
      }
    }

    // Otherwise, winning card remains (current card is off-suit, not trump)
  }

  return winningCard.position;
}

/**
 * Checks if a trick is complete (has 4 cards)
 */
export function isTrickComplete(trick: Trick): boolean {
  return trick.cards.length === 4;
}

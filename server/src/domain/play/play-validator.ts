import type { Card, Suit, Trick } from '@bridge/shared';
import { hasCard } from '../cards/card-utils.js';

/**
 * Gets cards of a specific suit from a hand
 */
function getCardsInSuit(hand: Card[], suit: Suit): Card[] {
  return hand.filter((card) => card.suit === suit);
}

/**
 * Determines the legal cards that can be played from a hand
 * Must follow suit if possible; otherwise any card can be played
 */
export function getLegalPlays(
  hand: Card[],
  currentTrick: Trick,
  trumpSuit: Suit | null
): Card[] {
  // If leading (first to play in trick), any card is legal
  if (currentTrick.cards.length === 0) {
    return [...hand];
  }

  // Get the suit that was led
  const ledSuit = currentTrick.cards[0].card.suit;

  // Get cards in the led suit
  const cardsInLedSuit = getCardsInSuit(hand, ledSuit);

  // If player has cards in led suit, must play one of them
  if (cardsInLedSuit.length > 0) {
    return cardsInLedSuit;
  }

  // If void in led suit, can play any card
  return [...hand];
}

/**
 * Validates if a card play is legal
 */
export function isValidPlay(
  card: Card,
  hand: Card[],
  currentTrick: Trick,
  trumpSuit: Suit | null
): { isValid: boolean; reason?: string } {
  // Check if card is in hand
  if (!hasCard(hand, card)) {
    return { isValid: false, reason: 'Card not in hand' };
  }

  // Get legal plays
  const legalPlays = getLegalPlays(hand, currentTrick, trumpSuit);

  // Check if card is among legal plays
  const isLegal = legalPlays.some((c) => c.suit === card.suit && c.rank === card.rank);

  if (!isLegal) {
    return { isValid: false, reason: 'Must follow suit' };
  }

  return { isValid: true };
}

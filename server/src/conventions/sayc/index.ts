import { SAYCConventions, BidMeaning, BidCategory } from '@bridge/shared';
import { openingBids } from './opening-bids';
import { responses } from './responses';
import { leadConventions } from './lead-conventions';
import { defensiveSignals } from './defensive-signals';

/**
 * Complete SAYC convention card data
 */
export const saycConventions: SAYCConventions = {
  openingBids,
  responses,
  rebids: [], // TODO: Add rebid data
  competitiveBids: [], // TODO: Add competitive bidding data
  conventionalBids: responses.filter((r) => r.category === BidCategory.CONVENTIONAL),
  leadConventions,
  defensiveSignals,
};

/**
 * Search for bid meanings by bid sequence pattern
 * @param pattern - Bid sequence to search for (e.g., "1NT", "1NT-2C", "1H-1S")
 * @returns Array of matching bid meanings
 */
export function searchBidMeaning(pattern: string): BidMeaning[] {
  const normalizedPattern = pattern.toUpperCase().replace(/\s/g, '');
  const results: BidMeaning[] = [];

  // Search in all categories
  const allBids = [
    ...saycConventions.openingBids,
    ...saycConventions.responses,
    ...saycConventions.rebids,
    ...saycConventions.competitiveBids,
  ];

  for (const bid of allBids) {
    const normalizedSequence = bid.bidSequence.toUpperCase().replace(/\s/g, '');
    if (normalizedSequence === normalizedPattern || normalizedSequence.startsWith(normalizedPattern)) {
      results.push(bid);
    }
  }

  return results;
}

/**
 * Search for bid meanings by category
 * @param category - Bid category to filter by
 * @returns Array of bid meanings in that category
 */
export function searchByCategory(category: BidCategory): BidMeaning[] {
  const allBids = [
    ...saycConventions.openingBids,
    ...saycConventions.responses,
    ...saycConventions.rebids,
    ...saycConventions.competitiveBids,
  ];

  return allBids.filter((bid) => bid.category === category);
}

/**
 * Search for bid meanings by keyword in description
 * @param keyword - Keyword to search for in descriptions
 * @returns Array of matching bid meanings
 */
export function searchByKeyword(keyword: string): BidMeaning[] {
  const normalizedKeyword = keyword.toLowerCase();
  const allBids = [
    ...saycConventions.openingBids,
    ...saycConventions.responses,
    ...saycConventions.rebids,
    ...saycConventions.competitiveBids,
  ];

  return allBids.filter(
    (bid) =>
      bid.description.toLowerCase().includes(normalizedKeyword) ||
      (bid.notes && bid.notes.toLowerCase().includes(normalizedKeyword))
  );
}

/**
 * Get all alertable bids
 * @returns Array of bids that should be alerted
 */
export function getAlertableBids(): BidMeaning[] {
  const allBids = [
    ...saycConventions.openingBids,
    ...saycConventions.responses,
    ...saycConventions.rebids,
    ...saycConventions.competitiveBids,
  ];

  return allBids.filter((bid) => bid.alertable);
}

/**
 * Get forcing bids
 * @returns Array of forcing bids
 */
export function getForcingBids(): BidMeaning[] {
  const allBids = [
    ...saycConventions.openingBids,
    ...saycConventions.responses,
    ...saycConventions.rebids,
    ...saycConventions.competitiveBids,
  ];

  return allBids.filter((bid) => bid.forcing);
}

/**
 * Get game-forcing bids
 * @returns Array of game-forcing bids
 */
export function getGameForcingBids(): BidMeaning[] {
  const allBids = [
    ...saycConventions.openingBids,
    ...saycConventions.responses,
    ...saycConventions.rebids,
    ...saycConventions.competitiveBids,
  ];

  return allBids.filter((bid) => bid.gameForcing);
}

import type { BidAction, BiddingSequence, BidCall, Strain, Position as PositionType } from '@bridge/shared';
import { BidLevel, Strain as StrainEnum, Position } from '@bridge/shared';
import { areOpponents, arePartners } from '../cards/deck.js';

/**
 * Strain values for bid comparison (C < D < H < S < NT)
 */
const STRAIN_VALUES: Record<Strain, number> = {
  [StrainEnum.CLUBS]: 0,
  [StrainEnum.DIAMONDS]: 1,
  [StrainEnum.HEARTS]: 2,
  [StrainEnum.SPADES]: 3,
  [StrainEnum.NO_TRUMP]: 4,
};

/**
 * Calculates bid value for comparison
 * Bid value = level * 5 + strain_value
 * This ensures 1NT > 1S > 1H > 1D > 1C, and 2C > 1NT, etc.
 */
export function bidValue(bid: Extract<BidAction, { type: 'BID' }>): number {
  return bid.level * 5 + STRAIN_VALUES[bid.strain];
}

/**
 * Compares two bids
 * Returns positive if bid1 > bid2, negative if bid1 < bid2, 0 if equal
 */
export function compareBids(
  bid1: Extract<BidAction, { type: 'BID' }>,
  bid2: Extract<BidAction, { type: 'BID' }>
): number {
  return bidValue(bid1) - bidValue(bid2);
}

/**
 * Finds the last bid (not pass, double, or redouble) in the sequence
 */
function findLastBid(sequence: BiddingSequence): BidCall | null {
  for (let i = sequence.calls.length - 1; i >= 0; i--) {
    const call = sequence.calls[i];
    if (call.action.type === 'BID') {
      return call;
    }
  }
  return null;
}

/**
 * Finds the last non-pass call in the sequence
 */
function findLastNonPassCall(sequence: BiddingSequence): BidCall | null {
  for (let i = sequence.calls.length - 1; i >= 0; i--) {
    const call = sequence.calls[i];
    if (call.action.type !== 'PASS') {
      return call;
    }
  }
  return null;
}

/**
 * Gets the current bidder based on dealer and number of calls made
 */
export function getCurrentBidder(sequence: BiddingSequence): PositionType {
  const positions: PositionType[] = [Position.NORTH, Position.EAST, Position.SOUTH, Position.WEST];
  const dealerIndex = positions.indexOf(sequence.dealer);
  const currentIndex = (dealerIndex + sequence.calls.length) % 4;
  return positions[currentIndex];
}

/**
 * Validates if a bid action is legal given the current bidding sequence
 */
export function isValidBid(
  bid: BidAction,
  sequence: BiddingSequence,
  bidder: PositionType
): { isValid: boolean; reason?: string } {
  // PASS is always legal
  if (bid.type === 'PASS') {
    return { isValid: true };
  }

  const lastBid = findLastBid(sequence);
  const lastNonPassCall = findLastNonPassCall(sequence);

  // DOUBLE validation
  if (bid.type === 'DOUBLE') {
    if (!lastBid) {
      return { isValid: false, reason: 'Cannot double without a previous bid' };
    }

    // Last non-pass call must be a bid (not a double or redouble)
    if (lastNonPassCall?.action.type !== 'BID') {
      return { isValid: false, reason: 'Cannot double a double or redouble' };
    }

    // Must be doubling opponent's bid
    if (!areOpponents(bidder, lastBid.position)) {
      return { isValid: false, reason: 'Can only double opponent bids' };
    }

    // Check if already doubled
    const bidsSinceLastBid = sequence.calls.slice(
      sequence.calls.indexOf(lastBid) + 1
    );

    for (const call of bidsSinceLastBid) {
      if (call.action.type === 'DOUBLE') {
        return { isValid: false, reason: 'Bid already doubled' };
      }
    }

    return { isValid: true };
  }

  // REDOUBLE validation
  if (bid.type === 'REDOUBLE') {
    if (!lastNonPassCall || lastNonPassCall.action.type !== 'DOUBLE') {
      return { isValid: false, reason: 'Can only redouble after a double' };
    }

    // The doubled bid must have been our side's bid
    const doubleCall = lastNonPassCall;
    const bidBeforeDouble = findLastBid(sequence);

    if (!bidBeforeDouble) {
      return { isValid: false, reason: 'No bid to redouble' };
    }

    if (!arePartners(bidder, bidBeforeDouble.position) && bidder !== bidBeforeDouble.position) {
      return { isValid: false, reason: 'Can only redouble your side\'s doubled bid' };
    }

    return { isValid: true };
  }

  // BID validation
  if (bid.type === 'BID') {
    // If there's no previous bid, any bid is valid
    if (!lastBid) {
      return { isValid: true };
    }

    // Bid must be higher than previous bid
    if (lastBid.action.type === 'BID') {
      if (compareBids(bid, lastBid.action) <= 0) {
        return {
          isValid: false,
          reason: `Bid must be higher than ${lastBid.action.level}${lastBid.action.strain}`,
        };
      }
    }

    return { isValid: true };
  }

  return { isValid: false, reason: 'Invalid bid type' };
}

/**
 * Checks if bidding is complete
 * Bidding ends when there are 3 consecutive passes after a bid, or 4 passes from the start
 */
export function isBiddingComplete(sequence: BiddingSequence): boolean {
  const calls = sequence.calls;

  // Need at least 4 calls total (one per player)
  if (calls.length < 4) {
    return false;
  }

  // Check for 4 consecutive passes (passed out)
  if (calls.length >= 4) {
    const lastFour = calls.slice(-4);
    if (lastFour.every((call) => call.action.type === 'PASS')) {
      return true;
    }
  }

  // Check for 3 consecutive passes after a bid/double/redouble
  if (calls.length >= 3) {
    const lastThree = calls.slice(-3);
    if (lastThree.every((call) => call.action.type === 'PASS')) {
      // Check if there was a bid before these passes
      const callsBeforePasses = calls.slice(0, -3);
      if (callsBeforePasses.some((call) => call.action.type !== 'PASS')) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Gets the final contract from a completed bidding sequence
 * Returns null if bidding was passed out
 */
export function getFinalContract(sequence: BiddingSequence): {
  level: BidLevel;
  strain: Strain;
  doubled: boolean;
  redoubled: boolean;
} | null {
  if (!isBiddingComplete(sequence)) {
    throw new Error('Bidding not complete');
  }

  const lastBid = findLastBid(sequence);

  // Passed out
  if (!lastBid || lastBid.action.type !== 'BID') {
    return null;
  }

  // Check if doubled or redoubled
  let doubled = false;
  let redoubled = false;

  const callsAfterBid = sequence.calls.slice(sequence.calls.indexOf(lastBid) + 1);

  for (const call of callsAfterBid) {
    if (call.action.type === 'DOUBLE') {
      doubled = true;
      redoubled = false; // Reset redouble if there was a new double
    } else if (call.action.type === 'REDOUBLE') {
      redoubled = true;
    }
  }

  return {
    level: lastBid.action.level,
    strain: lastBid.action.strain,
    doubled,
    redoubled,
  };
}

/**
 * Determines the declarer for a contract
 * The declarer is the first player on the declaring side to bid the contract strain
 */
export function determineDeclarer(
  sequence: BiddingSequence,
  contractStrain: Strain
): PositionType | null {
  const lastBid = findLastBid(sequence);
  if (!lastBid || lastBid.action.type !== 'BID') {
    return null;
  }

  const declaringSide = [lastBid.position];
  const positions: PositionType[] = [Position.NORTH, Position.EAST, Position.SOUTH, Position.WEST];
  const lastBidderIndex = positions.indexOf(lastBid.position);
  const partnerIndex = (lastBidderIndex + 2) % 4;
  declaringSide.push(positions[partnerIndex]);

  // Find first player on declaring side to bid the contract strain
  for (const call of sequence.calls) {
    if (
      call.action.type === 'BID' &&
      call.action.strain === contractStrain &&
      declaringSide.includes(call.position)
    ) {
      return call.position;
    }
  }

  return null;
}

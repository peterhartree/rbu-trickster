import type {
  GameState,
  GameAction,
  Deal,
  BidCall,
  BiddingSequence,
  Card,
  Position,
  Trick,
  CardPlayState,
  Contract,
} from '@bridge/shared';
import { GamePhase, Position as Pos, Strain } from '@bridge/shared';
import { getNextPosition, getPartner } from '../cards/deck.js';
import {
  isValidBid,
  getCurrentBidder,
  isBiddingComplete,
  getFinalContract,
  determineDeclarer,
} from '../bidding/bid-validator.js';
import { removeCard } from '../cards/card-utils.js';
import { isValidPlay } from '../play/play-validator.js';
import { determineTrickWinner, isTrickComplete } from '../play/trick-winner.js';
import { calculateDuplicateScore } from '../scoring/duplicate-scorer.js';

/**
 * Game state reducer - handles all game logic and state transitions
 */
export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'DEAL_CARDS':
      return handleDealCards(state, action.deal);

    case 'MAKE_BID':
      return handleMakeBid(state, action.bid);

    case 'PLAY_CARD':
      return handlePlayCard(state, action.card, action.position);

    case 'COMPLETE_HAND':
      return handleCompleteHand(state);

    default:
      return state;
  }
}

/**
 * Handles dealing cards and starting the bidding phase
 */
function handleDealCards(state: GameState, deal: Deal): GameState {
  const biddingSequence: BiddingSequence = {
    calls: [],
    dealer: deal.dealer,
    isComplete: false,
  };

  return {
    ...state,
    phase: GamePhase.BIDDING,
    deal,
    dealer: deal.dealer,
    currentBidder: deal.dealer,
    hands: {
      [Pos.NORTH]: deal.north,
      [Pos.SOUTH]: deal.south,
      [Pos.EAST]: deal.east,
      [Pos.WEST]: deal.west,
    },
    bidding: biddingSequence,
    contract: undefined,
    cardPlay: undefined,
    result: undefined,
    score: undefined,
  };
}

/**
 * Handles making a bid
 */
function handleMakeBid(state: GameState, bid: BidCall): GameState {
  if (state.phase !== GamePhase.BIDDING) {
    throw new Error('Not in bidding phase');
  }

  if (!state.bidding) {
    throw new Error('Bidding sequence not initialized');
  }

  const currentBidder = getCurrentBidder(state.bidding);
  if (bid.position !== currentBidder) {
    throw new Error('Not your turn to bid');
  }

  // Validate bid
  const validation = isValidBid(bid.action, state.bidding, bid.position);
  if (!validation.isValid) {
    throw new Error(validation.reason || 'Invalid bid');
  }

  // Add bid to sequence
  const updatedBidding: BiddingSequence = {
    ...state.bidding,
    calls: [...state.bidding.calls, bid],
  };

  // Check if bidding is complete
  if (isBiddingComplete(updatedBidding)) {
    const finalContract = getFinalContract(updatedBidding);

    // Bidding passed out
    if (!finalContract) {
      return {
        ...state,
        phase: GamePhase.COMPLETE,
        bidding: { ...updatedBidding, isComplete: true },
        currentBidder: undefined,
      };
    }

    // Determine declarer
    const declarer = determineDeclarer(updatedBidding, finalContract.strain);
    if (!declarer) {
      throw new Error('Could not determine declarer');
    }

    const contract: Contract = {
      ...finalContract,
      declarer,
    };

    // Set up card play
    const dummy = getPartner(declarer);
    const openingLeader = getNextPosition(declarer);

    const initialTrick: Trick = {
      number: 1,
      leader: openingLeader,
      cards: [],
      isComplete: false,
    };

    const cardPlayState: CardPlayState = {
      tricks: [],
      currentTrick: initialTrick,
      leader: openingLeader,
      declarer,
      dummy,
      contract,
      nsTricks: 0,
      ewTricks: 0,
    };

    return {
      ...state,
      phase: GamePhase.PLAYING,
      bidding: { ...updatedBidding, isComplete: true, finalContract: contract },
      contract,
      cardPlay: cardPlayState,
      currentBidder: undefined,
      currentPlayer: openingLeader,
    };
  }

  // Bidding continues
  const nextBidder = getNextPosition(currentBidder);

  return {
    ...state,
    bidding: updatedBidding,
    currentBidder: nextBidder,
  };
}

/**
 * Handles playing a card
 */
function handlePlayCard(state: GameState, card: Card, position: Position): GameState {
  if (state.phase !== GamePhase.PLAYING) {
    throw new Error('Not in card play phase');
  }

  if (!state.cardPlay || !state.contract) {
    throw new Error('Card play not initialized');
  }

  // Validate it's the player's turn
  if (position !== state.currentPlayer) {
    throw new Error('Not your turn to play');
  }

  // Get player's hand (or dummy if declarer playing from dummy)
  const hand = state.hands[position];

  // Validate card play
  // Trump suit is the contract strain (unless NT), mapped to Suit enum
  const trumpSuit = state.contract.strain === Strain.NO_TRUMP
    ? null
    : (state.contract.strain as any); // Strain and Suit have same values for suits
  const validation = isValidPlay(card, hand, state.cardPlay.currentTrick, trumpSuit);

  if (!validation.isValid) {
    throw new Error(validation.reason || 'Invalid card play');
  }

  // Add card to trick
  const playedCard = {
    card,
    position,
    timestamp: Date.now(),
  };

  const updatedTrick: Trick = {
    ...state.cardPlay.currentTrick,
    cards: [...state.cardPlay.currentTrick.cards, playedCard],
  };

  // Remove card from hand
  const updatedHand = removeCard(hand, card);
  const updatedHands = {
    ...state.hands,
    [position]: updatedHand,
  };

  // Check if trick is complete
  if (isTrickComplete(updatedTrick)) {
    const winner = determineTrickWinner(updatedTrick, trumpSuit as any);
    const completedTrick: Trick = {
      ...updatedTrick,
      winner,
      isComplete: true,
    };

    // Update trick counts
    const winnerIsNS = winner === Pos.NORTH || winner === Pos.SOUTH;
    const updatedNSTricks = state.cardPlay.nsTricks + (winnerIsNS ? 1 : 0);
    const updatedEWTricks = state.cardPlay.ewTricks + (winnerIsNS ? 0 : 1);

    // Check if hand is complete (13 tricks played)
    const allTricks = [...state.cardPlay.tricks, completedTrick];
    if (allTricks.length === 13) {
      // Calculate result and score
      const declarerIsNS = state.cardPlay.declarer === Pos.NORTH || state.cardPlay.declarer === Pos.SOUTH;
      const tricksMade = declarerIsNS ? updatedNSTricks : updatedEWTricks;

      const result = {
        contract: state.contract,
        tricksMade,
        declarer: state.cardPlay.declarer,
        vulnerability: state.deal!.vulnerability,
      };

      const score = calculateDuplicateScore(result);

      return {
        ...state,
        phase: GamePhase.COMPLETE,
        hands: updatedHands,
        cardPlay: {
          ...state.cardPlay,
          tricks: allTricks,
          currentTrick: completedTrick,
          nsTricks: updatedNSTricks,
          ewTricks: updatedEWTricks,
        },
        result,
        score,
        currentPlayer: undefined,
      };
    }

    // Start new trick
    const newTrick: Trick = {
      number: allTricks.length + 1,
      leader: winner,
      cards: [],
      isComplete: false,
    };

    return {
      ...state,
      hands: updatedHands,
      cardPlay: {
        ...state.cardPlay,
        tricks: allTricks,
        currentTrick: newTrick,
        leader: winner,
        nsTricks: updatedNSTricks,
        ewTricks: updatedEWTricks,
      },
      currentPlayer: winner,
    };
  }

  // Trick continues
  const nextPlayer = getNextPosition(position);

  return {
    ...state,
    hands: updatedHands,
    cardPlay: {
      ...state.cardPlay,
      currentTrick: updatedTrick,
    },
    currentPlayer: nextPlayer,
  };
}

/**
 * Handles completing a hand
 */
function handleCompleteHand(state: GameState): GameState {
  return {
    ...state,
    phase: GamePhase.COMPLETE,
  };
}

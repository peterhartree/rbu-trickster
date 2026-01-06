import { BidMeaning, BidCategory, Suit } from '@bridge/shared';

export const responses: BidMeaning[] = [
  // ========== Responses to 1NT ==========
  {
    bidSequence: '1NT-2C',
    description: 'Stayman: asks for 4-card major',
    requirements: {
      hcp: { min: 8, max: 40 },
    },
    forcing: true,
    category: BidCategory.CONVENTIONAL,
    alertable: true,
    notes: 'Usually shows 4-card major and game interest. Forcing one round.',
  },

  {
    bidSequence: '1NT-2D',
    description: 'Jacoby Transfer to hearts',
    requirements: {
      hcp: { min: 0, max: 40 },
      suits: [{ suit: Suit.HEARTS, minLength: 5 }],
    },
    forcing: true,
    category: BidCategory.CONVENTIONAL,
    alertable: true,
    notes: 'Shows 5+ hearts. Opener must bid 2H.',
  },

  {
    bidSequence: '1NT-2H',
    description: 'Jacoby Transfer to spades',
    requirements: {
      hcp: { min: 0, max: 40 },
      suits: [{ suit: Suit.SPADES, minLength: 5 }],
    },
    forcing: true,
    category: BidCategory.CONVENTIONAL,
    alertable: true,
    notes: 'Shows 5+ spades. Opener must bid 2S.',
  },

  {
    bidSequence: '1NT-2S',
    description: 'Minor suit Stayman or range ask',
    requirements: {
      hcp: { min: 10, max: 40 },
    },
    forcing: true,
    category: BidCategory.CONVENTIONAL,
    alertable: true,
    notes: 'Asks for minor suits, slam interest. Not standard SAYC.',
  },

  {
    bidSequence: '1NT-2NT',
    description: 'Natural, invitational 8-9 HCP',
    requirements: {
      hcp: { min: 8, max: 9 },
      shape: { balanced: true },
    },
    forcing: false,
    category: BidCategory.RESPONSE,
    notes: 'Balanced hand, no 4-card major. Opener passes with minimum, bids 3NT with maximum.',
  },

  {
    bidSequence: '1NT-3C',
    description: 'Natural, forcing to game',
    requirements: {
      hcp: { min: 10, max: 40 },
      suits: [{ suit: Suit.CLUBS, minLength: 6 }],
    },
    forcing: true,
    gameForcing: true,
    category: BidCategory.RESPONSE,
    notes: 'Shows 6+ clubs and game-forcing values. Looking for 3NT or 5C.',
  },

  {
    bidSequence: '1NT-3D',
    description: 'Natural, forcing to game',
    requirements: {
      hcp: { min: 10, max: 40 },
      suits: [{ suit: Suit.DIAMONDS, minLength: 6 }],
    },
    forcing: true,
    gameForcing: true,
    category: BidCategory.RESPONSE,
    notes: 'Shows 6+ diamonds and game-forcing values. Looking for 3NT or 5D.',
  },

  {
    bidSequence: '1NT-3NT',
    description: 'To play, 10-15 HCP',
    requirements: {
      hcp: { min: 10, max: 15 },
      shape: { balanced: true },
    },
    forcing: false,
    category: BidCategory.RESPONSE,
    notes: 'Balanced hand with no interest in majors.',
  },

  {
    bidSequence: '1NT-4NT',
    description: 'Quantitative, inviting 6NT',
    requirements: {
      hcp: { min: 16, max: 17 },
      shape: { balanced: true },
    },
    forcing: false,
    category: BidCategory.RESPONSE,
    notes: 'Not Blackwood. Invites slam with balanced hand. Opener bids 6NT with maximum.',
  },

  // ========== Responses to 1-level suit openings ==========
  {
    bidSequence: '1C-1D',
    description: '4+ diamonds, 6+ HCP',
    requirements: {
      hcp: { min: 6, max: 40 },
      suits: [{ suit: Suit.DIAMONDS, minLength: 4 }],
    },
    forcing: true,
    category: BidCategory.RESPONSE,
    notes: 'Forcing one round. Promises 4+ diamonds.',
  },

  {
    bidSequence: '1C-1H',
    description: '4+ hearts, 6+ HCP',
    requirements: {
      hcp: { min: 6, max: 40 },
      suits: [{ suit: Suit.HEARTS, minLength: 4 }],
    },
    forcing: true,
    category: BidCategory.RESPONSE,
    notes: 'Forcing one round. May have longer spades (bid up the line).',
  },

  {
    bidSequence: '1C-1S',
    description: '4+ spades, 6+ HCP',
    requirements: {
      hcp: { min: 6, max: 40 },
      suits: [{ suit: Suit.SPADES, minLength: 4 }],
    },
    forcing: true,
    category: BidCategory.RESPONSE,
    notes: 'Forcing one round. Promises 4+ spades.',
  },

  {
    bidSequence: '1C-1NT',
    description: '6-10 HCP, balanced, no 4-card major',
    requirements: {
      hcp: { min: 6, max: 10 },
      shape: { balanced: true },
    },
    forcing: false,
    category: BidCategory.RESPONSE,
    notes: 'Usually denies 4-card major. Semi-balanced acceptable.',
  },

  {
    bidSequence: '1C-2C',
    description: '5+ clubs, 10+ HCP, invitational or better',
    requirements: {
      hcp: { min: 10, max: 40 },
      suits: [{ suit: Suit.CLUBS, minLength: 5 }],
    },
    forcing: true,
    category: BidCategory.RESPONSE,
    notes: 'Shows club support and game interest.',
  },

  {
    bidSequence: '1C-2NT',
    description: 'Balanced, 11-12 HCP, game invitational',
    requirements: {
      hcp: { min: 11, max: 12 },
      shape: { balanced: true },
    },
    forcing: false,
    category: BidCategory.RESPONSE,
    notes: 'No 4-card major. Invites 3NT.',
  },

  {
    bidSequence: '1C-3NT',
    description: 'Balanced, 13-15 HCP, to play',
    requirements: {
      hcp: { min: 13, max: 15 },
      shape: { balanced: true },
    },
    forcing: false,
    category: BidCategory.RESPONSE,
    notes: 'No interest in exploring for suit contracts.',
  },

  // Responses to major suit openings
  {
    bidSequence: '1H-1S',
    description: '4+ spades, 6+ HCP',
    requirements: {
      hcp: { min: 6, max: 40 },
      suits: [{ suit: Suit.SPADES, minLength: 4 }],
    },
    forcing: true,
    category: BidCategory.RESPONSE,
    notes: 'Forcing one round. Looking for spade fit.',
  },

  {
    bidSequence: '1H-1NT',
    description: '6-10 HCP, fewer than 3 hearts',
    requirements: {
      hcp: { min: 6, max: 10 },
    },
    forcing: false,
    category: BidCategory.RESPONSE,
    notes: 'Denies 3-card support for hearts. Usually balanced or semi-balanced.',
  },

  {
    bidSequence: '1H-2H',
    description: '3+ hearts, 6-10 HCP',
    requirements: {
      hcp: { min: 6, max: 10 },
      suits: [{ suit: Suit.HEARTS, minLength: 3 }],
    },
    forcing: false,
    category: BidCategory.RESPONSE,
    notes: 'Simple raise, shows heart support but limited values.',
  },

  {
    bidSequence: '1H-3H',
    description: '4+ hearts, 10-12 HCP, invitational',
    requirements: {
      hcp: { min: 10, max: 12 },
      suits: [{ suit: Suit.HEARTS, minLength: 4 }],
    },
    forcing: false,
    category: BidCategory.RESPONSE,
    notes: 'Limit raise. Opener passes with minimum, bids 4H with extras.',
  },

  {
    bidSequence: '1H-4H',
    description: '5+ hearts, 6-10 HCP, preemptive',
    requirements: {
      hcp: { min: 6, max: 10 },
      suits: [{ suit: Suit.HEARTS, minLength: 5 }],
    },
    forcing: false,
    category: BidCategory.RESPONSE,
    notes: 'Weak hand with lots of trumps. To play.',
  },

  {
    bidSequence: '1S-1NT',
    description: '6-10 HCP, fewer than 3 spades',
    requirements: {
      hcp: { min: 6, max: 10 },
    },
    forcing: false,
    category: BidCategory.RESPONSE,
    notes: 'Denies 3-card support for spades. Usually balanced or semi-balanced.',
  },

  {
    bidSequence: '1S-2S',
    description: '3+ spades, 6-10 HCP',
    requirements: {
      hcp: { min: 6, max: 10 },
      suits: [{ suit: Suit.SPADES, minLength: 3 }],
    },
    forcing: false,
    category: BidCategory.RESPONSE,
    notes: 'Simple raise, shows spade support but limited values.',
  },

  {
    bidSequence: '1S-3S',
    description: '4+ spades, 10-12 HCP, invitational',
    requirements: {
      hcp: { min: 10, max: 12 },
      suits: [{ suit: Suit.SPADES, minLength: 4 }],
    },
    forcing: false,
    category: BidCategory.RESPONSE,
    notes: 'Limit raise. Opener passes with minimum, bids 4S with extras.',
  },

  {
    bidSequence: '1S-4S',
    description: '5+ spades, 6-10 HCP, preemptive',
    requirements: {
      hcp: { min: 6, max: 10 },
      suits: [{ suit: Suit.SPADES, minLength: 5 }],
    },
    forcing: false,
    category: BidCategory.RESPONSE,
    notes: 'Weak hand with lots of trumps. To play.',
  },

  // ========== Responses to 2C strong opening ==========
  {
    bidSequence: '2C-2D',
    description: 'Waiting bid, 0-7 HCP or no good suit',
    requirements: {
      hcp: { min: 0, max: 40 },
    },
    forcing: true,
    category: BidCategory.RESPONSE,
    alertable: true,
    notes: 'Artificial waiting bid. Says nothing about diamonds. Usually shows weak hand.',
  },

  {
    bidSequence: '2C-2H',
    description: 'Natural, 5+ hearts, 8+ HCP',
    requirements: {
      hcp: { min: 8, max: 40 },
      suits: [{ suit: Suit.HEARTS, minLength: 5 }],
    },
    forcing: true,
    gameForcing: true,
    category: BidCategory.RESPONSE,
    notes: 'Shows a good heart suit and positive values.',
  },

  {
    bidSequence: '2C-2S',
    description: 'Natural, 5+ spades, 8+ HCP',
    requirements: {
      hcp: { min: 8, max: 40 },
      suits: [{ suit: Suit.SPADES, minLength: 5 }],
    },
    forcing: true,
    gameForcing: true,
    category: BidCategory.RESPONSE,
    notes: 'Shows a good spade suit and positive values.',
  },

  {
    bidSequence: '2C-2NT',
    description: 'Balanced, 8+ HCP, positive response',
    requirements: {
      hcp: { min: 8, max: 40 },
      shape: { balanced: true },
    },
    forcing: true,
    gameForcing: true,
    category: BidCategory.RESPONSE,
    notes: 'Shows balanced hand with game-forcing values.',
  },

  // ========== Responses to weak two bids ==========
  {
    bidSequence: '2D-2NT',
    description: 'Feature ask (Ogust)',
    requirements: {
      hcp: { min: 15, max: 40 },
    },
    forcing: true,
    category: BidCategory.CONVENTIONAL,
    alertable: true,
    notes: 'Asks opener to describe hand quality. 3C=bad suit/hand, 3D=bad suit/good hand, 3H=good suit/bad hand, 3S=good suit/good hand.',
  },

  {
    bidSequence: '2H-2NT',
    description: 'Feature ask (Ogust)',
    requirements: {
      hcp: { min: 15, max: 40 },
    },
    forcing: true,
    category: BidCategory.CONVENTIONAL,
    alertable: true,
    notes: 'Asks opener to describe hand quality. 3C=bad suit/hand, 3D=bad suit/good hand, 3H=bad suit/good hand (rebid), 3S=good suit/bad hand, 3NT=good suit/good hand.',
  },

  {
    bidSequence: '2S-2NT',
    description: 'Feature ask (Ogust)',
    requirements: {
      hcp: { min: 15, max: 40 },
    },
    forcing: true,
    category: BidCategory.CONVENTIONAL,
    alertable: true,
    notes: 'Asks opener to describe hand quality.',
  },
];

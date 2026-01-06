import { BidMeaning, BidCategory, Suit } from '@bridge/shared';

export const openingBids: BidMeaning[] = [
  // 1NT Opening
  {
    bidSequence: '1NT',
    description: 'Balanced hand with 15-17 HCP',
    requirements: {
      hcp: { min: 15, max: 17 },
      shape: { balanced: true },
      stoppers: [Suit.CLUBS, Suit.DIAMONDS, Suit.HEARTS, Suit.SPADES],
    },
    forcing: false,
    category: BidCategory.OPENING,
    notes: 'Should have stoppers in at least 3 suits. May have 5-card major.',
  },

  // 1-level suit openings
  {
    bidSequence: '1C',
    description: 'Better minor with 13+ HCP, or longest suit if minors equal',
    requirements: {
      hcp: { min: 13, max: 21 },
      suits: [{ suit: Suit.CLUBS, minLength: 3 }],
    },
    forcing: false,
    category: BidCategory.OPENING,
    notes: 'May be only 3 cards if 4-4-3-2 shape. Prefer 1D with 4-4 in minors.',
  },

  {
    bidSequence: '1D',
    description: 'Better minor with 13+ HCP, or longest suit if minors equal',
    requirements: {
      hcp: { min: 13, max: 21 },
      suits: [{ suit: Suit.DIAMONDS, minLength: 3 }],
    },
    forcing: false,
    category: BidCategory.OPENING,
    notes: 'Usually 4+ cards. Prefer 1D over 1C with 4-4 in minors.',
  },

  {
    bidSequence: '1H',
    description: '5-card major with 13+ HCP',
    requirements: {
      hcp: { min: 13, max: 21 },
      suits: [{ suit: Suit.HEARTS, minLength: 5 }],
    },
    forcing: false,
    category: BidCategory.OPENING,
    notes: 'In SAYC, major suit openings promise 5+ cards.',
  },

  {
    bidSequence: '1S',
    description: '5-card major with 13+ HCP',
    requirements: {
      hcp: { min: 13, max: 21 },
      suits: [{ suit: Suit.SPADES, minLength: 5 }],
    },
    forcing: false,
    category: BidCategory.OPENING,
    notes: 'In SAYC, major suit openings promise 5+ cards.',
  },

  // 2-level openings
  {
    bidSequence: '2C',
    description: 'Strong artificial opening, 22+ HCP or 9+ playing tricks',
    requirements: {
      hcp: { min: 22, max: 40 },
    },
    forcing: true,
    gameForcing: false,
    category: BidCategory.OPENING,
    alertable: true,
    notes: 'Forcing to game unless responder bids 2D (waiting) and opener rebids 2NT (22-24).',
  },

  {
    bidSequence: '2D',
    description: 'Weak two bid, 6-card suit, 5-11 HCP',
    requirements: {
      hcp: { min: 5, max: 11 },
      suits: [{ suit: Suit.DIAMONDS, minLength: 6 }],
    },
    forcing: false,
    category: BidCategory.OPENING,
    notes: 'Good 6-card suit, usually 2 of top 3 honours.',
  },

  {
    bidSequence: '2H',
    description: 'Weak two bid, 6-card suit, 5-11 HCP',
    requirements: {
      hcp: { min: 5, max: 11 },
      suits: [{ suit: Suit.HEARTS, minLength: 6 }],
    },
    forcing: false,
    category: BidCategory.OPENING,
    notes: 'Good 6-card suit, usually 2 of top 3 honours.',
  },

  {
    bidSequence: '2S',
    description: 'Weak two bid, 6-card suit, 5-11 HCP',
    requirements: {
      hcp: { min: 5, max: 11 },
      suits: [{ suit: Suit.SPADES, minLength: 6 }],
    },
    forcing: false,
    category: BidCategory.OPENING,
    notes: 'Good 6-card suit, usually 2 of top 3 honours.',
  },

  {
    bidSequence: '2NT',
    description: 'Balanced hand with 20-21 HCP',
    requirements: {
      hcp: { min: 20, max: 21 },
      shape: { balanced: true },
    },
    forcing: false,
    category: BidCategory.OPENING,
    notes: 'Same shape requirements as 1NT, but stronger.',
  },

  // 3-level preempts
  {
    bidSequence: '3C',
    description: 'Preemptive, 7-card suit, 5-11 HCP',
    requirements: {
      hcp: { min: 5, max: 11 },
      suits: [{ suit: Suit.CLUBS, minLength: 7 }],
    },
    forcing: false,
    category: BidCategory.OPENING,
    notes: 'Vulnerable: upper range. Non-vulnerable: wider range acceptable.',
  },

  {
    bidSequence: '3D',
    description: 'Preemptive, 7-card suit, 5-11 HCP',
    requirements: {
      hcp: { min: 5, max: 11 },
      suits: [{ suit: Suit.DIAMONDS, minLength: 7 }],
    },
    forcing: false,
    category: BidCategory.OPENING,
    notes: 'Vulnerable: upper range. Non-vulnerable: wider range acceptable.',
  },

  {
    bidSequence: '3H',
    description: 'Preemptive, 7-card suit, 5-11 HCP',
    requirements: {
      hcp: { min: 5, max: 11 },
      suits: [{ suit: Suit.HEARTS, minLength: 7 }],
    },
    forcing: false,
    category: BidCategory.OPENING,
    notes: 'Vulnerable: upper range. Non-vulnerable: wider range acceptable.',
  },

  {
    bidSequence: '3S',
    description: 'Preemptive, 7-card suit, 5-11 HCP',
    requirements: {
      hcp: { min: 5, max: 11 },
      suits: [{ suit: Suit.SPADES, minLength: 7 }],
    },
    forcing: false,
    category: BidCategory.OPENING,
    notes: 'Vulnerable: upper range. Non-vulnerable: wider range acceptable.',
  },

  {
    bidSequence: '3NT',
    description: 'Gambling 3NT or solid minor suit',
    requirements: {
      hcp: { min: 10, max: 15 },
      suits: [
        { suit: Suit.CLUBS, minLength: 7, minHonours: 3 },
        { suit: Suit.DIAMONDS, minLength: 7, minHonours: 3 },
      ],
    },
    forcing: false,
    category: BidCategory.OPENING,
    alertable: true,
    notes: 'Solid 7+ card minor (AKQxxxx), little outside. Partner passes or bids 4C/4D.',
  },

  // 4-level preempts
  {
    bidSequence: '4C',
    description: 'Preemptive, 8-card suit',
    requirements: {
      hcp: { min: 5, max: 11 },
      suits: [{ suit: Suit.CLUBS, minLength: 8 }],
    },
    forcing: false,
    category: BidCategory.OPENING,
  },

  {
    bidSequence: '4D',
    description: 'Preemptive, 8-card suit',
    requirements: {
      hcp: { min: 5, max: 11 },
      suits: [{ suit: Suit.DIAMONDS, minLength: 8 }],
    },
    forcing: false,
    category: BidCategory.OPENING,
  },

  {
    bidSequence: '4H',
    description: 'Preemptive, 8-card suit',
    requirements: {
      hcp: { min: 5, max: 11 },
      suits: [{ suit: Suit.HEARTS, minLength: 8 }],
    },
    forcing: false,
    category: BidCategory.OPENING,
  },

  {
    bidSequence: '4S',
    description: 'Preemptive, 8-card suit',
    requirements: {
      hcp: { min: 5, max: 11 },
      suits: [{ suit: Suit.SPADES, minLength: 8 }],
    },
    forcing: false,
    category: BidCategory.OPENING,
  },
];

import { DefensiveSignal } from '@bridge/shared';

export const defensiveSignals: DefensiveSignal[] = [
  {
    name: 'Standard Attitude Signals',
    description: 'High card encourages, low card discourages',
    type: 'attitude',
    rules: [
      'When partner leads and you are not trying to win the trick, signal attitude',
      'High card (9, 8, 7) = "I like this suit, please continue"',
      'Low card (2, 3, 4) = "I don\'t like this suit, switch"',
      'Middle cards (5, 6) are ambiguous',
      'Used when following to partner\'s lead',
    ],
  },

  {
    name: 'Standard Count Signals',
    description: 'High-low shows even number, low-high shows odd',
    type: 'count',
    rules: [
      'When declarer is playing the suit, give count',
      'High then low (9 then 2) = even number (2 or 4 cards)',
      'Low then high (2 then 9) = odd number (3 or 5 cards)',
      'Helps partner know when to take tricks',
      'Used primarily when following to declarer\'s leads',
    ],
  },

  {
    name: 'Attitude on Partner\'s Lead (NT)',
    description: 'Show whether you like partner\'s lead vs NT',
    type: 'attitude',
    rules: [
      'Partner leads 4th best vs NT - signal attitude',
      'High card = honour in suit, please continue',
      'Low card = no help, consider shifting',
      'Critical for defence coordination',
      'Partner uses this to decide continuation',
    ],
  },

  {
    name: 'Count on Declarer\'s Lead',
    description: 'Show your length when declarer leads',
    type: 'count',
    rules: [
      'Declarer plays a suit - give count',
      'Helps partner know when to take Ace or King',
      'High-low = even number',
      'Low-high = odd number',
      'Especially important in NT contracts',
    ],
  },

  {
    name: 'Suit Preference Signals',
    description: 'Show which suit you want partner to lead next',
    type: 'suit-preference',
    rules: [
      'Used when attitude and count are irrelevant',
      'High card = want higher-ranking suit',
      'Low card = want lower-ranking suit',
      'Example: Ruffing situation - signal which suit to return',
      'Example: Partner has shown out - signal entry suit',
      'Most advanced signal - use sparingly',
    ],
  },

  {
    name: 'Trump Suit Preference',
    description: 'Special signals when returning trump',
    type: 'suit-preference',
    rules: [
      'When returning trump, card chosen shows preference',
      'High trump = entry in higher suit',
      'Low trump = entry in lower suit',
      'Used after winning a trick and returning trump to partner',
      'Helps partner know where your entry is',
    ],
  },

  {
    name: 'Attitude vs Ace Lead (Suits)',
    description: 'Special signal when partner leads Ace in suit contract',
    type: 'attitude',
    rules: [
      'Partner leads Ace - signal attitude not count',
      'High card = King, Queen, or singleton',
      'Low card = no help in this suit',
      'Helps partner decide if King will win next trick',
      'Different from NT defence',
    ],
  },

  {
    name: 'Count vs King Lead (Suits)',
    description: 'Special signal when partner leads King in suit contract',
    type: 'count',
    rules: [
      'Partner leads King from AK - signal count',
      'High-low = even number (often doubleton)',
      'Low-high = odd number',
      'Partner may underlead Ace next if you show doubleton',
      'King from AK asks for count in SAYC',
    ],
  },

  {
    name: 'Discard Attitude',
    description: 'When discarding, show what you want led',
    type: 'attitude',
    rules: [
      'When you must discard (can\'t follow suit)',
      'Discard from suit you DON\'T want led',
      'Keep cards in suits you DO want led',
      'High discard in a suit = interest in that suit',
      'Low discard in a suit = no interest',
      'Lavinthal: high card = want higher side suit, low = lower side suit',
    ],
  },

  {
    name: 'Smith Echo (NT)',
    description: 'Second hand echo to show attitude for opening lead',
    type: 'attitude',
    rules: [
      'Used in NT contracts only',
      'On declarer\'s first lead from dummy',
      'High-low = like the opening lead suit',
      'Low-high = dislike the opening lead suit',
      'Helps partner know if to continue opening lead when in',
      'Not standard SAYC - advanced technique',
    ],
  },
];

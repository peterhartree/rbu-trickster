import { LeadConvention } from '@bridge/shared';

export const leadConventions: LeadConvention[] = [
  {
    name: 'Fourth-best from longest and strongest',
    description: 'Lead fourth-highest card from your longest and strongest suit',
    situation: 'Opening lead vs NT contracts',
    rules: [
      'Lead 4th best from your longest suit',
      'From KJ1032, lead the 3',
      'From QJ95, lead the 5',
      'Rule of 11: Subtract card led from 11 to know how many higher cards others hold',
      'Prefer sequences (KQJ, QJ10) - lead top of sequence',
    ],
  },

  {
    name: 'Top of sequence',
    description: 'Lead top card from touching honours',
    situation: 'Opening lead vs all contracts',
    rules: [
      'From KQJ, lead King',
      'From QJ10, lead Queen',
      'From J109, lead Jack',
      'From 10987, lead 10',
      'Sequence must be 3 touching cards or 2 touching honours with 10',
    ],
  },

  {
    name: 'Top of nothing',
    description: 'Lead highest card from worthless holdings',
    situation: 'Opening lead when holding no honours',
    rules: [
      'From 972, lead 9',
      'From 8432, lead 8',
      'Shows no honour in the suit',
      'Partner should assume you have nothing',
    ],
  },

  {
    name: 'MUD (Middle-Up-Down)',
    description: 'From three small cards, lead middle, then up, then down',
    situation: 'Opening lead from worthless tripleton',
    rules: [
      'From 742, lead 4, then 7, then 2',
      'Middle card on opening lead',
      'Next time play higher card',
      'Third time play lowest',
      'Helps partner count your length',
    ],
  },

  {
    name: 'Ace from Ace-King',
    description: 'Lead Ace from AK combination in suit contracts',
    situation: 'Opening lead vs suit contracts',
    rules: [
      'From AKx, lead Ace',
      'Asks partner for count or attitude',
      'King from AK is used vs NT contracts',
      'Follow with King if you want signal',
    ],
  },

  {
    name: 'King from Ace-King',
    description: 'Lead King from AK combination vs NT',
    situation: 'Opening lead vs NT contracts',
    rules: [
      'From AKx, lead King',
      'Asks partner for count',
      'Different from suit contract leads',
      'Partner should give count signal',
    ],
  },

  {
    name: 'Low from honour',
    description: 'Lead low from Ace or King without sequence',
    situation: 'Opening lead with single honour',
    rules: [
      'From Axx, lead low (4th best if 4+ cards)',
      'From Kxxx, lead 4th best',
      'Trying to establish suit while retaining high card',
      'Works best when partner has strength in the suit',
    ],
  },

  {
    name: "Partner's suit",
    description: 'Lead the suit partner bid',
    situation: 'When partner has bid a suit',
    rules: [
      'Usually lead top of doubleton (Q7, lead Q)',
      'Lead low from 3+ cards (Q72, lead 2)',
      'Lead top of sequence if you have one',
      'Showing support and preference',
    ],
  },

  {
    name: 'Trump leads',
    description: 'When to lead a trump',
    situation: 'Opening lead in suit contracts',
    rules: [
      'Lead when opponents struggled to find a fit',
      'Lead when opponents have two suits and found refuge in trumps',
      'Lead when dummy showed short suit and declarer pulled trumps',
      'Usually lead low from honour, top of sequence',
      'Avoid when you have trump tricks naturally',
    ],
  },

  {
    name: 'Attitude vs suit contracts',
    description: 'Defensive signals in suit play',
    situation: 'After opening lead in suit contract',
    rules: [
      "Partner leads Ace - give attitude (high=like, low=don't like)",
      'Partner leads King - give count (high=even, low=odd)',
      'Partner leads Queen - give count',
      'These signals help partner decide continuation',
    ],
  },
];

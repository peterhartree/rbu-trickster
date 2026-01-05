/**
 * IMP (International Match Points) conversion table
 * Standard WBF IMP scale
 */
interface IMPEntry {
  maxDiff: number;
  imps: number;
}

const IMP_TABLE: IMPEntry[] = [
  { maxDiff: 10, imps: 0 },
  { maxDiff: 40, imps: 1 },
  { maxDiff: 80, imps: 2 },
  { maxDiff: 120, imps: 3 },
  { maxDiff: 160, imps: 4 },
  { maxDiff: 210, imps: 5 },
  { maxDiff: 260, imps: 6 },
  { maxDiff: 310, imps: 7 },
  { maxDiff: 360, imps: 8 },
  { maxDiff: 420, imps: 9 },
  { maxDiff: 490, imps: 10 },
  { maxDiff: 590, imps: 11 },
  { maxDiff: 740, imps: 12 },
  { maxDiff: 890, imps: 13 },
  { maxDiff: 1090, imps: 14 },
  { maxDiff: 1290, imps: 15 },
  { maxDiff: 1490, imps: 16 },
  { maxDiff: 1740, imps: 17 },
  { maxDiff: 1990, imps: 18 },
  { maxDiff: 2240, imps: 19 },
  { maxDiff: 2490, imps: 20 },
  { maxDiff: 2990, imps: 21 },
  { maxDiff: 3490, imps: 22 },
  { maxDiff: 3990, imps: 23 },
  { maxDiff: Infinity, imps: 24 },
];

/**
 * Converts a point difference to IMPs
 * Positive difference = positive IMPs, negative difference = negative IMPs
 */
export function convertToIMPs(difference: number): number {
  const absDiff = Math.abs(difference);
  const entry = IMP_TABLE.find((e) => absDiff <= e.maxDiff);

  if (!entry) {
    return difference >= 0 ? 24 : -24;
  }

  return difference >= 0 ? entry.imps : -entry.imps;
}

/**
 * Compares two scores and returns IMP difference
 * Returns positive IMPs if ourScore > theirScore
 */
export function compareScoresForIMPs(ourScore: number, theirScore: number): number {
  return convertToIMPs(ourScore - theirScore);
}

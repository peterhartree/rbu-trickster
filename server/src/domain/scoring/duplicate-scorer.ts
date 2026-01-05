import type { Contract, ContractResult, DuplicateScore, Position } from '@bridge/shared';
import { Strain, Position as Pos } from '@bridge/shared';

/**
 * Calculates contract points for tricks bid and made
 */
function getContractPoints(contract: Contract, tricksMade: number, vulnerable: boolean): number {
  const tricksRequired = 6 + contract.level;
  const tricksMadeInContract = Math.min(tricksMade, tricksRequired);
  const tricksInContract = tricksMadeInContract - 6; // Tricks above 6

  let pointsPerTrick: number;

  // Determine points per trick
  if (contract.strain === Strain.NO_TRUMP) {
    // First trick is 40, subsequent tricks are 30
    pointsPerTrick = 30;
    const firstTrickBonus = 10;
    let points = tricksInContract > 0 ? firstTrickBonus : 0;
    points += tricksInContract * pointsPerTrick;

    if (contract.doubled) points *= 2;
    if (contract.redoubled) points *= 2;

    return points;
  } else if (contract.strain === Strain.HEARTS || contract.strain === Strain.SPADES) {
    // Major suits: 30 per trick
    pointsPerTrick = 30;
  } else {
    // Minor suits: 20 per trick
    pointsPerTrick = 20;
  }

  let points = tricksInContract * pointsPerTrick;

  if (contract.doubled) points *= 2;
  if (contract.redoubled) points *= 2;

  return points;
}

/**
 * Calculates overtrick points
 */
function calculateOvertricks(
  overtricks: number,
  contract: Contract,
  vulnerable: boolean
): number {
  if (overtricks <= 0) return 0;

  if (contract.doubled) {
    const pointsPerOvertrick = vulnerable ? 200 : 100;
    return overtricks * pointsPerOvertrick * (contract.redoubled ? 2 : 1);
  }

  // Not doubled
  let pointsPerTrick: number;
  if (contract.strain === Strain.NO_TRUMP ||
      contract.strain === Strain.HEARTS ||
      contract.strain === Strain.SPADES) {
    pointsPerTrick = 30;
  } else {
    pointsPerTrick = 20;
  }

  return overtricks * pointsPerTrick;
}

/**
 * Calculates undertrick penalties
 */
function calculateUndertrickPenalty(
  undertricks: number,
  vulnerable: boolean,
  doubled: boolean,
  redoubled: boolean
): number {
  if (undertricks <= 0) return 0;

  if (!doubled) {
    // Not doubled: 50 per trick non-vul, 100 per trick vul
    return undertricks * (vulnerable ? 100 : 50);
  }

  // Doubled or redoubled
  const multiplier = redoubled ? 2 : 1;

  if (!vulnerable) {
    // Non-vulnerable doubled
    // First undertrick: 100, subsequent: 200 each
    let penalty = 100; // First undertrick
    if (undertricks > 1) {
      penalty += (undertricks - 1) * 200;
    }
    return penalty * multiplier;
  } else {
    // Vulnerable doubled
    // First undertrick: 200, subsequent: 300 each
    let penalty = 200; // First undertrick
    if (undertricks > 1) {
      penalty += (undertricks - 1) * 300;
    }
    return penalty * multiplier;
  }
}

/**
 * Calculates duplicate bridge score
 */
export function calculateDuplicateScore(result: ContractResult): DuplicateScore {
  const { contract, tricksMade, declarer, vulnerability } = result;
  const tricksRequired = 6 + contract.level;
  const tricksDiff = tricksMade - tricksRequired;

  // Determine if declarer is NS or EW
  const declarerIsNS = declarer === Pos.NORTH || declarer === Pos.SOUTH;
  const vul = declarerIsNS ? vulnerability.ns : vulnerability.ew;

  // Contract failed
  if (tricksDiff < 0) {
    const undertricks = Math.abs(tricksDiff);
    const penalty = calculateUndertrickPenalty(
      undertricks,
      vul,
      contract.doubled,
      contract.redoubled
    );

    return {
      contractPoints: 0,
      overtricks: 0,
      undertricks: penalty,
      doubleBonus: 0,
      gameBonus: 0,
      slamBonus: 0,
      insultBonus: 0,
      totalScore: declarerIsNS ? -penalty : penalty,
      nsScore: declarerIsNS ? -penalty : penalty,
      ewScore: declarerIsNS ? penalty : -penalty,
      isGame: false,
      isSlam: false,
    };
  }

  // Contract made
  let score = 0;

  // Contract points
  const contractPoints = getContractPoints(contract, tricksMade, vul);
  score += contractPoints;

  // Overtricks
  const overtrickPoints = calculateOvertricks(tricksDiff, contract, vul);
  score += overtrickPoints;

  // Game bonus
  const isGame = contractPoints >= 100;
  const gameBonus = isGame ? (vul ? 500 : 300) : 50; // Part-game bonus
  score += gameBonus;

  // Slam bonus
  let slamBonus = 0;
  const isSlam = contract.level >= 6;
  if (contract.level === 6) {
    slamBonus = vul ? 750 : 500; // Small slam
  } else if (contract.level === 7) {
    slamBonus = vul ? 1500 : 1000; // Grand slam
  }
  score += slamBonus;

  // Insult bonus (for making doubled/redoubled contract)
  let insultBonus = 0;
  if (contract.doubled) {
    insultBonus = 50;
    if (contract.redoubled) {
      insultBonus = 100;
    }
  }
  score += insultBonus;

  return {
    contractPoints,
    overtricks: overtrickPoints,
    undertricks: 0,
    doubleBonus: contract.doubled ? (contract.redoubled ? 100 : 50) : 0,
    gameBonus,
    slamBonus,
    insultBonus,
    totalScore: score,
    nsScore: declarerIsNS ? score : -score,
    ewScore: declarerIsNS ? -score : score,
    isGame,
    isSlam,
  };
}

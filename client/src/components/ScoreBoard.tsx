import { useState, useEffect } from 'react';
import type { GameState, Strain, Position } from '@bridge/shared';
import { Strain as Strn } from '@bridge/shared';

const positionNames: Record<Position, string> = {
  N: 'North',
  E: 'East',
  S: 'South',
  W: 'West',
};

interface ScoreBoardProps {
  gameState: Partial<GameState>;
}

const strainSymbols: Record<Strain, string> = {
  [Strn.CLUBS]: '\u2663',
  [Strn.DIAMONDS]: '\u2666',
  [Strn.HEARTS]: '\u2665',
  [Strn.SPADES]: '\u2660',
  [Strn.NO_TRUMP]: 'NT',
};

const suitColors: Record<Strain, string> = {
  [Strn.CLUBS]: 'text-deco-club',
  [Strn.DIAMONDS]: 'text-deco-diamond',
  [Strn.HEARTS]: 'text-deco-heart',
  [Strn.SPADES]: 'text-deco-spade',
  [Strn.NO_TRUMP]: 'text-deco-gold',
};

function ScoreBoard({ gameState }: ScoreBoardProps) {
  const contract = gameState.contract;
  const score = gameState.score;
  const result = gameState.result;
  const biddingCalls = gameState.bidding?.calls;

  // Auto-collapse bidding history after first card is played
  const cardsPlayed = (gameState.cardPlay?.tricks?.length || 0) > 0 ||
    (gameState.cardPlay?.currentTrick?.cards?.length || 0) > 0;
  const [biddingExpanded, setBiddingExpanded] = useState(true);

  useEffect(() => {
    if (cardsPlayed) {
      setBiddingExpanded(false);
    }
  }, [cardsPlayed]);

  // Helper: show "Name (East)" or just "East" if no name
  const getDisplayName = (position: string): string => {
    const name = gameState.players?.[position as keyof typeof gameState.players]?.name;
    const posName = positionNames[position as keyof typeof positionNames];
    return name ? `${name} (${posName})` : posName || position;
  };

  const getShortName = (position: string): string => {
    const name = gameState.players?.[position as keyof typeof gameState.players]?.name;
    return name ? `${name.split(' ')[0]}` : position;
  };

  if (!contract) {
    return (
      <div className="bg-deco-midnight rounded-lg shadow-deco border border-deco-gold/20 p-4">
        <h2 className="text-lg font-display font-bold text-deco-gold">Score</h2>
        <p className="text-deco-cream/60 mt-3">No contract yet</p>
      </div>
    );
  }

  const tricksNeeded = 6 + contract.level;
  const nsTricks = gameState.cardPlay?.nsTricks ?? 0;
  const ewTricks = gameState.cardPlay?.ewTricks ?? 0;
  const isNsDeclarer = contract.declarer === 'N' || contract.declarer === 'S';
  const declarerTricks = isNsDeclarer ? nsTricks : ewTricks;
  const defenseTricks = isNsDeclarer ? ewTricks : nsTricks;
  const tricksStillNeeded = Math.max(0, tricksNeeded - declarerTricks);

  return (
    <div className="bg-deco-midnight rounded-lg shadow-deco border border-deco-gold/20 p-4">
      {/* Bidding history */}
      {biddingCalls && biddingCalls.length > 0 && (
        <div className="mb-3">
          <button
            onClick={() => setBiddingExpanded(!biddingExpanded)}
            className="w-full flex items-center justify-between text-xs text-deco-cream/60 hover:text-deco-cream/80 transition-colors mb-1"
          >
            <span className="font-semibold tracking-widest uppercase">Bidding</span>
            <span>{biddingExpanded ? '▾' : '▸'}</span>
          </button>
          {biddingExpanded ? (
            <div className="flex flex-wrap gap-1">
              {biddingCalls.map((call, index) => (
                <div
                  key={index}
                  className="shrink-0 bg-deco-cream/90 rounded px-1.5 py-0.5 text-xs flex items-center space-x-1 border border-deco-gold/30"
                >
                  <span className="font-mono text-[10px] text-deco-navy/60">{getShortName(call.position)}</span>
                  <span className={`font-display font-semibold ${call.action.type === 'BID' ? suitColors[call.action.strain] : 'text-deco-navy/70'}`}>
                    {call.action.type === 'BID'
                      ? `${call.action.level}${strainSymbols[call.action.strain]}`
                      : call.action.type === 'PASS'
                      ? 'Pass'
                      : call.action.type === 'DOUBLE'
                      ? 'X'
                      : 'XX'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-deco-cream/50">
              {biddingCalls.length} calls — click to expand
            </p>
          )}
        </div>
      )}

      {/* Trick counter - prominent */}
      {gameState.cardPlay && (
        <div className="mb-3 bg-deco-navy rounded-lg p-3 border border-deco-gold/20">
          <div className="grid grid-cols-2 gap-3 mb-2">
            <div className="text-center">
              <span className="text-xs text-deco-cream/60 block">N-S</span>
              <span className="text-2xl font-display font-bold text-deco-gold">{nsTricks}</span>
            </div>
            <div className="text-center">
              <span className="text-xs text-deco-cream/60 block">E-W</span>
              <span className="text-2xl font-display font-bold text-deco-gold">{ewTricks}</span>
            </div>
          </div>
          <p className="text-xs text-center text-deco-cream/60">
            {tricksStillNeeded > 0
              ? `Need ${tricksStillNeeded} more trick${tricksStillNeeded !== 1 ? 's' : ''} to make`
              : declarerTricks === tricksNeeded
                ? 'Contract just made!'
                : `Made +${declarerTricks - tricksNeeded} overtrick${declarerTricks - tricksNeeded !== 1 ? 's' : ''}`
            }
            {defenseTricks > 13 - tricksNeeded && (
              <span className="text-deco-heart"> · Down {defenseTricks - (13 - tricksNeeded)}</span>
            )}
          </p>
        </div>
      )}

      {/* Contract info */}
      <div className="mb-3 bg-deco-navy rounded-lg p-3 border border-deco-gold/10">
        <h3 className="font-semibold mb-1 text-deco-cream/70 text-xs tracking-widest uppercase">Contract</h3>
        <p className="text-2xl font-display font-bold text-deco-gold">
          {contract.level}
          {strainSymbols[contract.strain]}
          {contract.doubled && 'X'}
          {contract.redoubled && 'XX'}
        </p>
        <p className="text-sm text-deco-cream/60 mt-1">
          Declarer: <span className="font-semibold text-deco-cream/80">{getDisplayName(contract.declarer)}</span>
        </p>
      </div>

      {/* Result */}
      {result && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2 text-deco-cream/70 text-xs tracking-widest uppercase">Result</h3>
          <p className="text-2xl font-display font-bold text-deco-cream">
            {result.tricksMade} tricks
          </p>
          <p className="text-sm text-deco-cream/60">
            ({result.tricksMade >= 6 + contract.level ? 'Made' : 'Down'}{' '}
            {Math.abs(result.tricksMade - (6 + contract.level))})
          </p>
        </div>
      )}

      {/* Score breakdown */}
      {score && (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-3 text-deco-cream/70 text-xs tracking-widest uppercase">Score breakdown</h3>
            <div className="space-y-2 text-sm">
              {score.contractPoints > 0 && (
                <div className="flex justify-between text-deco-cream/80">
                  <span>Contract points:</span>
                  <span className="font-semibold text-deco-gold">{score.contractPoints}</span>
                </div>
              )}
              {score.overtricks > 0 && (
                <div className="flex justify-between text-deco-cream/80">
                  <span>Overtricks:</span>
                  <span className="font-semibold text-deco-gold">{score.overtricks}</span>
                </div>
              )}
              {score.undertricks > 0 && (
                <div className="flex justify-between text-deco-cream/80">
                  <span>Undertricks:</span>
                  <span className="font-semibold text-deco-heart">-{score.undertricks}</span>
                </div>
              )}
              {score.gameBonus > 0 && (
                <div className="flex justify-between text-deco-cream/80">
                  <span>{score.isGame ? 'Game' : 'Part-game'} bonus:</span>
                  <span className="font-semibold text-deco-gold">{score.gameBonus}</span>
                </div>
              )}
              {score.slamBonus > 0 && (
                <div className="flex justify-between text-deco-cream/80">
                  <span>Slam bonus:</span>
                  <span className="font-semibold text-deco-gold">{score.slamBonus}</span>
                </div>
              )}
              {score.insultBonus > 0 && (
                <div className="flex justify-between text-deco-cream/80">
                  <span>Insult bonus:</span>
                  <span className="font-semibold text-deco-gold">{score.insultBonus}</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-deco-gold/20">
            <div className="flex justify-between text-lg font-display font-bold">
              <span className="text-deco-cream">Total:</span>
              <span className={score.totalScore >= 0 ? 'text-deco-gold' : 'text-deco-heart'}>
                {score.totalScore >= 0 ? '+' : ''}{score.totalScore}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-deco-gold/20 grid grid-cols-2 gap-4">
            <div className="bg-deco-accent/30 rounded p-3 border border-deco-gold/10">
              <p className="text-sm text-deco-cream/60">North-South</p>
              <p className="text-xl font-display font-bold text-deco-gold">
                {score.nsScore >= 0 ? '+' : ''}{score.nsScore}
              </p>
            </div>
            <div className="bg-deco-accent/30 rounded p-3 border border-deco-gold/10">
              <p className="text-sm text-deco-cream/60">East-West</p>
              <p className="text-xl font-display font-bold text-deco-gold">
                {score.ewScore >= 0 ? '+' : ''}{score.ewScore}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScoreBoard;

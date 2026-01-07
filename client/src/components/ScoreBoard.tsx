import type { GameState, Strain } from '@bridge/shared';
import { Strain as Strn } from '@bridge/shared';

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

function ScoreBoard({ gameState }: ScoreBoardProps) {
  const contract = gameState.contract;
  const score = gameState.score;
  const result = gameState.result;

  if (!contract) {
    return (
      <div className="bg-deco-midnight rounded-lg shadow-deco border border-deco-gold/20 p-6">
        <h2 className="text-xl font-display font-bold text-deco-gold">Score</h2>
        <p className="text-deco-cream/60 mt-4">No contract yet</p>
      </div>
    );
  }

  return (
    <div className="bg-deco-midnight rounded-lg shadow-deco border border-deco-gold/20 p-6">
      <h2 className="text-xl font-display font-bold text-deco-gold mb-4">Score</h2>

      {/* Contract info */}
      <div className="mb-6 bg-deco-navy rounded-lg p-4 border border-deco-gold/10">
        <h3 className="font-semibold mb-2 text-deco-cream/70 text-xs tracking-widest uppercase">Contract</h3>
        <p className="text-3xl font-display font-bold text-deco-gold">
          {contract.level}
          {strainSymbols[contract.strain]}
          {contract.doubled && 'X'}
          {contract.redoubled && 'XX'}
        </p>
        <p className="text-sm text-deco-cream/60 mt-2">
          Declarer: <span className="font-semibold text-deco-cream/80">{contract.declarer}</span>
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

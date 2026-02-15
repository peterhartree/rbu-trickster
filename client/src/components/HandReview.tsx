import type { GameState, Position, Card as CardType, Strain, SessionScore } from '@bridge/shared';
import { Position as Pos, Strain as Strn } from '@bridge/shared';
import Card from './Card';

interface HandReviewProps {
  gameState: Partial<GameState>;
  sessionScore: SessionScore | null;
  onNewHand: () => void;
  onNewSession: () => void;
}

const positionNames: Record<Position, string> = {
  [Pos.NORTH]: 'North',
  [Pos.EAST]: 'East',
  [Pos.SOUTH]: 'South',
  [Pos.WEST]: 'West',
};

const strainSymbols: Record<Strain, string> = {
  [Strn.CLUBS]: '\u2663',
  [Strn.DIAMONDS]: '\u2666',
  [Strn.HEARTS]: '\u2665',
  [Strn.SPADES]: '\u2660',
  [Strn.NO_TRUMP]: 'NT',
};

function HandReview({ gameState, sessionScore, onNewHand, onNewSession }: HandReviewProps) {
  const originalHands = gameState.originalHands;
  const contract = gameState.contract;
  const result = gameState.result;
  const score = gameState.score;

  const isSessionComplete = sessionScore?.isComplete ?? false;
  const handsRemaining = sessionScore ? sessionScore.totalHands - sessionScore.handNumber : 0;

  if (!originalHands) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-deco-cream/60">No hand data available for review</p>
      </div>
    );
  }

  const getDisplayName = (position: Position): string => {
    const name = gameState.players?.[position]?.name;
    return name ? `${name} (${positionNames[position]})` : positionNames[position];
  };

  const renderHand = (position: Position, cards: CardType[]) => {
    return (
      <div className="bg-deco-midnight/80 rounded-lg border border-deco-gold/30 p-3">
        <h4 className="text-sm font-display font-bold text-deco-gold mb-2 text-center">
          {getDisplayName(position)}
          {contract?.declarer === position && (
            <span className="ml-2 text-xs bg-deco-gold text-deco-navy px-2 py-0.5 rounded">
              Declarer
            </span>
          )}
          {gameState.cardPlay?.dummy === position && (
            <span className="ml-2 text-xs bg-deco-accent text-deco-cream px-2 py-0.5 rounded">
              Dummy
            </span>
          )}
        </h4>
        <div className="flex flex-wrap justify-center gap-0.5">
          {cards.map((card, idx) => (
            <Card
              key={`${card.suit}-${card.rank}`}
              card={card}
              size="sm"
              disabled
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full min-h-[500px] flex flex-col bg-deco-navy rounded-lg border border-deco-gold/20 overflow-hidden">
      {/* Header */}
      <div className="shrink-0 p-4 bg-deco-midnight border-b border-deco-gold/20 text-center">
        <div className="flex justify-center items-center space-x-3 mb-2">
          <div className="w-8 h-px bg-gradient-to-r from-transparent to-deco-gold/50" />
          <div className="w-3 h-3 bg-deco-gold rotate-45" />
          <div className="w-8 h-px bg-gradient-to-l from-transparent to-deco-gold/50" />
        </div>
        <h2 className="text-2xl font-display font-bold text-deco-gold">Hand Review</h2>

        {/* Contract and Result */}
        {contract && (
          <div className="mt-3 space-y-1">
            <p className="text-deco-cream">
              Contract:{' '}
              <span className="font-display font-bold text-deco-gold text-lg">
                {contract.level}
                {strainSymbols[contract.strain]}
                {contract.doubled && ' X'}
                {contract.redoubled && ' XX'}
              </span>
              <span className="text-deco-cream/60 ml-2">by {getDisplayName(contract.declarer)}</span>
            </p>
            {result && (
              <p className="text-deco-cream">
                Result:{' '}
                <span className={`font-display font-bold text-lg ${
                  result.tricksMade >= 6 + contract.level ? 'text-green-400' : 'text-deco-heart'
                }`}>
                  {result.tricksMade >= 6 + contract.level ? 'Made ' : 'Down '}
                  {Math.abs(result.tricksMade - (6 + contract.level))}
                </span>
                <span className="text-deco-cream/60 ml-2">({result.tricksMade} tricks)</span>
              </p>
            )}
            {score && (
              <p className="text-deco-cream mt-2">
                Score:{' '}
                <span className={`font-display font-bold text-lg ${
                  score.totalScore >= 0 ? 'text-deco-gold' : 'text-deco-heart'
                }`}>
                  {score.totalScore >= 0 ? '+' : ''}{score.totalScore}
                </span>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Hands display - compass layout */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="grid grid-rows-3 gap-3 max-w-2xl mx-auto">
          {/* North */}
          <div className="flex justify-center">
            {renderHand(Pos.NORTH, originalHands[Pos.NORTH])}
          </div>

          {/* West and East */}
          <div className="grid grid-cols-3 gap-3 items-center">
            <div>{renderHand(Pos.WEST, originalHands[Pos.WEST])}</div>
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 bg-deco-accent/30 rounded-full border-2 border-deco-gold/30 flex items-center justify-center">
                <span className="text-2xl text-deco-gold">♠</span>
              </div>
            </div>
            <div>{renderHand(Pos.EAST, originalHands[Pos.EAST])}</div>
          </div>

          {/* South */}
          <div className="flex justify-center">
            {renderHand(Pos.SOUTH, originalHands[Pos.SOUTH])}
          </div>
        </div>
      </div>

      {/* Footer with Session Summary and Actions */}
      <div className="shrink-0 p-4 bg-deco-midnight border-t border-deco-gold/20">
        {/* Session Summary */}
        {sessionScore && (
          <div className="mb-4">
            {/* Session complete banner */}
            {isSessionComplete && (
              <div className="mb-4 p-4 bg-deco-gold/10 rounded-lg border border-deco-gold/30 text-center">
                <p className="text-lg font-display font-bold text-deco-gold mb-1">
                  Session Complete!
                </p>
                <p className="text-deco-cream">
                  {sessionScore.nsTotal > sessionScore.ewTotal ? (
                    <span>North-South wins by <span className="font-bold text-deco-gold">{sessionScore.nsTotal - sessionScore.ewTotal}</span> points</span>
                  ) : sessionScore.ewTotal > sessionScore.nsTotal ? (
                    <span>East-West wins by <span className="font-bold text-deco-gold">{sessionScore.ewTotal - sessionScore.nsTotal}</span> points</span>
                  ) : (
                    <span className="font-bold text-deco-gold">It's a tie!</span>
                  )}
                </p>
              </div>
            )}

            {/* Session totals */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className={`p-3 rounded-lg border ${
                sessionScore.nsTotal >= sessionScore.ewTotal
                  ? 'bg-deco-gold/10 border-deco-gold/30'
                  : 'bg-deco-navy/50 border-deco-gold/10'
              }`}>
                <p className="text-xs text-deco-cream/60 uppercase tracking-wider">North-South</p>
                <p className="text-2xl font-display font-bold text-deco-gold">
                  {sessionScore.nsTotal}
                </p>
              </div>
              <div className={`p-3 rounded-lg border ${
                sessionScore.ewTotal > sessionScore.nsTotal
                  ? 'bg-deco-gold/10 border-deco-gold/30'
                  : 'bg-deco-navy/50 border-deco-gold/10'
              }`}>
                <p className="text-xs text-deco-cream/60 uppercase tracking-wider">East-West</p>
                <p className="text-2xl font-display font-bold text-deco-gold">
                  {sessionScore.ewTotal}
                </p>
              </div>
            </div>

            {/* Per-hand breakdown */}
            {sessionScore.handScores.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-deco-cream/60 uppercase tracking-wider mb-2">Hand scores</p>
                <div className="flex gap-2">
                  {sessionScore.handScores.map((handScore, i) => (
                    <div key={i} className="flex-1 p-2 bg-deco-navy/50 rounded border border-deco-gold/10 text-center text-sm">
                      <p className="text-deco-cream/60 text-xs">Hand {i + 1}</p>
                      <p className={handScore.nsScore > 0 ? 'text-deco-gold' : 'text-deco-cream/80'}>
                        NS: {handScore.nsScore > 0 ? '+' : ''}{handScore.nsScore}
                      </p>
                      <p className={handScore.ewScore > 0 ? 'text-deco-gold' : 'text-deco-cream/80'}>
                        EW: {handScore.ewScore > 0 ? '+' : ''}{handScore.ewScore}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action button */}
        {isSessionComplete ? (
          <button
            onClick={onNewSession}
            className="w-full bg-deco-gold hover:bg-deco-gold-light text-deco-navy font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-[1.02] shadow-gold"
          >
            Start New Session
          </button>
        ) : (
          <button
            onClick={onNewHand}
            className="w-full bg-deco-gold hover:bg-deco-gold-light text-deco-navy font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-[1.02] shadow-gold"
          >
            Deal Next Hand {handsRemaining > 0 && `(${handsRemaining} remaining)`}
          </button>
        )}
      </div>
    </div>
  );
}

export default HandReview;

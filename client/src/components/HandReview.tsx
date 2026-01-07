import type { GameState, Position, Card as CardType, Strain } from '@bridge/shared';
import { Position as Pos, Strain as Strn } from '@bridge/shared';
import Card from './Card';

interface HandReviewProps {
  gameState: Partial<GameState>;
  onNewHand: () => void;
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

function HandReview({ gameState, onNewHand }: HandReviewProps) {
  const originalHands = gameState.originalHands;
  const contract = gameState.contract;
  const result = gameState.result;
  const score = gameState.score;

  if (!originalHands) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-deco-cream/60">No hand data available for review</p>
      </div>
    );
  }

  const renderHand = (position: Position, cards: CardType[]) => {
    return (
      <div className="bg-deco-midnight/80 rounded-lg border border-deco-gold/30 p-3">
        <h4 className="text-sm font-display font-bold text-deco-gold mb-2 text-center">
          {positionNames[position]}
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
    <div className="h-full flex flex-col bg-deco-navy rounded-lg border border-deco-gold/20 overflow-hidden">
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
              <span className="text-deco-cream/60 ml-2">by {positionNames[contract.declarer]}</span>
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

      {/* Footer with New Hand button */}
      <div className="shrink-0 p-4 bg-deco-midnight border-t border-deco-gold/20">
        <button
          onClick={onNewHand}
          className="w-full bg-deco-gold hover:bg-deco-gold-light text-deco-navy font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-[1.02] shadow-gold"
        >
          Deal New Hand
        </button>
      </div>
    </div>
  );
}

export default HandReview;

import type { Position, GameState, BidAction, BidLevel, Strain } from '@bridge/shared';
import { BidLevel as BidLvl, Strain as Strn } from '@bridge/shared';

interface BiddingPanelProps {
  gameState: Partial<GameState>;
  myPosition: Position | null;
  onPlaceBid: (bid: BidAction) => void;
}

const suitSymbols: Record<Strain, string> = {
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

const strainOrder: Strain[] = [Strn.CLUBS, Strn.DIAMONDS, Strn.HEARTS, Strn.SPADES, Strn.NO_TRUMP];
const levels: BidLevel[] = [1, 2, 3, 4, 5, 6, 7] as BidLevel[];

function BiddingPanel({ gameState, myPosition, onPlaceBid }: BiddingPanelProps) {
  const isMyTurn = gameState.currentBidder === myPosition;

  const handleBid = (level: BidLevel, strain: Strain) => {
    onPlaceBid({ type: 'BID', level, strain });
  };

  const handlePass = () => onPlaceBid({ type: 'PASS' });
  const handleDouble = () => onPlaceBid({ type: 'DOUBLE' });
  const handleRedouble = () => onPlaceBid({ type: 'REDOUBLE' });

  return (
    <div className="h-full flex flex-col bg-deco-midnight rounded-lg shadow-deco border border-deco-gold/20 overflow-hidden">
      {/* Bidding sequence header */}
      <div className="shrink-0 p-3 border-b border-deco-gold/20">
        <h3 className="text-xs font-semibold text-deco-gold/70 tracking-widest uppercase mb-2">Bidding</h3>
        <div className="flex space-x-2 overflow-x-auto bidding-scroll pb-1">
          {gameState.bidding?.calls && gameState.bidding.calls.length > 0 ? (
            gameState.bidding.calls.map((call, index) => (
              <div
                key={index}
                className="shrink-0 bg-deco-navy rounded px-2 py-1 text-sm flex items-center space-x-1 border border-deco-gold/10"
              >
                <span className="font-mono text-xs text-deco-cream/50">{call.position}</span>
                <span className={`font-display font-semibold ${call.action.type === 'BID' ? suitColors[call.action.strain] : 'text-deco-cream/70'}`}>
                  {call.action.type === 'BID'
                    ? `${call.action.level}${suitSymbols[call.action.strain]}`
                    : call.action.type === 'PASS'
                    ? 'Pass'
                    : call.action.type === 'DOUBLE'
                    ? 'X'
                    : 'XX'}
                </span>
              </div>
            ))
          ) : (
            <span className="text-xs text-deco-cream/40 italic">No bids yet</span>
          )}
        </div>
      </div>

      {/* Bid grid - 7 columns x 5 rows */}
      <div className="flex-1 p-3 overflow-y-auto">
        <div className="grid grid-cols-7 gap-1">
          {/* Header row - levels */}
          {levels.map((level) => (
            <div key={`header-${level}`} className="text-center text-xs font-display font-semibold text-deco-gold/60 pb-1">
              {level}
            </div>
          ))}

          {/* Strain rows */}
          {strainOrder.map((strain) => (
            levels.map((level) => (
              <button
                key={`${level}-${strain}`}
                onClick={() => handleBid(level, strain)}
                disabled={!isMyTurn}
                className={`
                  py-1.5 rounded text-sm font-display font-bold transition-all border
                  ${suitColors[strain]}
                  ${isMyTurn
                    ? 'bg-deco-navy border-deco-gold/20 hover:bg-deco-accent hover:border-deco-gold/40 hover:scale-105'
                    : 'bg-deco-navy/50 border-deco-gold/10 opacity-50 cursor-not-allowed'
                  }
                `}
              >
                {suitSymbols[strain]}
              </button>
            ))
          ))}
        </div>
      </div>

      {/* Special bids - Art Deco styled */}
      <div className="shrink-0 p-3 border-t border-deco-gold/20 grid grid-cols-3 gap-2">
        <button
          onClick={handlePass}
          disabled={!isMyTurn}
          className={`
            py-2 text-sm font-semibold rounded transition-all border
            ${isMyTurn
              ? 'bg-deco-navy text-deco-cream border-deco-gold/30 hover:bg-deco-accent hover:border-deco-gold/50'
              : 'bg-deco-navy/50 text-deco-cream/50 border-deco-gold/10 cursor-not-allowed'
            }
          `}
        >
          Pass
        </button>
        <button
          onClick={handleDouble}
          disabled={!isMyTurn}
          className={`
            py-2 text-sm font-semibold rounded transition-all border
            ${isMyTurn
              ? 'bg-deco-heart text-deco-cream border-deco-heart hover:brightness-110'
              : 'bg-deco-heart/30 text-deco-cream/50 border-deco-heart/30 cursor-not-allowed'
            }
          `}
        >
          X
        </button>
        <button
          onClick={handleRedouble}
          disabled={!isMyTurn}
          className={`
            py-2 text-sm font-semibold rounded transition-all border
            ${isMyTurn
              ? 'bg-deco-gold text-deco-navy border-deco-gold hover:brightness-110'
              : 'bg-deco-gold/30 text-deco-navy/50 border-deco-gold/30 cursor-not-allowed'
            }
          `}
        >
          XX
        </button>
      </div>

      {/* Final contract display */}
      {gameState.contract && (
        <div className="shrink-0 p-3 bg-deco-navy border-t border-deco-gold/30">
          <p className="text-xs text-deco-gold/60 tracking-widest uppercase">Contract</p>
          <p className="text-lg font-display font-bold text-deco-gold">
            {gameState.contract.level}
            {suitSymbols[gameState.contract.strain]}
            {gameState.contract.doubled && ' X'}
            {gameState.contract.redoubled && ' XX'}
            <span className="text-sm font-sans font-normal text-deco-cream/60 ml-2">
              by {gameState.contract.declarer}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}

export default BiddingPanel;

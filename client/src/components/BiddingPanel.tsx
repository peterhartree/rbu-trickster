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

const positionNames: Record<string, string> = {
  N: 'North', E: 'East', S: 'South', W: 'West',
};

function BiddingPanel({ gameState, myPosition, onPlaceBid }: BiddingPanelProps) {
  const isMyTurn = gameState.currentBidder === myPosition;
  const validBids = gameState.validBids || [];

  const getShortName = (position: string): string => {
    const name = gameState.players?.[position as keyof typeof gameState.players]?.name;
    return name ? `${name.split(' ')[0]}` : position;
  };

  const isBidValid = (level: BidLevel, strain: Strain): boolean => {
    return validBids.some(
      (b) => b.type === 'BID' && b.level === level && b.strain === strain
    );
  };

  const isSpecialValid = (type: 'PASS' | 'DOUBLE' | 'REDOUBLE'): boolean => {
    return validBids.some((b) => b.type === type);
  };

  const handleBid = (level: BidLevel, strain: Strain) => {
    onPlaceBid({ type: 'BID', level, strain });
  };

  const handlePass = () => onPlaceBid({ type: 'PASS' });
  const handleDouble = () => onPlaceBid({ type: 'DOUBLE' });
  const handleRedouble = () => onPlaceBid({ type: 'REDOUBLE' });

  return (
    <div className="h-full flex flex-col bg-deco-midnight rounded-lg shadow-deco border border-deco-gold/20 overflow-hidden">
      {/* Bidding sequence header */}
      <div className="shrink-0 p-2 border-b border-deco-gold/20">
        <h3 className="text-[10px] font-semibold text-deco-gold/70 tracking-widest uppercase mb-1">Bidding</h3>
        <div className="flex flex-wrap gap-1">
          {gameState.bidding?.calls && gameState.bidding.calls.length > 0 ? (
            gameState.bidding.calls.map((call, index) => (
              <div
                key={index}
                className="shrink-0 bg-deco-cream/90 rounded px-2 py-1 text-sm flex items-center space-x-1 border border-deco-gold/30"
              >
                <span className="font-mono text-xs text-deco-navy/60">{getShortName(call.position)}</span>
                <span className={`font-display font-semibold ${call.action.type === 'BID' ? suitColors[call.action.strain] : 'text-deco-navy/70'}`}>
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

      {/* Bid grid - 5 columns (C, D, H, S, NT) × 7 rows (levels 1–7) */}
      <div className="flex-1 p-2 overflow-y-auto">
        <div className="grid grid-cols-5 gap-0.5">
          {/* Header row - strains */}
          {strainOrder.map((strain) => (
            <div key={`header-${strain}`} className={`text-center text-[10px] font-display font-semibold pb-0.5 ${suitColors[strain]}`}>
              {suitSymbols[strain]}
            </div>
          ))}

          {/* Level rows */}
          {levels.map((level) => (
            strainOrder.map((strain) => {
              const valid = isMyTurn && isBidValid(level, strain);
              return (
                <button
                  key={`${level}-${strain}`}
                  onClick={valid ? () => handleBid(level, strain) : undefined}
                  disabled={!valid}
                  className={`
                    py-1 rounded text-xs font-display font-bold transition-all border
                    ${suitColors[strain]}
                    ${valid
                      ? 'bg-deco-cream border-deco-gold/30 hover:bg-deco-gold-light hover:border-deco-gold hover:scale-105 shadow-sm cursor-pointer'
                      : 'bg-deco-cream/30 border-deco-gold/5 opacity-30'
                    }
                  `}
                >
                  {level}{suitSymbols[strain]}
                </button>
              );
            })
          ))}
        </div>
      </div>

      {/* Special bids */}
      <div className="shrink-0 p-2 border-t border-deco-gold/20 grid grid-cols-3 gap-1">
        <button
          onClick={isMyTurn && isSpecialValid('PASS') ? handlePass : undefined}
          disabled={!isMyTurn || !isSpecialValid('PASS')}
          className={`
            py-2 text-sm font-semibold rounded transition-all border
            ${isMyTurn && isSpecialValid('PASS')
              ? 'bg-deco-navy text-deco-cream border-deco-gold/30 hover:bg-deco-accent hover:border-deco-gold/50 cursor-pointer'
              : 'bg-deco-navy/50 text-deco-cream/50 border-deco-gold/10 opacity-30'
            }
          `}
        >
          Pass
        </button>
        <button
          onClick={isMyTurn && isSpecialValid('DOUBLE') ? handleDouble : undefined}
          disabled={!isMyTurn || !isSpecialValid('DOUBLE')}
          className={`
            py-2 text-sm font-semibold rounded transition-all border
            ${isMyTurn && isSpecialValid('DOUBLE')
              ? 'bg-deco-heart text-deco-cream border-deco-heart hover:brightness-110 cursor-pointer'
              : 'bg-deco-heart/30 text-deco-cream/50 border-deco-heart/30 opacity-30'
            }
          `}
        >
          X
        </button>
        <button
          onClick={isMyTurn && isSpecialValid('REDOUBLE') ? handleRedouble : undefined}
          disabled={!isMyTurn || !isSpecialValid('REDOUBLE')}
          className={`
            py-2 text-sm font-semibold rounded transition-all border
            ${isMyTurn && isSpecialValid('REDOUBLE')
              ? 'bg-deco-gold text-deco-navy border-deco-gold hover:brightness-110 cursor-pointer'
              : 'bg-deco-gold/30 text-deco-navy/50 border-deco-gold/30 opacity-30'
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
              by {(() => {
                const name = gameState.players?.[gameState.contract!.declarer]?.name;
                const posName = positionNames[gameState.contract!.declarer];
                return name ? `${name} (${posName})` : posName;
              })()}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}

export default BiddingPanel;

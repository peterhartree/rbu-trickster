import type { Position, GameState, BidAction, BidLevel, Strain } from '@bridge/shared';
import { BidLevel as BidLvl, Strain as Strn } from '@bridge/shared';

interface BiddingPanelProps {
  gameState: Partial<GameState>;
  myPosition: Position | null;
  onPlaceBid: (bid: BidAction) => void;
}

const suitSymbols: Record<Strain, string> = {
  [Strn.CLUBS]: '♣',
  [Strn.DIAMONDS]: '♦',
  [Strn.HEARTS]: '♥',
  [Strn.SPADES]: '♠',
  [Strn.NO_TRUMP]: 'NT',
};

const suitColors: Record<Strain, string> = {
  [Strn.CLUBS]: 'text-card-club',
  [Strn.DIAMONDS]: 'text-card-diamond',
  [Strn.HEARTS]: 'text-card-heart',
  [Strn.SPADES]: 'text-card-spade',
  [Strn.NO_TRUMP]: 'text-blue-700',
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
    <div className="h-full flex flex-col bg-white/95 backdrop-blur rounded-lg shadow-lg overflow-hidden">
      {/* Bidding sequence - horizontal scroll */}
      <div className="shrink-0 p-3 border-b border-gray-200">
        <h3 className="text-xs font-semibold text-gray-500 mb-2">Bidding</h3>
        <div className="flex space-x-2 overflow-x-auto bidding-scroll pb-1">
          {gameState.bidding?.calls && gameState.bidding.calls.length > 0 ? (
            gameState.bidding.calls.map((call, index) => (
              <div
                key={index}
                className="shrink-0 bg-gray-100 rounded px-2 py-1 text-sm flex items-center space-x-1"
              >
                <span className="font-mono text-xs text-gray-500">{call.position}</span>
                <span className={`font-semibold ${call.action.type === 'BID' ? suitColors[call.action.strain] : 'text-gray-700'}`}>
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
            <span className="text-xs text-gray-400 italic">No bids yet</span>
          )}
        </div>
      </div>

      {/* Bid grid - 7 columns x 5 rows */}
      <div className="flex-1 p-3 overflow-y-auto">
        <div className="grid grid-cols-7 gap-1">
          {/* Header row - levels */}
          {levels.map((level) => (
            <div key={`header-${level}`} className="text-center text-xs font-semibold text-gray-500 pb-1">
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
                  py-1.5 rounded text-sm font-bold transition-all
                  ${suitColors[strain]}
                  ${isMyTurn
                    ? 'bg-gray-100 hover:bg-gray-200 hover:scale-105'
                    : 'bg-gray-50 opacity-50 cursor-not-allowed'
                  }
                `}
              >
                {suitSymbols[strain]}
              </button>
            ))
          ))}
        </div>
      </div>

      {/* Special bids - compact row */}
      <div className="shrink-0 p-3 border-t border-gray-200 grid grid-cols-3 gap-2">
        <button
          onClick={handlePass}
          disabled={!isMyTurn}
          className="py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-semibold rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Pass
        </button>
        <button
          onClick={handleDouble}
          disabled={!isMyTurn}
          className="py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          X
        </button>
        <button
          onClick={handleRedouble}
          disabled={!isMyTurn}
          className="py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          XX
        </button>
      </div>

      {/* Final contract display */}
      {gameState.contract && (
        <div className="shrink-0 p-3 bg-table-felt text-white">
          <p className="text-xs text-white/70">Contract</p>
          <p className="text-lg font-bold">
            {gameState.contract.level}
            {suitSymbols[gameState.contract.strain]}
            {gameState.contract.doubled && ' X'}
            {gameState.contract.redoubled && ' XX'}
            <span className="text-sm font-normal ml-2">
              by {gameState.contract.declarer}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}

export default BiddingPanel;

import { useState } from 'react';
import type { Position, GameState, BidAction, BidLevel, Strain } from '@bridge/shared';
import { BidLevel as BidLvl, Strain as Strn } from '@bridge/shared';

interface BiddingPanelProps {
  gameState: Partial<GameState>;
  myPosition: Position | null;
  onPlaceBid: (bid: BidAction) => void;
}

function BiddingPanel({ gameState, myPosition, onPlaceBid }: BiddingPanelProps) {
  const [selectedLevel, setSelectedLevel] = useState<BidLevel | null>(null);

  const isMyTurn = gameState.currentBidder === myPosition;

  const handleBid = (strain: Strain) => {
    if (selectedLevel) {
      onPlaceBid({
        type: 'BID',
        level: selectedLevel,
        strain,
      });
      setSelectedLevel(null);
    }
  };

  const handlePass = () => {
    onPlaceBid({ type: 'PASS' });
  };

  const handleDouble = () => {
    onPlaceBid({ type: 'DOUBLE' });
  };

  const handleRedouble = () => {
    onPlaceBid({ type: 'REDOUBLE' });
  };

  const suitSymbols = {
    [Strn.SPADES]: '♠',
    [Strn.HEARTS]: '♥',
    [Strn.DIAMONDS]: '♦',
    [Strn.CLUBS]: '♣',
    [Strn.NO_TRUMP]: 'NT',
  };

  const suitColors = {
    [Strn.SPADES]: 'text-gray-900',
    [Strn.HEARTS]: 'text-red-600',
    [Strn.DIAMONDS]: 'text-orange-600',
    [Strn.CLUBS]: 'text-green-700',
    [Strn.NO_TRUMP]: 'text-blue-700',
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-green-800 mb-4">Bidding</h2>

      {/* Bidding sequence */}
      <div className="mb-6 bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
        <h3 className="font-semibold mb-2 text-sm text-gray-700">Bidding sequence:</h3>
        {gameState.bidding && gameState.bidding.calls && gameState.bidding.calls.length > 0 ? (
          <div className="space-y-1">
            {gameState.bidding.calls.map((call, index) => (
              <div key={index} className="text-sm flex items-center space-x-2">
                <span className="font-mono w-6">{call.position}:</span>
                <span className="font-semibold">
                  {call.action.type === 'BID'
                    ? `${call.action.level}${suitSymbols[call.action.strain]}`
                    : call.action.type}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">No bids yet</p>
        )}
      </div>

      {/* Current turn indicator */}
      <div className="mb-4">
        {isMyTurn ? (
          <p className="text-green-700 font-semibold">Your turn to bid</p>
        ) : (
          <p className="text-gray-600">
            Waiting for <span className="font-semibold">{gameState.currentBidder}</span>
          </p>
        )}
      </div>

      {/* Bidding box */}
      <div className="space-y-4">
        {/* Level selection */}
        <div>
          <p className="text-sm font-semibold mb-2 text-gray-700">Select level:</p>
          <div className="grid grid-cols-7 gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map((level) => (
              <button
                key={level}
                onClick={() => setSelectedLevel(level as BidLevel)}
                disabled={!isMyTurn}
                className={`py-2 px-3 rounded font-bold transition-colors ${
                  selectedLevel === level
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Strain selection */}
        <div>
          <p className="text-sm font-semibold mb-2 text-gray-700">
            Select strain {selectedLevel ? `(${selectedLevel})` : ''}:
          </p>
          <div className="grid grid-cols-5 gap-2">
            {[Strn.CLUBS, Strn.DIAMONDS, Strn.HEARTS, Strn.SPADES, Strn.NO_TRUMP].map((strain) => (
              <button
                key={strain}
                onClick={() => handleBid(strain)}
                disabled={!isMyTurn || !selectedLevel}
                className={`py-3 px-2 rounded font-bold text-2xl transition-colors ${suitColors[strain]} bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {suitSymbols[strain]}
              </button>
            ))}
          </div>
        </div>

        {/* Special bids */}
        <div className="grid grid-cols-3 gap-2 pt-4 border-t">
          <button
            onClick={handlePass}
            disabled={!isMyTurn}
            className="py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Pass
          </button>
          <button
            onClick={handleDouble}
            disabled={!isMyTurn}
            className="py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Double
          </button>
          <button
            onClick={handleRedouble}
            disabled={!isMyTurn}
            className="py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Redbl
          </button>
        </div>
      </div>

      {/* Final contract display */}
      {gameState.contract && (
        <div className="mt-6 pt-6 border-t">
          <h3 className="font-semibold mb-2 text-gray-700">Contract:</h3>
          <p className="text-2xl font-bold text-green-800">
            {gameState.contract.level}
            {suitSymbols[gameState.contract.strain]}
            {gameState.contract.doubled && 'X'}
            {gameState.contract.redoubled && 'XX'}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Declarer: <span className="font-semibold">{gameState.contract.declarer}</span>
          </p>
        </div>
      )}
    </div>
  );
}

export default BiddingPanel;

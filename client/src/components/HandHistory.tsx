import { useState, useEffect } from 'react';
import type { HandRecord, Strain, Suit } from '@bridge/shared';
import { Strain as Strn, Suit as SuitEnum } from '@bridge/shared';

interface HandHistoryProps {
  roomId: string;
  isOpen: boolean;
  onClose: () => void;
}

const strainSymbols: Record<Strain, string> = {
  [Strn.CLUBS]: '♣',
  [Strn.DIAMONDS]: '♦',
  [Strn.HEARTS]: '♥',
  [Strn.SPADES]: '♠',
  [Strn.NO_TRUMP]: 'NT',
};

const suitSymbols: Record<Suit, string> = {
  [SuitEnum.CLUBS]: '♣',
  [SuitEnum.DIAMONDS]: '♦',
  [SuitEnum.HEARTS]: '♥',
  [SuitEnum.SPADES]: '♠',
};

function HandHistory({ roomId, isOpen, onClose }: HandHistoryProps) {
  const [hands, setHands] = useState<HandRecord[]>([]);
  const [selectedHand, setSelectedHand] = useState<HandRecord | null>(null);
  const [replayStep, setReplayStep] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen, roomId]);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/rooms/${roomId}/history`);
      const data = await response.json();
      setHands(data.hands || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch hand history:', error);
      setLoading(false);
    }
  };

  const handleSelectHand = (hand: HandRecord) => {
    setSelectedHand(hand);
    setReplayStep(0);
  };

  const handleDownloadPBN = async (handId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/rooms/${roomId}/history/${handId}/pbn`);
      const pbn = await response.text();

      // Create download link
      const blob = new Blob([pbn], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `hand-${handId}.pbn`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download PBN:', error);
    }
  };

  const getTotalSteps = () => {
    if (!selectedHand) return 0;
    const biddingSteps = selectedHand.biddingSequence.calls.length;
    const playSteps = selectedHand.cardPlay.tricks.reduce((sum, trick) => sum + trick.cards.length, 0);
    return biddingSteps + playSteps;
  };

  const getCurrentEvent = () => {
    if (!selectedHand) return null;

    const totalBids = selectedHand.biddingSequence.calls.length;

    if (replayStep < totalBids) {
      // In bidding phase
      const bid = selectedHand.biddingSequence.calls[replayStep];
      return {
        phase: 'bidding' as const,
        bid,
      };
    } else {
      // In play phase
      const playStep = replayStep - totalBids;
      let cardCount = 0;

      for (const trick of selectedHand.cardPlay.tricks) {
        if (playStep < cardCount + trick.cards.length) {
          const cardIndex = playStep - cardCount;
          return {
            phase: 'playing' as const,
            trick: trick.number,
            card: trick.cards[cardIndex],
          };
        }
        cardCount += trick.cards.length;
      }
    }

    return null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b px-6 py-4 flex items-centre justify-between">
          <h2 className="text-2xl font-bold text-green-800">Hand History</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto flex">
          {/* Left: Hand list */}
          <div className="w-1/3 border-r p-4">
            <h3 className="font-bold text-lg mb-4">Completed Hands ({hands.length})</h3>

            {loading && <p className="text-gray-600">Loading...</p>}

            <div className="space-y-2">
              {hands.map((hand) => {
                const contract = hand.result.contract;
                const tricksNeeded = 6 + contract.level;
                const made = hand.result.tricksMade >= tricksNeeded;
                const diff = hand.result.tricksMade - tricksNeeded;

                return (
                  <div
                    key={hand.id}
                    onClick={() => handleSelectHand(hand)}
                    className={`border rounded p-3 cursor-pointer transition-colors ${
                      selectedHand?.id === hand.id
                        ? 'bg-green-50 border-green-500'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-lg">
                          {contract.level}
                          {strainSymbols[contract.strain]}
                          {contract.doubled && 'X'}
                          {contract.redoubled && 'XX'}
                        </p>
                        <p className="text-sm text-gray-600">by {contract.declarer}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${made ? 'text-green-700' : 'text-red-700'}`}>
                          {made ? `Made ${diff > 0 ? `+${diff}` : ''}` : `Down ${-diff}`}
                        </p>
                        <p className="text-sm text-gray-600">{hand.score.nsScore} NS</p>
                      </div>
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-gray-500">
                      <span>{new Date(hand.timestamp).toLocaleString()}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadPBN(hand.id);
                        }}
                        className="text-blue-600 hover:underline"
                      >
                        Download PBN
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Replay area */}
          <div className="flex-1 p-6">
            {!selectedHand && (
              <div className="h-full flex items-centre justify-centre text-gray-500">
                Select a hand to replay
              </div>
            )}

            {selectedHand && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-green-800 mb-2">
                    {selectedHand.result.contract.level}
                    {strainSymbols[selectedHand.result.contract.strain]}
                    {selectedHand.result.contract.doubled && 'X'}
                    {selectedHand.result.contract.redoubled && 'XX'} by{' '}
                    {selectedHand.result.contract.declarer}
                  </h3>
                  <p className="text-gray-600">
                    {new Date(selectedHand.timestamp).toLocaleString()}
                  </p>
                </div>

                {/* Replay controls */}
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="flex items-centre justify-between mb-3">
                    <span className="font-semibold">
                      Step {replayStep + 1} of {getTotalSteps()}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setReplayStep(0)}
                        disabled={replayStep === 0}
                        className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
                      >
                        ⏮ Start
                      </button>
                      <button
                        onClick={() => setReplayStep(Math.max(0, replayStep - 1))}
                        disabled={replayStep === 0}
                        className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
                      >
                        ← Previous
                      </button>
                      <button
                        onClick={() => setReplayStep(Math.min(getTotalSteps() - 1, replayStep + 1))}
                        disabled={replayStep >= getTotalSteps() - 1}
                        className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
                      >
                        Next →
                      </button>
                      <button
                        onClick={() => setReplayStep(getTotalSteps() - 1)}
                        disabled={replayStep >= getTotalSteps() - 1}
                        className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
                      >
                        End ⏭
                      </button>
                    </div>
                  </div>

                  {/* Current event display */}
                  <div className="bg-white rounded p-3">
                    {(() => {
                      const event = getCurrentEvent();
                      if (!event) return <p>End of hand</p>;

                      if (event.phase === 'bidding') {
                        return (
                          <div>
                            <span className="font-semibold">{event.bid.position}:</span>{' '}
                            {event.bid.action.type === 'BID' ? (
                              <span className="text-lg font-bold text-green-700">
                                {event.bid.action.level}
                                {event.bid.action.strain}
                              </span>
                            ) : (
                              <span className="text-lg font-bold text-gray-700">
                                {event.bid.action.type}
                              </span>
                            )}
                          </div>
                        );
                      } else {
                        return (
                          <div>
                            <span className="font-semibold">Trick {event.trick}:</span>{' '}
                            <span className="font-semibold">{event.card.position}</span> plays{' '}
                            <span className="text-lg font-bold">
                              {event.card.card.rank}
                              {suitSymbols[event.card.card.suit]}
                            </span>
                          </div>
                        );
                      }
                    })()}
                  </div>
                </div>

                {/* Final result */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Result:</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Tricks made:</p>
                      <p className="text-xl font-bold">{selectedHand.result.tricksMade}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Score (NS):</p>
                      <p className="text-xl font-bold text-green-700">
                        {selectedHand.score.nsScore >= 0 ? '+' : ''}
                        {selectedHand.score.nsScore}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bidding sequence */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Bidding Sequence:</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {selectedHand.biddingSequence.calls.map((call, index) => (
                      <div
                        key={index}
                        className={`text-sm p-2 rounded ${
                          replayStep >= index && replayStep < index + selectedHand.biddingSequence.calls.length
                            ? 'bg-yellow-100'
                            : 'bg-gray-50'
                        }`}
                      >
                        <span className="font-mono text-xs">{call.position}:</span>{' '}
                        {call.action.type === 'BID' ? (
                          <span className="font-semibold">
                            {call.action.level}
                            {call.action.strain}
                          </span>
                        ) : (
                          <span>{call.action.type}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HandHistory;

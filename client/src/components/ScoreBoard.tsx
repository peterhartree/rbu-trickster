import type { GameState, Suit } from '@bridge/shared';
import { Suit as SuitEnum } from '@bridge/shared';

interface ScoreBoardProps {
  gameState: Partial<GameState>;
}

function ScoreBoard({ gameState }: ScoreBoardProps) {
  const contract = gameState.contract;
  const score = gameState.score;
  const result = gameState.result;

  const suitSymbols: Record<Suit, string> = {
    [SuitEnum.SPADES]: '♠',
    [SuitEnum.HEARTS]: '♥',
    [SuitEnum.DIAMONDS]: '♦',
    [SuitEnum.CLUBS]: '♣',
  };

  if (!contract) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-green-800">Score</h2>
        <p className="text-gray-600 mt-4">No contract yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-green-800 mb-4">Score</h2>

      {/* Contract info */}
      <div className="mb-6 bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold mb-2 text-gray-700">Contract:</h3>
        <p className="text-3xl font-bold text-green-800">
          {contract.level}
          {suitSymbols[contract.strain]}
          {contract.doubled && 'X'}
          {contract.redoubled && 'XX'}
        </p>
        <p className="text-sm text-gray-600 mt-2">
          Declarer: <span className="font-semibold">{contract.declarer}</span>
        </p>
      </div>

      {/* Result */}
      {result && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2 text-gray-700">Result:</h3>
          <p className="text-2xl font-bold">
            {result.tricksMade} tricks
          </p>
          <p className="text-sm text-gray-600">
            ({result.tricksMade >= 6 + contract.level ? 'Made' : 'Down'}{' '}
            {Math.abs(result.tricksMade - (6 + contract.level))})
          </p>
        </div>
      )}

      {/* Score breakdown */}
      {score && (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-3 text-gray-700">Score breakdown:</h3>
            <div className="space-y-2 text-sm">
              {score.contractPoints > 0 && (
                <div className="flex justify-between">
                  <span>Contract points:</span>
                  <span className="font-semibold">{score.contractPoints}</span>
                </div>
              )}
              {score.overtricks > 0 && (
                <div className="flex justify-between">
                  <span>Overtricks:</span>
                  <span className="font-semibold">{score.overtricks}</span>
                </div>
              )}
              {score.undertricks > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Undertricks:</span>
                  <span className="font-semibold">-{score.undertricks}</span>
                </div>
              )}
              {score.gameBonus > 0 && (
                <div className="flex justify-between">
                  <span>{score.isGame ? 'Game' : 'Part-game'} bonus:</span>
                  <span className="font-semibold">{score.gameBonus}</span>
                </div>
              )}
              {score.slamBonus > 0 && (
                <div className="flex justify-between">
                  <span>Slam bonus:</span>
                  <span className="font-semibold">{score.slamBonus}</span>
                </div>
              )}
              {score.insultBonus > 0 && (
                <div className="flex justify-between">
                  <span>Insult bonus:</span>
                  <span className="font-semibold">{score.insultBonus}</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span className={score.totalScore >= 0 ? 'text-green-700' : 'text-red-700'}>
                {score.totalScore >= 0 ? '+' : ''}{score.totalScore}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded p-3">
              <p className="text-sm text-blue-900">North-South</p>
              <p className="text-xl font-bold text-blue-700">
                {score.nsScore >= 0 ? '+' : ''}{score.nsScore}
              </p>
            </div>
            <div className="bg-orange-50 rounded p-3">
              <p className="text-sm text-orange-900">East-West</p>
              <p className="text-xl font-bold text-orange-700">
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

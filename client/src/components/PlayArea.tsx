import { useState } from 'react';
import type { Position, GameState, Card as CardType, Suit, Trick } from '@bridge/shared';
import { Position as Pos, Suit as SuitEnum, Strain as StrainEnum } from '@bridge/shared';
import Card from './Card';

// Sort cards by suit (S, H, D, C) then by rank (A-2)
function sortCards(cards: CardType[]): CardType[] {
  const suitOrder: Suit[] = [SuitEnum.SPADES, SuitEnum.HEARTS, SuitEnum.DIAMONDS, SuitEnum.CLUBS];
  const rankOrder = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
  return [...cards].sort((a, b) => {
    const suitDiff = suitOrder.indexOf(a.suit) - suitOrder.indexOf(b.suit);
    if (suitDiff !== 0) return suitDiff;
    return rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank);
  });
}

// Group cards by suit in display order (S, H, D, C)
function groupBySuit(cards: CardType[]): { suit: Suit; cards: CardType[] }[] {
  const suitOrder: Suit[] = [SuitEnum.SPADES, SuitEnum.HEARTS, SuitEnum.DIAMONDS, SuitEnum.CLUBS];
  const groups: { suit: Suit; cards: CardType[] }[] = [];
  for (const suit of suitOrder) {
    const suitCards = cards.filter((c) => c.suit === suit);
    if (suitCards.length > 0) {
      const rankOrder = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
      suitCards.sort((a, b) => rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank));
      groups.push({ suit, cards: suitCards });
    }
  }
  return groups;
}

// Map contract strain to card suit for trump highlighting
const strainToSuit: Partial<Record<string, Suit>> = {
  [StrainEnum.CLUBS]: SuitEnum.CLUBS,
  [StrainEnum.DIAMONDS]: SuitEnum.DIAMONDS,
  [StrainEnum.HEARTS]: SuitEnum.HEARTS,
  [StrainEnum.SPADES]: SuitEnum.SPADES,
};

interface PlayAreaProps {
  gameState: Partial<GameState>;
  myPosition: Position | null;
  onPlayCard?: (card: CardType) => void;
  lastCompletedTrick?: Trick | null;
  reviewableTrick?: Trick | null;
}

const positionNames: Record<Position, string> = {
  N: 'North',
  E: 'East',
  S: 'South',
  W: 'West',
};

// Helper: show "Name (East)" or just "East" if no name
function getDisplayName(gameState: Partial<GameState>, position: Position | undefined | null): string {
  if (!position) return '...';
  const name = gameState.players?.[position]?.name;
  return name ? `${name} (${positionNames[position]})` : positionNames[position];
}

function PlayArea({ gameState, myPosition, onPlayCard, lastCompletedTrick, reviewableTrick }: PlayAreaProps) {
  const [showingLastTrick, setShowingLastTrick] = useState(false);

  // Show last completed trick cards if we're in the delay period
  const displayTrick = lastCompletedTrick || (showingLastTrick && reviewableTrick) || gameState.cardPlay?.currentTrick;
  const currentTrick = displayTrick;
  const dummyPosition = gameState.cardPlay?.dummy;
  const declarerPosition = gameState.contract?.declarer;
  const trumpSuit = gameState.contract?.strain ? strainToSuit[gameState.contract.strain] : undefined;

  // Declarer can play dummy's cards when it's dummy's turn
  const isDummysTurn = gameState.currentPlayer === dummyPosition;
  const iAmDeclarer = myPosition === declarerPosition;
  const canPlayDummyCards = isDummysTurn && iAmDeclarer && onPlayCard;

  // Get dummy's hand if visible (not our own hand - that's shown in PlayerHand)
  const dummyHand: CardType[] | null =
    dummyPosition &&
    dummyPosition !== myPosition &&
    gameState.hands &&
    gameState.hands[dummyPosition] &&
    gameState.hands[dummyPosition].length > 0
      ? sortCards(gameState.hands[dummyPosition])
      : null;

  const dummySuitGroups = dummyHand ? groupBySuit(dummyHand) : [];

  // Map logical positions to visual positions based on myPosition
  const getVisualPosition = (position: Position): 'top' | 'right' | 'bottom' | 'left' => {
    if (!myPosition) {
      const defaultMap: Record<Position, 'top' | 'right' | 'bottom' | 'left'> = {
        N: 'top', E: 'right', S: 'bottom', W: 'left',
      };
      return defaultMap[position];
    }

    const order: Position[] = [Pos.NORTH, Pos.EAST, Pos.SOUTH, Pos.WEST];
    const myIndex = order.indexOf(myPosition);
    const posIndex = order.indexOf(position);
    const relativeIndex = (posIndex - myIndex + 4) % 4;
    const visualPositions: ('bottom' | 'left' | 'top' | 'right')[] = ['bottom', 'left', 'top', 'right'];
    return visualPositions[relativeIndex];
  };

  const visualPositionStyles: Record<string, string> = {
    top: 'top-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center',
    right: 'right-4 top-1/2 transform -translate-y-1/2 flex flex-row-reverse items-center',
    bottom: 'bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col-reverse items-center',
    left: 'left-4 top-1/2 transform -translate-y-1/2 flex flex-row items-center',
  };

  const getPositionStyle = (position: Position) => {
    return visualPositionStyles[getVisualPosition(position)];
  };

  // Find card for each position in current trick
  const getCardForPosition = (position: Position) => {
    return currentTrick?.cards.find((c) => c.position === position);
  };

  const totalTricks = (gameState.cardPlay?.tricks?.length || 0) +
    (gameState.cardPlay?.currentTrick?.cards?.length ? 1 : 0);

  return (
    <div className="h-full flex flex-col bg-deco-midnight rounded-lg shadow-deco border border-deco-gold/20 overflow-hidden">
      {/* Art Deco table surface */}
      <div className="flex-1 min-h-[280px] relative bg-deco-navy rounded-lg m-2 deco-table-pattern">
        {/* Decorative gold compass rose at centre */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          {/* Outer ring */}
          <div className="w-28 h-28 rounded-full border border-deco-gold/20" />
          {/* Inner ring */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border border-deco-gold/30" />
          {/* Diamond centre */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-deco-gold/20 rotate-45" />
          {/* Compass lines */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-px bg-deco-gold/15" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-px h-24 bg-deco-gold/15" />
        </div>

        {/* Centre info */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-10">
          {currentTrick && currentTrick.cards.length === 0 && !showingLastTrick && (
            <div className="bg-deco-midnight/90 backdrop-blur-sm rounded-lg px-4 py-2 border border-deco-gold/20">
              <p className="font-display font-semibold text-sm text-deco-gold">Trick {currentTrick.number}</p>
              <p className="text-xs text-deco-cream/60">Lead: {getDisplayName(gameState, currentTrick.leader)}</p>
            </div>
          )}
        </div>

        {/* Last trick button */}
        {reviewableTrick && !lastCompletedTrick && !showingLastTrick && (
          <button
            onClick={() => setShowingLastTrick(true)}
            className="absolute top-2 right-2 z-20 bg-deco-midnight/80 backdrop-blur-sm text-deco-cream/60 hover:text-deco-cream text-[10px] px-2 py-1 rounded border border-deco-gold/20 hover:border-deco-gold/40 transition-colors"
          >
            Last trick
          </button>
        )}

        {/* Last trick overlay backdrop */}
        {showingLastTrick && (
          <div
            className="absolute inset-0 bg-deco-navy/60 backdrop-blur-sm z-15 rounded-lg cursor-pointer"
            onClick={() => setShowingLastTrick(false)}
          />
        )}

        {/* Position labels and cards */}
        {[Pos.NORTH, Pos.EAST, Pos.SOUTH, Pos.WEST].map((position) => {
          const playedCard = getCardForPosition(position);
          const isCurrentPlayer = gameState.currentPlayer === position;
          const isDeclarer = gameState.contract?.declarer === position;
          const isDummy = gameState.cardPlay?.dummy === position;

          return (
            <div key={position} className={`absolute ${getPositionStyle(position)}`}>
              {/* Position label */}
              <div
                className={`
                  px-3 py-1 rounded text-xs font-semibold tracking-wide transition-all
                  ${isCurrentPlayer
                    ? 'bg-deco-gold text-deco-navy ring-2 ring-deco-gold/50 ring-offset-2 ring-offset-deco-navy animate-pulse-glow'
                    : 'bg-deco-midnight/80 text-deco-cream/60 border border-deco-gold/20'
                  }
                  ${getVisualPosition(position) === 'top' || getVisualPosition(position) === 'bottom' ? 'mb-2' : 'mx-2'}
                `}
              >
                {gameState.players?.[position]?.name || positionNames[position]}
                <span className="ml-1 opacity-50 text-[10px]">{position}</span>
                {isDeclarer && <span className="ml-1 text-deco-gold-light">D</span>}
                {isDummy && <span className="ml-1 opacity-60">*</span>}
              </div>

              {/* Played card */}
              {playedCard && (
                <Card card={playedCard.card} size="md" elevated isTrump={trumpSuit === playedCard.card.suit} />
              )}
            </div>
          );
        })}
      </div>

      {/* Dummy's hand display - suit columns */}
      {dummySuitGroups.length > 0 && dummyPosition && (
        <div className="shrink-0 px-2 pb-2">
          <div className="bg-deco-accent/20 rounded-lg p-3 border border-deco-gold/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-deco-gold tracking-widest uppercase">
                Dummy — {getDisplayName(gameState, dummyPosition)}
              </span>
              <span className="text-xs text-deco-cream/50">{dummyHand!.length} cards</span>
            </div>
            <div className="flex justify-center gap-3">
              {dummySuitGroups.map(({ suit, cards }) => (
                <div key={suit} className="flex flex-col items-center">
                  {cards.map((card, idx) => (
                    <div
                      key={`${card.suit}-${card.rank}`}
                      style={{ marginTop: idx === 0 ? 0 : '-24px' }}
                    >
                      <Card
                        card={card}
                        size="sm"
                        disabled={!canPlayDummyCards}
                        dimmed={!canPlayDummyCards}
                        isTrump={trumpSuit === card.suit}
                        onClick={canPlayDummyCards ? () => onPlayCard!(card) : undefined}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default PlayArea;

import {
  HandRecord,
  Deal,
  BiddingSequence,
  ContractResult,
  DuplicateScore,
  CompletedCardPlay,
  HandMetadata,
  Trick,
  Position,
} from '@bridge/shared';
import { nanoid } from 'nanoid';

export class HandHistory {
  private hands: Map<string, HandRecord> = new Map();

  /**
   * Store a completed hand
   */
  storeHand(
    deal: Deal,
    biddingSequence: BiddingSequence,
    tricks: Trick[],
    result: ContractResult,
    score: DuplicateScore,
    metadata: Partial<HandMetadata>
  ): string {
    const handId = nanoid(10);

    // Find opening lead (first card in first trick)
    const openingLead = tricks[0]?.cards[0];

    // Extract all cards played by declarer (not from dummy)
    const declarerPlay = tricks
      .flatMap((trick) => trick.cards)
      .filter((playedCard) => playedCard.position === result.declarer);

    // Get dummy's hand (exposed cards)
    const dummyPosition = this.getDummyPosition(result.declarer);
    const dummyExposed = deal[dummyPosition.toLowerCase() as 'north' | 'east' | 'south' | 'west'];

    const cardPlay: CompletedCardPlay = {
      tricks,
      openingLead,
      declarerPlay,
      dummyExposed,
    };

    const completeMetadata: HandMetadata = {
      players: {
        north: metadata.players?.north || 'North',
        east: metadata.players?.east || 'East',
        south: metadata.players?.south || 'South',
        west: metadata.players?.west || 'West',
      },
      duration: metadata.duration || 0,
      boardNumber: metadata.boardNumber,
      event: metadata.event,
      notes: metadata.notes,
    };

    const handRecord: HandRecord = {
      id: handId,
      timestamp: Date.now(),
      deal,
      biddingSequence,
      cardPlay,
      result,
      score,
      metadata: completeMetadata,
    };

    this.hands.set(handId, handRecord);
    return handId;
  }

  /**
   * Get a specific hand by ID
   */
  getHand(handId: string): HandRecord | undefined {
    return this.hands.get(handId);
  }

  /**
   * Get all hands, optionally filtered
   */
  getAllHands(filter?: {
    player?: string;
    position?: Position;
    contractType?: string;
    madeContract?: boolean;
    startDate?: number;
    endDate?: number;
  }): HandRecord[] {
    let results = Array.from(this.hands.values());

    if (filter) {
      if (filter.player) {
        results = results.filter(
          (hand) =>
            hand.metadata.players.north === filter.player ||
            hand.metadata.players.east === filter.player ||
            hand.metadata.players.south === filter.player ||
            hand.metadata.players.west === filter.player
        );
      }

      if (filter.position) {
        results = results.filter((hand) => hand.result.declarer === filter.position);
      }

      if (filter.madeContract !== undefined) {
        results = results.filter((hand) => {
          const contract = hand.result.contract;
          const tricksMade = hand.result.tricksMade;
          const tricksNeeded = 6 + contract.level;
          const made = tricksMade >= tricksNeeded;
          return made === filter.madeContract;
        });
      }

      if (filter.startDate) {
        results = results.filter((hand) => hand.timestamp >= filter.startDate!);
      }

      if (filter.endDate) {
        results = results.filter((hand) => hand.timestamp <= filter.endDate!);
      }
    }

    // Sort by timestamp descending (most recent first)
    return results.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Delete a hand
   */
  deleteHand(handId: string): boolean {
    return this.hands.delete(handId);
  }

  /**
   * Clear all hands
   */
  clearAll(): void {
    this.hands.clear();
  }

  /**
   * Get hand count
   */
  getCount(): number {
    return this.hands.size;
  }

  /**
   * Export hand to PBN (Portable Bridge Notation) format
   */
  exportToPBN(handId: string): string | null {
    const hand = this.hands.get(handId);
    if (!hand) return null;

    const { deal, biddingSequence, result, score, metadata } = hand;

    let pbn = '% PBN 2.1\n';
    pbn += '% EXPORT\n';
    pbn += '%\n';

    // Event and metadata
    pbn += `[Event "${metadata.event || 'Bridge Game'}"]\n`;
    pbn += `[Site "Bridge Web App"]\n`;
    pbn += `[Date "${new Date(hand.timestamp).toISOString().split('T')[0].replace(/-/g, '.')}"]\n`;
    pbn += `[Board "${metadata.boardNumber || '1'}"]\n`;

    // Players
    pbn += `[North "${metadata.players.north}"]\n`;
    pbn += `[East "${metadata.players.east}"]\n`;
    pbn += `[South "${metadata.players.south}"]\n`;
    pbn += `[West "${metadata.players.west}"]\n`;

    // Deal and game info
    pbn += `[Dealer "${deal.dealer}"]\n`;
    const vulString = deal.vulnerability.ns && deal.vulnerability.ew ? 'All' :
                      deal.vulnerability.ns ? 'NS' :
                      deal.vulnerability.ew ? 'EW' : 'None';
    pbn += `[Vulnerable "${vulString}"]\n`;

    // Deal format: N:♠AKQ.♥AKQ.♦AKQ.♣AKQ
    const dealString = this.formatDealForPBN(deal);
    pbn += `[Deal "${dealString}"]\n`;

    pbn += `[Scoring "IMP"]\n`;

    // Contract
    const contract = result.contract;
    let contractStr = `${contract.level}${contract.strain}`;
    if (contract.doubled) contractStr += 'X';
    if (contract.redoubled) contractStr += 'XX';
    pbn += `[Declarer "${contract.declarer}"]\n`;
    pbn += `[Contract "${contractStr}"]\n`;

    // Result
    const tricksNeeded = 6 + contract.level;
    const tricksOver = result.tricksMade - tricksNeeded;
    const resultStr = tricksOver >= 0 ? `${tricksOver}` : `${tricksOver}`;
    pbn += `[Result "${resultStr}"]\n`;

    // Score
    pbn += `[Score "NS ${score.nsScore}"]\n`;

    // Bidding (Auction)
    pbn += `[Auction "${deal.dealer}"]\n`;
    let currentPos = deal.dealer;
    for (const call of biddingSequence.calls) {
      // Add passes to align to correct position
      while (currentPos !== call.position) {
        pbn += 'Pass\t';
        currentPos = this.getNextPosition(currentPos);
      }

      if (call.action.type === 'BID') {
        pbn += `${call.action.level}${call.action.strain}\t`;
      } else if (call.action.type === 'PASS') {
        pbn += 'Pass\t';
      } else if (call.action.type === 'DOUBLE') {
        pbn += 'X\t';
      } else if (call.action.type === 'REDOUBLE') {
        pbn += 'XX\t';
      }

      currentPos = this.getNextPosition(currentPos);
    }
    pbn += '\n';

    // Play (card sequence)
    const cardPlaySequence = hand.cardPlay.tricks
      .flatMap((trick) => trick.cards)
      .map((pc) => `${pc.card.suit}${pc.card.rank}`)
      .join(' ');
    pbn += `[Play "${this.getNextPosition(contract.declarer)}"]\n`;
    pbn += `${cardPlaySequence}\n`;

    pbn += '*\n';

    return pbn;
  }

  private formatDealForPBN(deal: Deal): string {
    // Format: N:♠AKQ.♥AKQ.♦AKQ.♣AKQ S:... E:... W:...
    const formatHand = (cards: any[]) => {
      const spades = cards.filter((c) => c.suit === 'S').map((c) => c.rank).join('');
      const hearts = cards.filter((c) => c.suit === 'H').map((c) => c.rank).join('');
      const diamonds = cards.filter((c) => c.suit === 'D').map((c) => c.rank).join('');
      const clubs = cards.filter((c) => c.suit === 'C').map((c) => c.rank).join('');
      return `${spades}.${hearts}.${diamonds}.${clubs}`;
    };

    return `N:${formatHand(deal.north)} ${formatHand(deal.east)} ${formatHand(deal.south)} ${formatHand(deal.west)}`;
  }

  private getDummyPosition(declarer: Position): Position {
    switch (declarer) {
      case Position.NORTH:
        return Position.SOUTH;
      case Position.SOUTH:
        return Position.NORTH;
      case Position.EAST:
        return Position.WEST;
      case Position.WEST:
        return Position.EAST;
    }
  }

  private getNextPosition(position: Position): Position {
    const order = [Position.NORTH, Position.EAST, Position.SOUTH, Position.WEST];
    const currentIndex = order.indexOf(position);
    return order[(currentIndex + 1) % 4];
  }
}

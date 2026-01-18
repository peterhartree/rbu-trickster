import { SessionScore, DuplicateScore } from '@bridge/shared';
import { nanoid } from 'nanoid';

const HANDS_PER_SESSION = 4;

export class SessionManager {
  private session: SessionScore;

  constructor() {
    this.session = this.createNewSession();
  }

  /**
   * Create a new session with zeroed scores
   */
  private createNewSession(): SessionScore {
    return {
      sessionId: nanoid(8),
      handNumber: 0,
      totalHands: HANDS_PER_SESSION,
      nsTotal: 0,
      ewTotal: 0,
      handScores: [],
      isComplete: false,
      startedAt: Date.now(),
    };
  }

  /**
   * Start a new hand - increments hand number
   * Auto-resets if previous session was complete
   */
  startHand(): SessionScore {
    if (this.session.isComplete) {
      this.session = this.createNewSession();
    }
    this.session.handNumber++;
    return { ...this.session };
  }

  /**
   * Record a hand's score and accumulate totals
   */
  recordScore(score: DuplicateScore): SessionScore {
    this.session.handScores.push(score);
    this.session.nsTotal += score.nsScore;
    this.session.ewTotal += score.ewScore;

    // Check if session is complete
    if (this.session.handNumber >= HANDS_PER_SESSION) {
      this.session.isComplete = true;
    }

    return { ...this.session };
  }

  /**
   * Get current session state
   */
  getSession(): SessionScore {
    return { ...this.session };
  }

  /**
   * Reset to a new session
   */
  resetSession(): SessionScore {
    this.session = this.createNewSession();
    return { ...this.session };
  }

  /**
   * Get remaining hands count
   */
  getRemainingHands(): number {
    return HANDS_PER_SESSION - this.session.handNumber;
  }

  /**
   * Check if session is complete
   */
  isSessionComplete(): boolean {
    return this.session.isComplete;
  }
}

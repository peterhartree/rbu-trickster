import type { SessionScore } from '@bridge/shared';

interface SessionScoreDisplayProps {
  session: SessionScore;
}

function SessionScoreDisplay({ session }: SessionScoreDisplayProps) {
  const { handNumber, totalHands, nsTotal, ewTotal, isComplete } = session;

  return (
    <div className="bg-deco-midnight rounded-lg shadow-deco border border-deco-gold/20 px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Hand indicator */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-deco-cream/60 uppercase tracking-wider">Hand</span>
          <span className="font-display font-bold text-deco-gold">
            {handNumber} / {totalHands}
          </span>
        </div>

        {/* Progress dots */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalHands }).map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                i < handNumber
                  ? 'bg-deco-gold'
                  : 'bg-deco-navy border border-deco-gold/30'
              }`}
            />
          ))}
        </div>

        {/* Score totals */}
        <div className="flex items-center gap-4">
          <div className="text-center">
            <span className="text-xs text-deco-cream/60 block">NS</span>
            <span className={`font-display font-bold ${nsTotal >= ewTotal ? 'text-deco-gold' : 'text-deco-cream'}`}>
              {nsTotal}
            </span>
          </div>
          <div className="w-px h-6 bg-deco-gold/20" />
          <div className="text-center">
            <span className="text-xs text-deco-cream/60 block">EW</span>
            <span className={`font-display font-bold ${ewTotal > nsTotal ? 'text-deco-gold' : 'text-deco-cream'}`}>
              {ewTotal}
            </span>
          </div>
        </div>

        {/* Session status */}
        {isComplete && (
          <div className="px-2 py-1 bg-deco-gold/20 rounded border border-deco-gold/30">
            <span className="text-xs font-semibold text-deco-gold">Complete</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default SessionScoreDisplay;

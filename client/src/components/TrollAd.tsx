import { useState, useEffect, useRef } from 'react';

const AD_IMAGES = [
  '/ads/iq-test-1.png',
  '/ads/iq-test-2.png',
  '/ads/weight-loss-1.png',
  '/ads/weight-loss-2.png',
  '/ads/combo.png',
];

const CLOSE_DELAY_SECONDS = 3;

interface TrollAdProps {
  isOpen: boolean;
  onClose: () => void;
}

function TrollAd({ isOpen, onClose }: TrollAdProps) {
  const [adIndex, setAdIndex] = useState(0);
  const [countdown, setCountdown] = useState(CLOSE_DELAY_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Re-randomise and reset timer each time the overlay opens
  useEffect(() => {
    if (isOpen) {
      setAdIndex(Math.floor(Math.random() * AD_IMAGES.length));
      setCountdown(CLOSE_DELAY_SECONDS);

      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const canClose = countdown === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-[90vw] max-w-lg bg-deco-midnight rounded-lg border-2 border-deco-gold/60 shadow-deco-lg overflow-hidden">
        {/* Header */}
        <div className="bg-deco-navy px-4 py-2 border-b border-deco-gold/30 flex items-center justify-between">
          <span className="text-[10px] text-deco-gold/80 tracking-[0.3em] uppercase font-display">
            Advertisement
          </span>
          <button
            onClick={canClose ? onClose : undefined}
            className={`
              text-xs font-display font-bold px-3 py-1 rounded border transition-all
              ${canClose
                ? 'text-deco-gold border-deco-gold/50 hover:bg-deco-gold hover:text-deco-navy cursor-pointer'
                : 'text-deco-cream/30 border-deco-cream/10 cursor-not-allowed'
              }
            `}
          >
            {canClose ? 'Close' : `Close (${countdown})`}
          </button>
        </div>

        {/* Ad image */}
        <div className="p-3">
          <img
            src={AD_IMAGES[adIndex]}
            alt="Advertisement"
            className="w-full rounded"
          />
        </div>

        {/* Footer deco */}
        <div className="flex justify-center items-center gap-2 pb-2">
          <div className="w-8 h-px bg-deco-gold/20" />
          <div className="w-1.5 h-1.5 bg-deco-gold/30 rotate-45" />
          <div className="w-8 h-px bg-deco-gold/20" />
        </div>
      </div>
    </div>
  );
}

export default TrollAd;

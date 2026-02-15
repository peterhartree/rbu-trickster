import { useCallback, useRef } from 'react';

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

function playTone(frequency: number, duration: number, volume = 0.08, type: OscillatorType = 'sine') {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch {
    // Audio not available
  }
}

function playSequence(notes: { freq: number; delay: number; duration: number }[], volume = 0.08, type: OscillatorType = 'sine') {
  for (const note of notes) {
    setTimeout(() => playTone(note.freq, note.duration, volume, type), note.delay * 1000);
  }
}

export function useSoundEffects() {
  const lastTurnSoundRef = useRef(0);

  const cardPlayed = useCallback(() => {
    // Short percussive tap
    playTone(800, 0.06, 0.06, 'square');
  }, []);

  const yourTurn = useCallback(() => {
    // Debounce: don't play twice within 500ms
    const now = Date.now();
    if (now - lastTurnSoundRef.current < 500) return;
    lastTurnSoundRef.current = now;

    // Two ascending notes
    playSequence([
      { freq: 523, delay: 0, duration: 0.12 },    // C5
      { freq: 659, delay: 0.12, duration: 0.18 },  // E5
    ], 0.1, 'sine');
  }, []);

  const trickWon = useCallback(() => {
    // Ascending arpeggio
    playSequence([
      { freq: 523, delay: 0, duration: 0.1 },     // C5
      { freq: 659, delay: 0.08, duration: 0.1 },   // E5
      { freq: 784, delay: 0.16, duration: 0.15 },   // G5
      { freq: 1047, delay: 0.24, duration: 0.25 },  // C6
    ], 0.08, 'sine');
  }, []);

  const bidPlaced = useCallback(() => {
    // Subtle click
    playTone(600, 0.04, 0.04, 'square');
  }, []);

  return { cardPlayed, yourTurn, trickWon, bidPlaced };
}

/**
 * Web Audio API synthesized sounds for classroom quiz excitement
 * No external mp3 files required, fully reliable and offline-ready.
 */

let audioCtx: AudioContext | null = null;
let isMuted = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function toggleMute(): boolean {
  isMuted = !isMuted;
  return isMuted;
}

export function getMuteState(): boolean {
  return isMuted;
}

/**
 * Play an upbeat celebration fanfare chime when the student's name is revealed
 */
export function playFanfareSound(): void {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [
    { freq: 523.25, time: 0, duration: 0.15 },    // C5
    { freq: 659.25, time: 0.12, duration: 0.15 }, // E5
    { freq: 783.99, time: 0.24, duration: 0.2 },  // G5
    { freq: 1046.50, time: 0.4, duration: 0.5 },  // C6
  ];

  const now = ctx.currentTime;

  notes.forEach(({ freq, time, duration }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + time);

    gain.gain.setValueAtTime(0.001, now + time);
    gain.gain.exponentialRampToValueAtTime(0.3, now + time + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + time + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + time);
    osc.stop(now + time + duration + 0.05);
  });
}

/**
 * Play a light "pop" sound when moving to next question or submitting
 */
export function playPopSound(): void {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(400, now);
  osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);

  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.09);
}

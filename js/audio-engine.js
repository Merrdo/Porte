// ============================================================
// Web Audio API - Nota Sesi Üretim Motoru
// ============================================================

let audioCtx = null;

function getContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Verilen frekansta, piyano benzeri yumuşak bir ses çalar.
 * @param {number} frequency - Hz cinsinden frekans
 * @param {number} duration - saniye cinsinden süre
 */
function playNote(frequency, duration = 1.2) {
  const ctx = getContext();
  const now = ctx.currentTime;

  // Birkaç osilatörü katmanlayarak daha zengin, piyano benzeri bir ton oluşturuyoruz
  const partials = [
    { mult: 1, gain: 0.5 },
    { mult: 2, gain: 0.18 },
    { mult: 3, gain: 0.08 },
    { mult: 4, gain: 0.04 },
  ];

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0, now);
  masterGain.gain.linearRampToValueAtTime(0.9, now + 0.015);
  masterGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  masterGain.connect(ctx.destination);

  partials.forEach(({ mult, gain }) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency * mult, now);

    const partialGain = ctx.createGain();
    partialGain.gain.setValueAtTime(gain, now);

    osc.connect(partialGain);
    partialGain.connect(masterGain);

    osc.start(now);
    osc.stop(now + duration + 0.1);
  });
}

/**
 * Kısa bir geri bildirim sesi (doğru/yanlış) çalar.
 */
function playFeedback(correct) {
  const ctx = getContext();
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  if (correct) {
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.setValueAtTime(1108.73, now + 0.09);
  } else {
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(160, now + 0.18);
  }

  gain.gain.setValueAtTime(0.25, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.25);
}

export { playNote, playFeedback, getContext };

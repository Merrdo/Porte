// ============================================================
// İlerleme Takibi (localStorage)
// ============================================================

const STORAGE_KEY = 'porte_progress_v1';

function getDefaultProgress() {
  return {
    completedLevels: [],       // tamamlanan seviye id'leri
    bestScores: {},            // { levelId: { correct, total, bestStreak } }
    totalPracticed: 0,
    theme: 'light',
  };
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultProgress();
    return { ...getDefaultProgress(), ...JSON.parse(raw) };
  } catch (e) {
    return getDefaultProgress();
  }
}

function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.warn('İlerleme kaydedilemedi:', e);
  }
}

function markLevelComplete(levelId) {
  const progress = loadProgress();
  if (!progress.completedLevels.includes(levelId)) {
    progress.completedLevels.push(levelId);
  }
  saveProgress(progress);
  return progress;
}

function recordScore(levelId, correct, total, bestStreak) {
  const progress = loadProgress();
  const existing = progress.bestScores[levelId] || { correct: 0, total: 0, bestStreak: 0 };
  progress.bestScores[levelId] = {
    correct: Math.max(existing.correct, correct),
    total: total,
    bestStreak: Math.max(existing.bestStreak, bestStreak),
  };
  progress.totalPracticed += total;
  saveProgress(progress);
  return progress;
}

function isLevelUnlocked(levelId, allLevels) {
  if (levelId === allLevels[0].id) return true;
  const progress = loadProgress();
  const idx = allLevels.findIndex(l => l.id === levelId);
  if (idx <= 0) return true;
  const prevLevel = allLevels[idx - 1];
  return progress.completedLevels.includes(prevLevel.id);
}

export {
  loadProgress,
  saveProgress,
  markLevelComplete,
  recordScore,
  isLevelUnlocked,
};

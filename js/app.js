// ============================================================
// Ana Uygulama Mantığı
// ============================================================

import { CLEFS, LEVELS, TURKISH_NAMES, noteToFrequency, generateRandomNote } from './music-theory.js';
import { renderStaff } from './staff-renderer.js';
import { playNote, playFeedback } from './audio-engine.js';
import { loadProgress, markLevelComplete, recordScore, isLevelUnlocked } from './progress.js';
import { icon } from './icons.js';
import { showConfirm, showToast } from './notify.js';

// ---------------- Durum (State) ----------------
const state = {
  screen: 'home',        // home | level-select | mode-select | quiz | results
  mode: null,             // 'visual' | 'ear'
  currentLevel: null,
  timedMode: false,
  timeLeft: 60,
  timerInterval: null,
  currentQuestion: null,  // { letter, octave, staffPosition, clefId, freq }
  correctCount: 0,
  wrongCount: 0,
  streak: 0,
  bestStreak: 0,
  totalQuestions: 0,
  answered: false,
};

const NOTE_LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

// ---------------- DOM Referansları ----------------
const app = document.getElementById('app');

// ---------------- Ekran Yönetimi ----------------

function renderApp() {
  document.documentElement.classList.toggle('home-active', state.screen === 'home');
  document.body.classList.toggle('home-active', state.screen === 'home');
  switch (state.screen) {
    case 'home': renderHomeScreen(); break;
    case 'level-select': renderLevelSelectScreen(); break;
    case 'mode-select': renderModeSelectScreen(); break;
    case 'quiz': renderQuizScreen(); break;
    case 'results': renderResultsScreen(); break;
    default: renderHomeScreen();
  }
}

function renderHomeScreen() {
  const progress = loadProgress();
  const completedCount = progress.completedLevels.length;

  app.innerHTML = `
    <div class="screen home-screen">
      <header class="hero">
        <div class="hero-staff-decoration" id="heroStaffDecoration"></div>
        <h1 class="app-title">Porte</h1>
        <p class="app-subtitle">Porteyi oku, kulağını eğit, müziği tanı.</p>
      </header>

      <div class="stats-strip">
        <div class="stat-pill">
          <span class="stat-value">${completedCount}/${LEVELS.length}</span>
          <span class="stat-label">Ders tamamlandı</span>
        </div>
        <div class="stat-pill">
          <span class="stat-value">${progress.totalPracticed}</span>
          <span class="stat-label">Toplam soru</span>
        </div>
      </div>

      <div class="home-actions">
        <button class="btn-text" id="themeToggle">${icon('theme', 'btn-text-icon')} Tema Değiştir</button>
        <button class="btn btn-primary btn-large" id="startBtn">Derslere Başla</button>
      </div>
    </div>
  `;

  // Hero süslemesi: birkaç nota SVG'si
  const heroSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  heroSvg.setAttribute('class', 'hero-svg');
  document.getElementById('heroStaffDecoration').appendChild(heroSvg);
  renderStaff(heroSvg, { staffPosition: 4, clefId: 'treble', showNote: true, clefScale: 1.6 });

  document.getElementById('startBtn').addEventListener('click', () => {
    state.screen = 'level-select';
    renderApp();
  });
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);
}

function renderLevelSelectScreen() {
  const progress = loadProgress();

  const levelCards = LEVELS.map(level => {
    const unlocked = isLevelUnlocked(level.id, LEVELS);
    const completed = progress.completedLevels.includes(level.id);
    const score = progress.bestScores[level.id];

    return `
      <button class="level-card ${!unlocked ? 'locked' : ''} ${completed ? 'completed' : ''}"
              data-level-id="${level.id}" ${!unlocked ? 'disabled' : ''}>
        <div class="level-card-number">${level.id}</div>
        <div class="level-card-body">
          <h3>${level.title}</h3>
          <p>${level.description}</p>
          ${score ? `<span class="level-card-score">En iyi: ${score.correct}/${score.total} · Seri: ${score.bestStreak}</span>` : ''}
        </div>
        <div class="level-card-status">
          ${!unlocked ? icon('lock') : completed ? icon('check') : icon('arrowRight')}
        </div>
      </button>
    `;
  }).join('');

  app.innerHTML = `
    <div class="screen level-select-screen">
      <header class="screen-header">
        <button class="btn-icon" id="backBtn" aria-label="Geri">${icon('back')}</button>
        <h2>Dersler</h2>
      </header>
      <div class="level-list">
        ${levelCards}
      </div>
    </div>
  `;

  document.getElementById('backBtn').addEventListener('click', () => {
    state.screen = 'home';
    renderApp();
  });

  document.querySelectorAll('.level-card:not(.locked)').forEach(card => {
    card.addEventListener('click', () => {
      const levelId = parseInt(card.dataset.levelId, 10);
      state.currentLevel = LEVELS.find(l => l.id === levelId);
      state.screen = 'mode-select';
      renderApp();
    });
  });
}

function renderModeSelectScreen() {
  const level = state.currentLevel;

  app.innerHTML = `
    <div class="screen mode-select-screen">
      <header class="screen-header">
        <button class="btn-icon" id="backBtn" aria-label="Geri">${icon('back')}</button>
        <h2>${level.title}</h2>
      </header>

      <div class="mode-options">
        <button class="mode-card" id="visualModeBtn">
          <span class="mode-icon">${icon('eye')}</span>
          <h3>Görsel Tanıma</h3>
          <p>Portede gösterilen notanın adını bul</p>
        </button>
        <button class="mode-card" id="earModeBtn">
          <span class="mode-icon">${icon('ear')}</span>
          <h3>Kulakla Tanıma</h3>
          <p>Çalınan sesi dinle, notayı tahmin et</p>
        </button>
      </div>

      <div class="timed-toggle-wrap">
        <label class="timed-toggle">
          <input type="checkbox" id="timedToggle" />
          <span>Süreye karşı çalış (60 sn)</span>
        </label>
      </div>
    </div>
  `;

  document.getElementById('backBtn').addEventListener('click', () => {
    state.screen = 'level-select';
    renderApp();
  });

  document.getElementById('visualModeBtn').addEventListener('click', () => startQuiz('visual'));
  document.getElementById('earModeBtn').addEventListener('click', () => startQuiz('ear'));
}

function startQuiz(mode) {
  state.mode = mode;
  state.timedMode = document.getElementById('timedToggle')?.checked || false;
  state.correctCount = 0;
  state.wrongCount = 0;
  state.streak = 0;
  state.bestStreak = 0;
  state.totalQuestions = 0;
  state.timeLeft = 60;
  state.answered = false;
  state.screen = 'quiz';

  nextQuestion();
  renderApp();

  if (state.timedMode) {
    startTimer();
  }
}

function startTimer() {
  clearInterval(state.timerInterval);
  state.timerInterval = setInterval(() => {
    state.timeLeft -= 1;
    updateTimerDisplay();
    if (state.timeLeft <= 0) {
      clearInterval(state.timerInterval);
      finishQuiz();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const el = document.getElementById('timerDisplay');
  if (el) el.textContent = `${state.timeLeft}s`;
}

function nextQuestion() {
  const q = generateRandomNote(state.currentLevel);
  const freq = noteToFrequency(q.letter, q.octave);
  state.currentQuestion = { ...q, freq };
  state.answered = false;
}

function renderQuizScreen() {
  const level = state.currentLevel;
  const q = state.currentQuestion;
  const isVisual = state.mode === 'visual';

  app.innerHTML = `
    <div class="screen quiz-screen">
      <header class="screen-header quiz-header">
        <button class="btn-icon" id="exitBtn" aria-label="Çık">${icon('close')}</button>
        <div class="quiz-progress-info">
          <span class="quiz-score quiz-score-correct">${icon('check', 'inline-icon')} ${state.correctCount}</span>
          <span class="quiz-score quiz-score-wrong">${icon('close', 'inline-icon')} ${state.wrongCount}</span>
          ${state.streak > 1 ? `<span class="quiz-streak">${icon('flame', 'inline-icon')} ${state.streak}</span>` : ''}
        </div>
        ${state.timedMode ? `<span class="timer-display" id="timerDisplay">${state.timeLeft}s</span>` : ''}
      </header>

      <div class="quiz-body">
        ${isVisual ? `
          <div class="staff-display" id="staffDisplay"></div>
        ` : `
          <div class="ear-display">
            <button class="play-note-btn" id="playNoteBtn">
              <span class="play-icon">${icon('speaker')}</span>
              <span>Sesi Çal</span>
            </button>
            <p class="ear-hint">Notayı dinlemek için butona dokun, dilediğin kadar tekrar dinleyebilirsin.</p>
          </div>
        `}

        <div class="answer-feedback" id="answerFeedback"></div>

        <div class="answer-grid" id="answerGrid">
          ${NOTE_LETTERS.map(letter => `
            <button class="answer-btn" data-letter="${letter}">
              <span class="answer-tr">${TURKISH_NAMES[letter]}</span>
              <span class="answer-en">${letter}</span>
            </button>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  if (isVisual) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    document.getElementById('staffDisplay').appendChild(svg);
    renderStaff(svg, { staffPosition: q.staffPosition, clefId: q.clefId, showNote: true });
  } else {
    document.getElementById('playNoteBtn').addEventListener('click', () => {
      playNote(q.freq);
    });
    // İlk soruda otomatik çal
    setTimeout(() => playNote(q.freq), 300);
  }

  document.getElementById('exitBtn').addEventListener('click', async () => {
    const confirmed = await showConfirm({
      title: 'Pratikten çık',
      message: 'Bu oturumdaki ilerlemen kaydedilmeyecek. Çıkmak istediğine emin misin?',
      confirmText: 'Çık',
      cancelText: 'Vazgeç',
    });
    if (confirmed) {
      clearInterval(state.timerInterval);
      state.screen = 'level-select';
      renderApp();
    }
  });

  document.querySelectorAll('.answer-btn').forEach(btn => {
    btn.addEventListener('click', () => handleAnswer(btn.dataset.letter));
  });
}

function handleAnswer(chosenLetter) {
  if (state.answered) return;
  state.answered = true;

  const q = state.currentQuestion;
  const correct = chosenLetter === q.letter;
  const feedbackEl = document.getElementById('answerFeedback');
  const chosenBtn = document.querySelector(`.answer-btn[data-letter="${chosenLetter}"]`);
  const correctBtn = document.querySelector(`.answer-btn[data-letter="${q.letter}"]`);

  playFeedback(correct);
  state.totalQuestions += 1;

  if (correct) {
    state.correctCount += 1;
    state.streak += 1;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
    chosenBtn.classList.add('correct');
    feedbackEl.innerHTML = `<span class="feedback-correct">Doğru! Bu nota ${TURKISH_NAMES[q.letter]} (${q.letter})</span>`;
  } else {
    state.wrongCount += 1;
    state.streak = 0;
    chosenBtn.classList.add('wrong');
    if (correctBtn) correctBtn.classList.add('correct');
    feedbackEl.innerHTML = `<span class="feedback-wrong">Yanlış. Doğru cevap: ${TURKISH_NAMES[q.letter]} (${q.letter})</span>`;
  }

  document.querySelectorAll('.answer-btn').forEach(b => b.disabled = true);

  const questionLimit = state.timedMode ? Infinity : 12;

  setTimeout(() => {
    if (!state.timedMode && state.totalQuestions >= questionLimit) {
      finishQuiz();
    } else if (state.timedMode && state.timeLeft <= 0) {
      finishQuiz();
    } else {
      nextQuestion();
      renderApp();
    }
  }, 1200);
}

function finishQuiz() {
  clearInterval(state.timerInterval);
  recordScore(state.currentLevel.id, state.correctCount, state.totalQuestions, state.bestStreak);

  // Başarı eşiği: %70 doğruluk ile seviye tamamlanmış sayılır
  const accuracy = state.totalQuestions > 0 ? state.correctCount / state.totalQuestions : 0;
  const wasAlreadyCompleted = loadProgress().completedLevels.includes(state.currentLevel.id);
  if (accuracy >= 0.7 && state.totalQuestions >= 5) {
    markLevelComplete(state.currentLevel.id);
    if (!wasAlreadyCompleted) {
      showToast({ message: 'Yeni ders açıldı!', variant: 'success' });
    }
  }

  state.screen = 'results';
  renderApp();
}

function renderResultsScreen() {
  const accuracy = state.totalQuestions > 0
    ? Math.round((state.correctCount / state.totalQuestions) * 100)
    : 0;
  const passed = accuracy >= 70 && state.totalQuestions >= 5;

  app.innerHTML = `
    <div class="screen results-screen">
      <div class="results-badge ${passed ? 'passed' : 'not-passed'}">
        ${passed ? icon('trophy') : icon('spark')}
      </div>
      <h2>${passed ? 'Harika iş!' : 'Devam et!'}</h2>
      <p class="results-summary">
        ${state.correctCount} / ${state.totalQuestions} doğru (%${accuracy})
      </p>
      <p class="results-streak">En uzun seri: ${state.bestStreak}</p>
      ${passed ? '<p class="results-note">Bu dersi tamamladın, sonraki ders açıldı!</p>' : '<p class="results-note">%70 doğruluğa ulaşırsan ders tamamlanmış sayılır.</p>'}

      <div class="results-actions">
        <button class="btn btn-primary" id="retryBtn">Tekrar Dene</button>
        <button class="btn btn-secondary" id="levelsBtn">Derslere Dön</button>
      </div>
    </div>
  `;

  document.getElementById('retryBtn').addEventListener('click', () => {
    state.screen = 'mode-select';
    renderApp();
  });
  document.getElementById('levelsBtn').addEventListener('click', () => {
    state.screen = 'level-select';
    renderApp();
  });
}

// ---------------- Tema ----------------

function toggleTheme() {
  const progress = loadProgress();
  const newTheme = progress.theme === 'dark' ? 'light' : 'dark';
  progress.theme = newTheme;
  document.documentElement.setAttribute('data-theme', newTheme);
  import('./progress.js').then(({ saveProgress }) => saveProgress(progress));
}

function initTheme() {
  const progress = loadProgress();
  document.documentElement.setAttribute('data-theme', progress.theme || 'light');
}

// ---------------- Başlangıç ----------------

function init() {
  initTheme();
  renderApp();

  // Service worker kaydı (PWA için)
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(err => {
        console.warn('Service worker kaydı başarısız:', err);
      });
    });
  }
}

init();

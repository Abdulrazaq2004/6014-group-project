/* ================================
   CYBER6014 GAME - CONFIG & HELPERS
   ================================ */

/** LocalStorage Keys */
const LS_USERS_KEY        = 'cyber_users';
const LS_CURRENT_KEY      = 'cyber_current_user';
const LS_PROFILE_IMG_ROOT = 'userProfileImage';
// Per-user progress: { username: { category: ['easy', 'medium'] } }
const LS_PROGRESS_ROOT    = 'cyber_progress';
const DEFAULT_AVATAR      = 'images/default-avatar.png';

/** Helpers for LocalStorage Keys */
const profileImgKey = (username) => `${LS_PROFILE_IMG_ROOT}:${username}`;
const progressKey   = (username) => `${LS_PROGRESS_ROOT}:${username}`;

/** Simple DOM Selectors */
const $  = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

/** Shuffles an array in place using the Fisher-Yates algorithm. */
function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

/** Picks N random questions from a pool without repetition. */
function sampleQuestions(pool, n) {
  const copy = pool.slice();
  shuffleInPlace(copy);
  return copy.slice(0, Math.min(n, copy.length));
}

/** Extracts all unique categories from the global `window.questions` array. */
function getAllCategoriesFromQuestions() {
  // Assumes `window.questions` is an array of question objects available globally
  if (!Array.isArray(window.questions)) return [];
  const cats = new Set();
  window.questions.forEach(q => { if (q.category) cats.add(q.category); });
  return Array.from(cats);
}
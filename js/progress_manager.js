/* ================================
   CYBER6014 GAME - PROGRESS MANAGER
   ================================ */

/* ---------------- Progress helpers ---------------- */

/** Loads the progress object for a specific user. */
function loadUserProgress(username) {
  if (!username) return {};
  const raw = localStorage.getItem(progressKey(username));
  try { return raw ? JSON.parse(raw) : {}; } catch { return {}; }
}

/** Saves the progress object for a specific user. */
function saveUserProgress(username, obj) {
  if (!username) return;
  localStorage.setItem(progressKey(username), JSON.stringify(obj || {}));
}

/** Checks if a specific difficulty for a category is unlocked. (Not used in current flow but kept for consistency) */
function isDifficultyUnlocked(username, category, difficulty) {
  const p = loadUserProgress(username);
  const cat = p[category] || [];
  return cat.includes(difficulty);
}

/** Unlocks a specific difficulty for a category for the user. */
function unlockDifficulty(username, category, difficulty) {
  const p = loadUserProgress(username);
  if (!p[category]) p[category] = [];
  if (!p[category].includes(difficulty)) {
    p[category].push(difficulty);
    saveUserProgress(username, p);
  }
}
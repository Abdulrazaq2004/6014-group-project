/* ================================
   CYBER6014 GAME - USER MANAGER
   ================================ */

/* ---------------- Users helpers ---------------- */

/** Retrieves the list of all registered users from localStorage. */
function getUsers() {
  const raw = localStorage.getItem(LS_USERS_KEY);
  try { return raw ? JSON.parse(raw) : []; } catch { return []; }
}

/** Saves the list of users back to localStorage. */
function saveUsers(list) {
  localStorage.setItem(LS_USERS_KEY, JSON.stringify(list || []));
}

/** Gets the username of the currently logged-in user. */
function getCurrentUser() {
  return localStorage.getItem(LS_CURRENT_KEY) || null;
}

/** Sets or removes the currently logged-in user. */
function saveCurrentUser(username) {
  if (username) localStorage.setItem(LS_CURRENT_KEY, username);
  else          localStorage.removeItem(LS_CURRENT_KEY);
}

/** Finds a user object by username. */
function findUser(username) {
  return getUsers().find(u => u.username === username) || null;
}

/** Updates the score for a specific user. */
function updateUserScore(username, pts) {
  const users = getUsers();
  const i = users.findIndex(u => u.username === username);
  if (i === -1) return null;
  users[i].score = (users[i].score || 0) + (pts || 0);
  saveUsers(users);
  return users[i].score;
}
/* ================================
   CYBER6014 GAME - SCRIPT (v2)
   - Category -> Difficulty -> 3-question attempt flow
   - Per-user avatars & progress saved to localStorage
   - Uses a simple DOM router based on the <body> data-page attribute
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

/* ---------------- Header (shared UI) ---------------- */

/** Sets the profile image in the main header. */
function setHeaderProfileImage(currentUser) {
  const img = $('#headerProfilePic');
  if (!img) return;
  if (!currentUser) {
    img.src = DEFAULT_AVATAR;
    return;
  }
  const stored = localStorage.getItem(profileImgKey(currentUser));
  img.src = stored || DEFAULT_AVATAR;
}

/** Initializes header logic (profile dropdown and logout). */
function initHeader() {
  const current = getCurrentUser();
  const img     = $('#headerProfilePic');
  const menu    = $('#profileDropdown');
  const logout  = $('#logoutBtn');

  setHeaderProfileImage(current);

  // Toggle profile dropdown menu
  if (img && menu) {
    img.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.style.display = (menu.style.display === 'flex') ? 'none' : 'flex';
    });
    // Close menu when clicking outside
    window.addEventListener('click', (e) => {
      if (!img.contains(e.target) && !menu.contains(e.target)) menu.style.display = 'none';
    });
  }

  // Handle logout
  if (logout) {
    logout.addEventListener('click', () => {
      saveCurrentUser(null);
      setHeaderProfileImage(null);
      window.location.href = 'index.html'; // Redirect to auth/index page
    });
  }
}

/* ---------------- Auth Page (Login/Register) ---------------- */

function initAuthPage() {
  // If already logged in, redirect to main page
  if (getCurrentUser()) { window.location.href = 'main.html'; return; }

  setHeaderProfileImage(null);
  initHeader();

  const registerForm     = document.getElementById('registerForm');
  const loginForm        = document.getElementById('loginForm');
  const switchToLogin    = document.getElementById('switchToLogin');
  const switchToRegister = document.getElementById('switchToRegister');
  const passwordMismatch = document.getElementById('passwordMismatch'); // Used for all registration errors

  // Switch between login and register forms
  switchToLogin?.addEventListener('click', () => {
    registerForm.classList.remove('active');
    loginForm.classList.add('active');
    passwordMismatch.textContent = ''; // Clear error message
  });
  switchToRegister?.addEventListener('click', () => {
    loginForm.classList.remove('active');
    registerForm.classList.add('active');
    document.getElementById('loginError').textContent = ''; // Clear login error
  });

  // Handle registration submission
  registerForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    passwordMismatch.textContent = ''; // Clear previous error
    const username = document.getElementById('regUsername').value.trim();
    const pass1 = document.getElementById('regPassword').value.trim();
    const pass2 = document.getElementById('confirmPassword').value.trim();

    const englishRegex = /^[A-Za-z0-9_]+$/;
    if (!englishRegex.test(username)) {
      passwordMismatch.textContent = 'Username must contain only English letters, numbers, or underscores.';
      return;
    }
    if (pass1.length < 8) {
      passwordMismatch.textContent = 'Password must be at least 8 characters long.';
      return;
    }
    if (pass1 !== pass2) {
      passwordMismatch.textContent = 'Passwords do not match.';
      return;
    }
    if (findUser(username)) {
      passwordMismatch.textContent = 'Username already exists.';
      return;
    }

    // Register new user
    const users = getUsers();
    users.push({ username, password: pass1, score: 0 });
    saveUsers(users);

    // Initialize progress: unlock easy by default for all categories
    const categories = getAllCategoriesFromQuestions();
    const initial = {};
    categories.forEach(c => initial[c] = ['easy']); // easy unlocked by default for all categories
    saveUserProgress(username, initial);

    // Log in and redirect
    saveCurrentUser(username);
    window.location.href = 'main.html';
  });

  // Handle login submission
  loginForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const user = findUser(username);
    const loginError = document.getElementById('loginError');

    if (user && user.password === password) {
      saveCurrentUser(username);
      window.location.href = 'main.html';
    } else {
      if (loginError) loginError.textContent = 'Invalid username or password.';
    }
  });
}

/* ---------------- Main Page ---------------- */

function initMainPage(current) {
  const user = findUser(current);
  // If user not found (e.g., deleted), log out and redirect
  if (!user) { saveCurrentUser(null); window.location.href = 'index.html'; return; }

  setHeaderProfileImage(current);
  initHeader();

  const start = $('#mainStartBtn');
  if (start) start.addEventListener('click', () => window.location.href = 'game.html');
}

/* ---------------- Utility: categories from questions ---------------- */

/** Extracts all unique categories from the global `window.questions` array. */
function getAllCategoriesFromQuestions() {
  // Assumes `window.questions` is an array of question objects available globally
  if (!Array.isArray(window.questions)) return [];
  const cats = new Set();
  window.questions.forEach(q => { if (q.category) cats.add(q.category); });
  return Array.from(cats);
}

/* ---------------- Game Page (new flow) ---------------- */

// Global state for the current game attempt
let currentUserGlobal = null;
let currentCategory = null;
let currentDifficulty = null;
let currentAttemptQuestions = []; // array of 3 question objects
let currentQuestionIndex = 0;
let currentQuestionObj = null;
let currentAttemptCorrect = 0;
let attemptNumber = 1; // attempt count for the current level (used for retries)

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

/** Prepares the UI: renders category buttons on the start screen. */
function renderCategories() {
  const container = $('#start-screen .category-grid');
  if (!container) return;
  container.innerHTML = '';
  const cats = getAllCategoriesFromQuestions();

  if (!cats.length) {
    container.textContent = 'No categories available yet.';
    return;
  }

  cats.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'category-btn';
    // Capitalize first letter
    btn.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    btn.dataset.category = cat;
    btn.addEventListener('click', () => {
      currentCategory = cat;
  // Always start automatically at Easy level
      startAttemptFor(cat, "easy");
    });

    container.appendChild(btn);
  });
}



/** Starts a 3-question attempt for a specific category and difficulty. */
function startAttemptFor(category, diff) {
  currentCategory = category;
  currentDifficulty = diff;
  attemptNumber = 1;
  prepareAttemptQuestions();
  showQuestionScreen();
}

/** Selects and prepares 3 random questions for the attempt. */
function prepareAttemptQuestions() {
  const pool = (window.questions || []).filter(q => q.category === currentCategory && q.difficulty === currentDifficulty);
  if (!pool.length) {
    alert('No questions for this category/difficulty.');
    return;
  }
  currentAttemptQuestions = sampleQuestions(pool, 3);
  currentQuestionIndex = 0;
  currentAttemptCorrect = 0;
}

/** Switches to and sets up the question screen UI. */
function showQuestionScreen() {
  $('#current-category').textContent = currentCategory;
  const startScreen = $('#start-screen');
  const questionScreen = $('#question-screen');
  if (startScreen) startScreen.classList.add('hidden');
  if (questionScreen) questionScreen.classList.remove('hidden');

  // Set difficulty label
  const label = $('#current-difficulty-label');
  if (label) label.textContent = `(${currentCategory} · ${currentDifficulty})`;

  // Make sure options container is visible for the new question
  $('#options-container')?.classList.remove('hidden');
  displayCurrentQuestion();
}

/** Renders the current question and its shuffled options. */
function displayCurrentQuestion() {
  if (!currentAttemptQuestions.length) return;
  if (currentQuestionIndex >= currentAttemptQuestions.length) {
    // Attempt finished -> evaluate
    finalizeAttempt();
    return;
  }

  currentQuestionObj = currentAttemptQuestions[currentQuestionIndex];

  // Render question text & options
  const qEl = $('#current-question');
  const cont = $('#options-container');
  const fb = $('#feedback-message');
  if (qEl) qEl.textContent = currentQuestionObj.question_text || '';
  if (fb) { fb.textContent = ''; fb.classList.remove('wrong'); }

  if (cont) {
    cont.innerHTML = '';
    const opts = [...currentQuestionObj.options];
    shuffleInPlace(opts);
    opts.forEach(opt => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'option-btn';
      b.dataset.answer = opt;
      b.textContent = opt;
      cont.appendChild(b);
    });
  }
}

/** Evaluates the attempt (after 3 questions) and shows the result screen. */
function finalizeAttempt() {
  const success = currentAttemptCorrect >= 2;
  const user = getCurrentUser();
  const fb = $('#feedback-message');

  $('#feedback-popup')?.classList.add('hidden');
  $('#incident-screen')?.classList.add('hidden');

  if (success) {
    const order = ['easy', 'medium', 'hard'];
    const idx = order.indexOf(currentDifficulty);
    const next = (idx >= 0 && idx < order.length - 1) ? order[idx + 1] : null;

    // افتح الصعوبة التالية فقط بدون أي انتقال تلقائي
    if (next) unlockDifficulty(user, currentCategory, next);

    // فعّل الزر الخاص بالصعوبة الجديدة
    const diffBtns = document.querySelectorAll('.difficulty-btn');
    diffBtns.forEach(b => {
      if (b.dataset.diff === next) {
        b.classList.remove('locked');
        b.disabled = false;
        b.style.filter = 'none';
        b.style.boxShadow = '0 0 16px #00ff99';
      }
    });

    // عرض رسالة نجاح واضحة فقط
    if (fb) {
      fb.classList.remove('wrong');
      fb.innerHTML = `✅ Excellent! You passed this level.<br>Next difficulty unlocked — choose it manually when ready.`;
    }

    // إبقاء الشاشة الحالية بدون تنقل أو طبقات
    $('#question-screen')?.classList.remove('hidden');
    $('#start-screen')?.classList.add('hidden');
    document.body.style.overflow = "auto";

  } else {
    // في حالة الفشل فقط
    $('#incident-screen')?.classList.remove('hidden');
    const t = $('#incident-title'),
      d = $('#incident-details');
    if (t) t.textContent = `Topic: ${currentQuestionObj.incident_title}`;
    if (d) d.innerHTML = `<p>${currentQuestionObj.incident_details}</p>`;
  }
}


/** Initializes the Game page (UI, sidebar, event listeners). */
function initGamePage(current) {
  const user = findUser(current);
  if (!user) { saveCurrentUser(null); window.location.href = 'index.html'; return; }

  currentUserGlobal = current;
  setHeaderProfileImage(current);
  initHeader();

  // Sidebar info
  const nameEl  = $('#current-username');
  const scoreEl = $('#total-score');
  if (nameEl)  nameEl.textContent  = user.username;
  if (scoreEl) scoreEl.textContent = user.score || 0;

  const sidePic = $('#sidebar-profile-pic');
  if (sidePic && current) {
    const storedImg = localStorage.getItem(profileImgKey(current));
    sidePic.src = storedImg || DEFAULT_AVATAR;
  }

  // Prepare categories selection UI
  renderCategories();

  // Options click handler (answers)
  const cont = $('#options-container');
  if (cont) {
    cont.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-answer]');
      if (!btn || !currentQuestionObj || btn.disabled) return;

      const ans = btn.dataset.answer;
      const correct = ans === currentQuestionObj.correct_answer;
      btn.disabled = true;

      if (correct) {
        btn.classList.add('correct-answer');
        currentAttemptCorrect++;
        // Award points immediately
        const newScore = updateUserScore(current, currentQuestionObj.points);
        if (scoreEl) scoreEl.textContent = newScore;
        
        // Show short message
        const fb = $('#feedback-message');
        if (fb) {
          fb.classList.remove('wrong');
          fb.innerHTML = `<span style="color:#00ff99;">✅ Correct!</span> <br> +${currentQuestionObj.points} points`;
        }
        
        // Disable other buttons for this question
        $$('.option-btn').forEach(b => b.disabled = true);
        
        // Move to next question after delay
        setTimeout(() => {
          currentQuestionIndex++;
          $('#options-container')?.classList.remove('hidden');
          displayCurrentQuestion();
        }, 750);
      } else {
        btn.classList.add('wrong-answer');
        
        // Show wrong message
        const fb = $('#feedback-message');
        if (fb) {
          fb.classList.add('wrong');
          fb.innerHTML = `<span style="color:#ff4444;">❌ Wrong answer!</span> Keep going...`;
        }
        
        // Disable all options for this question and move to next question after delay
        $$('.option-btn').forEach(b => b.disabled = true);
        setTimeout(() => {
          currentQuestionIndex++;
          displayCurrentQuestion();
        }, 900);
      }
    });
  }

  // Feedback popup actions (continue / retry)
  // Action after a successful attempt
  $('#next-question-btn')?.addEventListener('click', () => {
    $('#feedback-popup')?.classList.add('hidden');
    $('#incident-screen')?.classList.add('hidden');

    
    // Go back to the main category selection screen
    const questionScreen = $('#question-screen');
    const startScreen = $('#start-screen');
    if (questionScreen) questionScreen.classList.add('hidden');
    if (startScreen) {
      startScreen.classList.remove('hidden');
      renderCategories();
    }
  });
  
  // Show incident details (after a failed attempt)
  $('#show-incident-btn')?.addEventListener('click', () => {
    if (!currentQuestionObj) return;
    // Details are set in finalizeAttempt, just switch screens
    $('#feedback-popup')?.classList.add('hidden');
    $('#incident-screen')?.classList.remove('hidden');
  });
  
  // Open external article link
  $('#show-article-btn')?.addEventListener('click', () => {
    if (currentQuestionObj?.article_link) window.open(currentQuestionObj.article_link, '_blank');
  });

  // Retry the level (after a failed attempt)
  $('#continue-game-btn')?.addEventListener('click', () => {
    // Retry: prepare a new set of 3 questions for the same category/diff
    attemptNumber++;
    prepareAttemptQuestions();
    $('#feedback-popup')?.classList.add('hidden');
    $('#incident-screen')?.classList.add('hidden');
    displayCurrentQuestion();
  });

  // Hide popups on initial load
  $('#feedback-popup')?.classList.add('hidden');
  $('#incident-screen')?.classList.add('hidden');

    // 🧭 Back button to return to the category screen
  $('#back-btn')?.addEventListener('click', () => {
    const questionScreen = $('#question-screen');
    const startScreen = $('#start-screen');

    if (questionScreen) questionScreen.classList.add('hidden');
    if (startScreen) startScreen.classList.remove('hidden');
  });

}

/* ---------------- Leaderboard Page ---------------- */

function initLeaderboardPage(current) {
  setHeaderProfileImage(current);
  initHeader();

  const podium = document.getElementById('podium');
  const list   = document.getElementById('leaderboard-list');
  if (!podium || !list) return;

  // Get users and sort by score descending
  const users = getUsers().slice().sort((a,b)=>(b.score||0)-(a.score||0));

  const top3   = users.slice(0,3);
  const others = users.slice(3);

  // Render Top 3 Podium
  podium.innerHTML = '';
  // The desired display order is 2nd, 1st, 3rd.
  const classes = ['second','first','third'];
  const order   = [top3[1] || null, top3[0] || null, top3[2] || null];

  order.forEach((u, idx) => {
    if (!u) return;
    const img = localStorage.getItem(profileImgKey(u.username)) || DEFAULT_AVATAR;
    const slot = document.createElement('div');
    slot.className = `slot ${classes[idx]}`;
    // Rank logic: idx=0 is 2nd, idx=1 is 1st, idx=2 is 3rd
    const rank = idx===0 ? 2 : idx===1 ? 1 : 3;
    slot.innerHTML = `
      <div class="avatar-wrap">
        <img class="avatar-lg" src="${img}" alt="avatar">
        <span class="rank-badge">${rank}</span>
      </div>
      <div class="name">${u.username}</div>
      <div class="score-pill">${u.score || 0} Points</div>
    `;
    podium.appendChild(slot);
  });

  // Pagination for other users
  const USERS_PER_PAGE = 10;
  let currentPage = 1;
  const totalPages = Math.max(1, Math.ceil(others.length / USERS_PER_PAGE));
  const listEl = list; // Renamed to listEl for clarity inside function

  function renderPage(page) {
    listEl.innerHTML = '';
    const start = (page - 1) * USERS_PER_PAGE;
    const pageUsers = others.slice(start, start + USERS_PER_PAGE);

    pageUsers.forEach((u, i) => {
      // Ranks start from 4 after the top 3
      const rank = start + i + 4;
      const li = document.createElement('li');
      if (u.username === current) li.classList.add('current-user');
      li.innerHTML = `
        <span class="rank">${rank}</span>
        <div class="player">
          <img class="avatar" src="${localStorage.getItem(profileImgKey(u.username)) || DEFAULT_AVATAR}" alt="avatar">
          <div class="player-info en">
            <span class="meta">${u.username === current ? 'You' : 'Player'}</span>
            <span class="name">${u.username}</span>
          </div>
        </div>
        <span class="score">${u.score || 0}</span>
      `;
      listEl.appendChild(li);
    });

    // Render pagination controls
    const pagination = document.getElementById('pagination');
    if (pagination) {
      pagination.innerHTML = '';
      if (totalPages > 1) {
        if (page > 1) {
          const prev = document.createElement('button');
          prev.textContent = '← Back';
          prev.className = 'page-btn';
          prev.addEventListener('click', () => { currentPage--; renderPage(currentPage); });
          pagination.appendChild(prev);
        }
        const pageInfo = document.createElement('span');
        pageInfo.textContent = `Page ${page} / ${totalPages}`;
        pagination.appendChild(pageInfo);
        if (page < totalPages) {
          const next = document.createElement('button');
          next.textContent = 'Next →';
          next.className = 'page-btn';
          next.addEventListener('click', () => { currentPage++; renderPage(currentPage); });
          pagination.appendChild(next);
        }
      }
    }
  }

  renderPage(currentPage);
}

/* ---------------- Profile Page ---------------- */

function initProfilePage(current) {
  const user = findUser(current);
  if (!user) { saveCurrentUser(null); window.location.href = 'index.html'; return; }

  setHeaderProfileImage(current);
  initHeader();

  const uname  = $('#profile-username');
  const score  = $('#profile-score');
  const pic    = $('#profile-pic');
  const file   = $('#profile-file');
  const change = $('#change-pic');

  if (uname) uname.textContent = user.username;
  if (score) score.textContent = user.score || 0;

  // Load and display current profile picture
  const stored = localStorage.getItem(profileImgKey(current));
  if (pic) pic.src = stored || DEFAULT_AVATAR;

  // Handle profile picture change
  if (change && file) {
    change.addEventListener('click', () => file.click()); // Click hidden file input
    file.addEventListener('change', (e) => {
      const f = e.target.files?.[0];
      if (!f) return;
      
      // Read file as Data URL
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
        // Save to localStorage
        localStorage.setItem(profileImgKey(current), dataUrl);
        // Update displayed image on page
        if (pic) pic.src = dataUrl;
        // Update header image
        setHeaderProfileImage(current);
      };
      reader.readAsDataURL(f);
    });
  }
}

/* ---------------- Simple Router ---------------- */

document.addEventListener('DOMContentLoaded', () => {
  // Read the page type from the body's data attribute
  const page = document.body.getAttribute('data-page'); // auth | main | game | leaderboard | profile
  const cur  = getCurrentUser();

  if (page === 'auth') {
    initAuthPage();
    return;
  }

  // Authentication check for protected pages
  if (!cur) {
    // For pages other than index/auth, redirect to index
    if (page !== 'index') {
      window.location.href = 'index.html';
      return;
    }
  }
  
  // Initialize specific page logic
  if (page === 'main')        initMainPage(cur);
  else if (page === 'game')   initGamePage(cur);
  else if (page === 'leaderboard') initLeaderboardPage(cur);
  else if (page === 'profile')     initProfilePage(cur);
});
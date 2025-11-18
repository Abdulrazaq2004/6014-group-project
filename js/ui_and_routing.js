/* ================================
   CYBER6014 GAME - UI & ROUTING
   ================================ */

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
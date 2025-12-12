/* ================================
   CYBER6014 GAME - UI & ROUTING (FIXED)
   ================================ */

// Global flag to prevent premature redirects during registration
let isRegistering = false;

/* ---------------- Header (shared UI) ---------------- */

function setHeaderProfileImage(user) {
  const img = $('#headerProfilePic');
  if (!img) return;
  if (user && user.photoURL) {
    img.src = user.photoURL;
    img.classList.remove('hidden');
  } else {
    img.src = DEFAULT_AVATAR;
    if(!user) img.classList.add('hidden');
  }
}

function initHeader(user) {
  const img     = $('#headerProfilePic');
  const menu    = $('#profileDropdown');
  const logout  = $('#logoutBtn');

  setHeaderProfileImage(user);

  // Toggle profile dropdown menu
  if (img && menu) {
    const newImg = img.cloneNode(true);
    img.parentNode.replaceChild(newImg, img);
    
    newImg.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.style.display = (menu.style.display === 'flex') ? 'none' : 'flex';
    });
    window.addEventListener('click', (e) => {
      if (!newImg.contains(e.target) && !menu.contains(e.target)) menu.style.display = 'none';
    });
  }

  // Handle logout
  if (logout) {
    const newLogout = logout.cloneNode(true);
    logout.parentNode.replaceChild(newLogout, logout);
    
    newLogout.addEventListener('click', () => {
      auth.signOut().then(() => {
        window.location.href = 'index.html';
      });
    });
  }
}

/* ---------------- Auth Page ---------------- */

function initAuthPage() {
  const registerForm     = document.getElementById('registerForm');
  const loginForm        = document.getElementById('loginForm');
  const switchToLogin    = document.getElementById('switchToLogin');
  const switchToRegister = document.getElementById('switchToRegister');
  const passwordMismatch = document.getElementById('passwordMismatch');
  const loginError       = document.getElementById('loginError');
  const forgotLink       = document.getElementById('forgotPassLink');

  // Switch forms
  switchToLogin?.addEventListener('click', () => {
    registerForm.classList.remove('active');
    loginForm.classList.add('active');
    if(passwordMismatch) passwordMismatch.textContent = '';
  });
  switchToRegister?.addEventListener('click', () => {
    loginForm.classList.remove('active');
    registerForm.classList.add('active');
    if(loginError) loginError.textContent = '';
  });

  // Handle Registration
  registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // 1. SET FLAG TO TRUE to stop onAuthStateChanged from redirecting early
    isRegistering = true;

    if(passwordMismatch) {
        passwordMismatch.textContent = 'Creating account...';
        passwordMismatch.style.color = '#ff6f61';
    }
    
    const email    = document.getElementById('regEmail').value.trim();
    const username = document.getElementById('regUsername').value.trim();
    const pass1    = document.getElementById('regPassword').value.trim();
    const pass2    = document.getElementById('confirmPassword').value.trim();

    if (!/^[A-Za-z0-9_]+$/.test(username)) {
      passwordMismatch.textContent = 'Username: English letters, numbers, underscores only.';
      isRegistering = false; // Reset flag on error
      return;
    }
    if (pass1.length < 6) {
      passwordMismatch.textContent = 'Password must be at least 6 characters.';
      isRegistering = false; // Reset flag on error
      return;
    }
    if (pass1 !== pass2) {
      passwordMismatch.textContent = 'Passwords do not match.';
      isRegistering = false; // Reset flag on error
      return;
    }

    try {
        const result = await registerUser(email, username, pass1);
        if (result.success) {
           // Redirect ONLY after successful DB write
           window.location.href = 'main.html';
        } else {
           passwordMismatch.textContent = result.message;
           isRegistering = false; // Reset flag on failure
        }
    } catch (err) {
        console.error(err);
        isRegistering = false;
    }
  });

  // Handle Login
  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if(loginError) {
        loginError.textContent = 'Logging in...';
        loginError.style.color = '#ff6f61';
    }
    
    const input = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    const result = await loginUser(input, password);
    if (result.success) {
      window.location.href = 'main.html';
    } else {
      loginError.textContent = result.message || 'Invalid credentials.';
    }
  });

  // Handle Forgot Password
  forgotLink?.addEventListener('click', async (e) => {
    e.preventDefault();
    const email = prompt("Please enter your email address to reset your password:");
    if (email && email.includes('@')) {
      const res = await resetUserPassword(email);
      if (res.success) {
        alert("Password reset email sent! Check your inbox.");
      } else {
        alert("Error: " + res.message);
      }
    } else if (email) {
      alert("Please enter a valid email.");
    }
  });
}

/* ---------------- Main Page Logic (Welcome Feature) ---------------- */

async function checkAndShowWelcomeMessage(user) {
  if (user && user.uid && !user.hasSeenWelcome) {
    const overlay = $('#welcomeOverlay');

    if (!overlay) {
      console.warn("Welcome overlay element not found in main.html.");
      return;
    }

    overlay.classList.remove('hidden-welcome');
    
    const handleDismiss = async () => {
      overlay.classList.add('hidden-welcome');
      try {
        await db.collection('users').doc(user.uid).update({ 
          hasSeenWelcome: true 
        });
        user.hasSeenWelcome = true;
      } catch (e) {
        console.error("Error updating welcome flag:", e);
      }
    };
    
    overlay.addEventListener('click', handleDismiss, { once: true }); 
  }
}

function initMainPage(currentUser) {
  setHeaderProfileImage(currentUser);
  initHeader(currentUser);
  const start = $('#mainStartBtn');
  if (start) { 
    const newStart = start.cloneNode(true);
    start.parentNode.replaceChild(newStart, start);
    newStart.addEventListener('click', () => window.location.href = 'game.html');
  }
  
  checkAndShowWelcomeMessage(currentUser);
}


/* ---------------- Leaderboard Page ---------------- */

async function initLeaderboardPage(currentUser) {
  setHeaderProfileImage(currentUser);
  initHeader(currentUser);

  const podium = document.getElementById('podium');
  const list   = document.getElementById('leaderboard-list');
  if (!podium || !list) return;

  list.innerHTML = '<li style="text-align:center">Loading leaderboard...</li>';
  const users = await getLeaderboardData();

  const top3   = users.slice(0,3);
  const others = users.slice(3);

  // Render Top 3
  podium.innerHTML = '';
  const classes = ['second','first','third'];
  const order   = [top3[1] || null, top3[0] || null, top3[2] || null];

  order.forEach((u, idx) => {
    if (!u) return;
    const slot = document.createElement('div');
    slot.className = `slot ${classes[idx]}`;
    const rank = idx===0 ? 2 : idx===1 ? 1 : 3;
    slot.innerHTML = `
      <div class="avatar-wrap">
        <img class="avatar-lg" src="${u.photoURL || DEFAULT_AVATAR}" alt="avatar">
        <span class="rank-badge">${rank}</span>
      </div>
      <div class="name">${u.username}</div>
      <div class="score-pill">${u.score || 0} Points</div>
    `;
    podium.appendChild(slot);
  });

  // Render List
  list.innerHTML = '';
  others.forEach((u, i) => {
    const rank = i + 4;
    const li = document.createElement('li');
    if (currentUser && u.username === currentUser.username) li.classList.add('current-user');
    li.innerHTML = `
      <span class="rank">${rank}</span>
      <div class="player">
        <img class="avatar" src="${u.photoURL || DEFAULT_AVATAR}" alt="avatar">
        <div class="player-info en">
          <span class="meta">${(currentUser && u.username === currentUser.username) ? 'You' : 'Player'}</span>
          <span class="name">${u.username}</span>
        </div>
      </div>
      <span class="score">${u.score || 0}</span>
    `;
    list.appendChild(li);
  });
}

/* ---------------- Profile Page ---------------- */

async function initProfilePage(currentUser) {
  setHeaderProfileImage(currentUser);
  initHeader(currentUser);

  const uname  = $('#profile-username');
  const score  = $('#profile-score');
  const pic    = $('#profile-pic');
  const file   = $('#profile-file');
  const change = $('#change-pic');
  const playedEl = $('#profile-games-played');
  const rankEl   = $('#profile-rank');

  if (uname) uname.textContent = currentUser.username;
  if (score) score.textContent = currentUser.score || 0;
  if (playedEl) playedEl.textContent = currentUser.gamesPlayed || 0;
  if (pic) pic.src = currentUser.photoURL || DEFAULT_AVATAR;

  if (rankEl) {
    rankEl.textContent = "Loading...";
    const r = await getUserRank(currentUser.uid);
    rankEl.textContent = r;
  }

  if (change && file) {
    const newChange = change.cloneNode(true);
    change.parentNode.replaceChild(newChange, change);
    
    const newFile = file.cloneNode(true);
    file.parentNode.replaceChild(newFile, file);
    
    newChange.addEventListener('click', () => newFile.click());

    newFile.addEventListener('change', async (e) => {
      const f = e.target.files?.[0];
      if (!f) return;

      newChange.style.opacity = 0.5;
      newChange.style.cursor = 'wait';

      try {
        const newUrl = await uploadUserProfileImage(currentUser.uid, f);
        
        if (newUrl) {
          if (pic) pic.src = newUrl;
          setHeaderProfileImage({ ...currentUser, photoURL: newUrl }); 
          alert("Profile picture updated successfully!");
        } else {
          alert("Failed to upload image. Check console for details.");
        }
      } catch (err) {
        console.error(err);
        alert("Error uploading image.");
      } finally {
        newChange.style.opacity = 1;
        newChange.style.cursor = 'pointer';
        newFile.value = ''; 
      }
    });
  }
}

/* ---------------- Routing Logic ---------------- */

document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.getAttribute('data-page');

  auth.onAuthStateChanged(async (firebaseUser) => {
    
    // 1. AUTH PAGE (Login/Register)
    if (page === 'auth') {
      if (firebaseUser) {
         // CRITICAL FIX: If we are actively registering, DO NOT redirect yet.
         // Let the register function finish writing to the DB and handle the redirect.
         if (isRegistering) {
             console.log("Registration in progress... waiting for DB write.");
             return;
         }

         // Otherwise, user is just normally logged in, so redirect.
         window.location.href = 'main.html';
      } else {
         initAuthPage(); 
      }
      return;
    }

    // 2. PROTECTED PAGES
    if (!firebaseUser) {
      window.location.href = 'index.html';
      return;
    }

    // 3. User is found, now get their data
    let doc = await db.collection('users').doc(firebaseUser.uid).get();
    
    // Auto-repair logic (This was running too early before)
    if (!doc.exists) {
       console.log("Account data missing. Auto-repairing...");
       try {
         const defaultData = {
            username: firebaseUser.email ? firebaseUser.email.split('@')[0] : "Agent",
            email: firebaseUser.email,
            score: 0,
            gamesPlayed: 0,
            progress: {},
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            photoURL: 'images/default-avatar.png',
            hasSeenWelcome: false,
            seenExplanations: {}
         };
         await db.collection('users').doc(firebaseUser.uid).set(defaultData);
         doc = await db.collection('users').doc(firebaseUser.uid).get();
       } catch (err) {
         console.error("Auto-repair failed:", err);
         alert("There is a problem with your account data. Please re-register.");
         auth.signOut();
         return;
       }
    }
    
    const fullUserData = { uid: firebaseUser.uid, ...doc.data() };

    if (page === 'main')        initMainPage(fullUserData);
    else if (page === 'game')   initGamePage(fullUserData);
    else if (page === 'leaderboard') initLeaderboardPage(fullUserData);
    else if (page === 'profile')     initProfilePage(fullUserData);
  });
});
/* ================================
   CYBER6014 GAME - GAME LOGIC
   ================================ */

// Global state for the current game attempt
let currentUserGlobal = null;
let currentCategory = null;
let currentDifficulty = null;
let currentAttemptQuestions = []; // array of 3 question objects
let currentQuestionIndex = 0;
let currentQuestionObj = null;
let currentAttemptCorrect = 0;
let attemptNumber = 1; // attempt count for the current level (used for retries)

/* ---------------- Game Page (new flow) ---------------- */


/** Prepares the UI: renders category buttons on the start screen. */
function renderCategories() {
  const container = $('#start-screen .category-grid');
  if (!container) return;

  // Use existing buttons from HTML (don’t recreate)
  const btns = container.querySelectorAll('.category-btn');
  if (!btns.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.category;
      if (!cat) return;
      openDifficultySelection(cat);
    });
  });
}


/** Shows difficulty buttons for the chosen category. */
function openDifficultySelection(category) {
  currentCategory = category;

  const startScreen   = $('#start-screen');
  const questionScreen = $('#question-screen');
  if (questionScreen) questionScreen.classList.add('hidden');
  if (startScreen)    startScreen.classList.remove('hidden');

  const catGrid   = $('#start-screen .category-grid');
  const diffBlock = $('#difficulty-section');
  const label     = $('#selected-category-label');

  $('#start-intro')?.classList.add('hidden');

  if (catGrid)   catGrid.classList.add('hidden');
  if (diffBlock) diffBlock.classList.remove('hidden');
  if (label) {
    label.textContent = `${category} — choose difficulty`;
    label.style.fontSize = "1.5rem"; // <--- Add this line
  }
  
  updateDifficultyButtons();
}

/** Locks/unlocks difficulty buttons based on saved progress. */
function updateDifficultyButtons() {
  const username = getCurrentUser();
  if (!username || !currentCategory) return;

  const progress = loadUserProgress(username); // from progress_manager.js
  const unlocked = progress[currentCategory] || ['easy']; // default at least easy

  const order = ['easy', 'medium', 'hard'];
  order.forEach(d => {
    const btn = document.querySelector(`.difficulty-btn[data-diff="${d}"]`);
    if (!btn) return;

    if (unlocked.includes(d) || d === 'easy') {
      btn.classList.remove('locked');
      btn.disabled = false;
      btn.style.filter = '';
    } else {
      btn.classList.add('locked');
      btn.disabled = true;
    }
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
    finalizeAttempt();
    return;
  }

  currentQuestionObj = currentAttemptQuestions[currentQuestionIndex];

  $('#current-question').textContent = currentQuestionObj.question_text;

  const answersArea = $('#answers-area');
  answersArea.innerHTML = '';

  const fb = $('#feedback-message');
  fb.textContent = '';
  fb.classList.remove('wrong');

  const opts = [...currentQuestionObj.options];
  shuffleInPlace(opts);

  opts.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.dataset.answer = opt;
    btn.textContent = opt;
    answersArea.appendChild(btn);
  });

  // Hide Next button until user answers
  $('#next-question-btn').classList.add('hidden');
}


/** Finalizes the attempt: checks pass/fail and shows feedback. */

function finalizeAttempt() {
  const success = currentAttemptCorrect >= 2; // pass if 2/3 correct
  const username = getCurrentUser();
  const fb = $('#feedback-message');

  // Hide any old popups if they exist
  $('#feedback-popup')?.classList.add('hidden');
  $('#incident-screen')?.classList.add('hidden');

  if (success) {
    // --- SUCCESS PATH ---
    
    // Determine next difficulty
    const order = ['easy', 'medium', 'hard'];
    const idx = order.indexOf(currentDifficulty);
    const next = (idx >= 0 && idx < order.length - 1) ? order[idx + 1] : null;

    // Unlock next difficulty in progress store
    if (next && username) {
      unlockDifficulty(username, currentCategory, next); // from progress_manager.js
    }

    // Nice success message
    if (fb) {
      fb.classList.remove('wrong');
      fb.style.color = ''; // Reset color
      fb.innerHTML = `Excellent! Next difficulty is unlocked`;
    }


  } else {
    // --- FAILURE PATH ---

    // 1. Show Red Text Feedback
    if (fb) {
      fb.classList.add('wrong');
      fb.style.color = 'red';
      fb.innerHTML = `You failed. Try again!`;
    }

    // 2. Show incident info
    $('#incident-screen')?.classList.remove('hidden');
    const t = $('#incident-title');
    const d = $('#incident-details');
    if (t) t.textContent = `Topic: ${currentQuestionObj?.incident_title || 'Incident'}`;
    if (d) d.innerHTML = `<p>${currentQuestionObj?.incident_details || ''}</p>`;
  }
}



/** Initializes the Game page (UI, sidebar, event listeners). */
/** Initializes the Game page (UI, sidebar, event listeners). */
function initGamePage(current) {
  const user = findUser(current);
  if (!user) {
    saveCurrentUser(null);
    window.location.href = 'index.html';
    return;
  }

  currentUserGlobal = current;
  setHeaderProfileImage(current);
  initHeader();

  // Sidebar info
  $('#current-username').textContent = user.username;
  $('#total-score').textContent = user.score || 0;

  const sidePic = $('#sidebar-profile-pic');
  if (sidePic) {
    const storedImg = localStorage.getItem(profileImgKey(current));
    sidePic.src = storedImg || DEFAULT_AVATAR;
  }

  // Render categories
  renderCategories();

  // ============================================
  //  2×2 ANSWERS CLICK HANDLER (NO AUTO NEXT)
  // ============================================
  const answersArea = $('#answers-area');
  const nextBtn = $('#next-question-btn');

  if (answersArea) {
    answersArea.addEventListener('click', (e) => {
      const btn = e.target.closest('.option-btn');
      if (!btn || !currentQuestionObj || btn.disabled) return;

      const correct = btn.dataset.answer === currentQuestionObj.correct_answer;

      // Disable all buttons
      $$('.option-btn').forEach(b => b.disabled = true);

      if (correct) {
        btn.classList.add('correct-answer');
        currentAttemptCorrect++;

        const newScore = updateUserScore(current, currentQuestionObj.points);
        $('#total-score').textContent = newScore;

        // --- FIX STARTS HERE ---
        const fb = $('#feedback-message');
        fb.style.color = '#00ff99';   // <--- Force the whole container to be Green
        fb.classList.remove('wrong'); // Remove error class if present
        
        // Now both lines will be green
        fb.innerHTML = `Correct! +${currentQuestionObj.points} points`; 
        // --- FIX ENDS HERE ---

      } else {
        btn.classList.add('wrong-answer');

        $('#feedback-message').innerHTML =
          `<span style="color:#ff4444;">Wrong answer!</span>`;
      }

      // SHOW NEXT BUTTON
      nextBtn.classList.remove('hidden');
    });
  }

  // ============================================
  //   NEXT QUESTION BUTTON
  // ============================================
  nextBtn?.addEventListener('click', () => {
    nextBtn.classList.add('hidden');
    $('#feedback-message').textContent = "";

    currentQuestionIndex++;
    displayCurrentQuestion();
  });

  // ============================================
  // POPUP ACTIONS (keep as-is)
  // ============================================
  $('#show-incident-btn')?.addEventListener('click', () => {
    if (!currentQuestionObj) return;
    $('#feedback-popup')?.classList.add('hidden');
    $('#incident-screen')?.classList.remove('hidden');
  });

  $('#show-article-btn')?.addEventListener('click', () => {
    if (currentQuestionObj?.article_link)
      window.open(currentQuestionObj.article_link, '_blank');
  });

  $('#continue-game-btn')?.addEventListener('click', () => {
    attemptNumber++;
    prepareAttemptQuestions();
    $('#feedback-popup')?.classList.add('hidden');
    $('#incident-screen')?.classList.add('hidden');
    displayCurrentQuestion();
  });

  $('#feedback-popup')?.classList.add('hidden');
  $('#incident-screen')?.classList.add('hidden');

  // ============================================
  // BACK BUTTONS
  // ============================================
  $('#back-btn')?.addEventListener('click', () => {
    $('#question-screen')?.classList.add('hidden');
    $('#start-screen')?.classList.remove('hidden');
    $('#start-screen .category-grid')?.classList.remove('hidden');
    $('#difficulty-section')?.classList.add('hidden');
  });

  $('#back-to-cats')?.addEventListener('click', () => {
    $('#start-screen .category-grid')?.classList.remove('hidden');
    $('#difficulty-section')?.classList.add('hidden');
    $('#start-intro')?.classList.remove('hidden');
    currentCategory = null;
  });

  // ============================================
  // DIFFICULTY BUTTONS
  // ============================================
  $$('.difficulty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('locked')) return;
      const diff = btn.dataset.diff;
      if (!diff || !currentCategory) return;
      startAttemptFor(currentCategory, diff);
    });
  });


function showDifficultySelector(category) {
    const diffSelector = document.getElementById("difficultySelector");
    diffSelector.classList.remove("hidden");

    const unlocked = loadUserProgress(currentUser)[category] || ["easy"];

    const btnEasy   = document.querySelector('.difficulty-easy');
    const btnMed    = document.querySelector('.difficulty-medium');
    const btnHard   = document.querySelector('.difficulty-hard');

    btnEasy.classList.remove("locked");
    btnMed.classList.toggle("locked", !unlocked.includes("medium"));
    btnHard.classList.toggle("locked", !unlocked.includes("hard"));
}


}
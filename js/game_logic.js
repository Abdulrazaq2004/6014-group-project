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
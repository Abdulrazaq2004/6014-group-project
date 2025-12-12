/* ================================
   CYBER6014 GAME - GAME LOGIC
   ================================ */

// Global state
let currentUserGlobal = null;
let currentCategory = null;
let currentDifficulty = null;
let currentAttemptQuestions = [];
let currentQuestionIndex = 0;
let currentQuestionObj = null;
let currentAttemptCorrect = 0;
let attemptNumber = 1; 

/* ---------------- Game Page ---------------- */





/** Initializes the Game page (UI, sidebar, event listeners). */
function initGamePage(current) {
  // Check if user exists, if not redirect
  if (!current || !current.uid) {
    window.location.href = 'index.html';
    return;
  }

  currentUserGlobal = current; // Store global reference
  
  // Update UI
  setHeaderProfileImage(current);
  initHeader(current);

  // Sidebar info
  const usernameEl = $('#current-username');
  const scoreEl    = $('#total-score');
  const sidePic    = $('#sidebar-profile-pic');

  if (usernameEl) usernameEl.textContent = current.username;
  if (scoreEl)    scoreEl.textContent = current.score || 0;
  if (sidePic)    sidePic.src = current.photoURL || DEFAULT_AVATAR;

  // Render categories
  renderCategories();
  setupGameEventListeners();
}

/* ---------------- Updated Game Logic ---------------- */

/** Prepares the UI: renders category buttons on the start screen. */
function renderCategories() {
  const container = $('#start-screen .category-grid');
  if (!container) return;

  const btns = container.querySelectorAll('.category-btn');
  
  // Clone logic to ensure clean event listeners if re-run
  btns.forEach(oldBtn => {
    const btn = oldBtn.cloneNode(true);
    oldBtn.parentNode.replaceChild(btn, oldBtn);

    btn.addEventListener('click', async () => {
      const cat = btn.dataset.category;
      if (!cat) return;

      // 1. Check/Show Explanation (Async wait)
      await checkAndShowExplanation(cat);

      // 2. Open Difficulty Selection (Only happens after explanation is dismissed)
      openDifficultySelection(cat);
    });
  });
}

/** * Checks if the user has seen the explanation for this category.
 * If not, shows the overlay and waits for the user to dismiss it.
 */
async function checkAndShowExplanation(category) {
  // Safety check
  if (!currentUserGlobal) return;

  // 1. Check local state
  const seenMap = currentUserGlobal.seenExplanations || {};
  if (seenMap[category] === true) {
    // Already seen, proceed immediately
    return;
  }

  // 2. Prepare the Overlay
  const overlay = $('#explanationOverlay');
  const img = $('#explanationImage');
  if (!overlay || !img) return;

  // Generate filename: "Phishing" -> "images/phishing-explain.png"
  // "Web Security" -> "images/web-security-explain.png"
  const filename = category.toLowerCase().replace(/ /g, '-') + '-explain.png';
  img.src = `images/${filename}`; 

  // 3. Show Overlay
  overlay.classList.remove('hidden-welcome');

  // 4. Return a Promise that resolves only when user clicks
  return new Promise((resolve) => {
    
    // Define the dismiss handler
    const handleDismiss = async () => {
      // Hide overlay
      overlay.classList.add('hidden-welcome');

      // Update Database
      await updateUserSeenExplanation(currentUserGlobal.uid, category);
      
      // Update Local State (so it doesn't show again this session)
      if (!currentUserGlobal.seenExplanations) currentUserGlobal.seenExplanations = {};
      currentUserGlobal.seenExplanations[category] = true;

      // Resolve the promise to let the game continue
      resolve();
    };

    // Attach listener (once)
    overlay.addEventListener('click', handleDismiss, { once: true });
  });
}

/** Shows difficulty buttons for the chosen category. */
function openDifficultySelection(category) {
  currentCategory = category;

  $('#start-screen').classList.remove('hidden');
  $('#question-screen').classList.add('hidden');
  $('#start-intro').classList.add('hidden');
  $('.category-grid').classList.add('hidden');
  
  const diffBlock = $('#difficulty-section');
  const label     = $('#selected-category-label');

  if (diffBlock) diffBlock.classList.remove('hidden');
  if (label) {
    label.textContent = `${category} — choose difficulty`;
    label.style.fontSize = "1.5rem"; 
  }
  
  updateDifficultyButtons();
}

/** Locks/unlocks difficulty buttons based on FIREBASE progress. */
function updateDifficultyButtons() {
  if (!currentUserGlobal || !currentCategory) return;

  // Get unlocked levels from the User Object (loaded from Firestore)
  // Structure: currentUserGlobal.progress = { "Phishing": ["easy", "medium"] }
  const userProgress = currentUserGlobal.progress || {};
  const unlocked = userProgress[currentCategory] || ['easy']; // Default 'easy' is always unlocked

  const order = ['easy', 'medium', 'hard'];
  
  order.forEach(d => {
    const btn = document.querySelector(`.difficulty-btn[data-diff="${d}"]`);
    if (!btn) return;

    // If unlocked OR it's easy (always unlocked)
    if (unlocked.includes(d) || d === 'easy') {
      btn.classList.remove('locked');
      btn.style.filter = '';
      btn.style.pointerEvents = 'auto';
    } else {
      btn.classList.add('locked');
      btn.style.pointerEvents = 'none';
    }
  });
}

/** Starts a 3-question attempt. */
function startAttemptFor(category, diff) {
  currentCategory = category;
  currentDifficulty = diff;
  attemptNumber = 1;
  prepareAttemptQuestions();
  showQuestionScreen();
}

/** Selects 3 random questions. */
function prepareAttemptQuestions() {
  const pool = (window.questions || []).filter(q => q.category === currentCategory && q.difficulty === currentDifficulty);
  if (!pool.length) {
        // Show the completion popup (Make sure you have this image in your folder)
        showExplanationPopup('images/working.png'); 
  }
  currentAttemptQuestions = sampleQuestions(pool, 3);
  currentQuestionIndex = 0;
  currentAttemptCorrect = 0;
}

/** Switches to question screen UI. */
function showQuestionScreen() {
  $('#current-category').textContent = currentCategory;
  $('#start-screen').classList.add('hidden');
  $('#question-screen').classList.remove('hidden');

  const label = $('#current-difficulty-label');
  if (label) label.textContent = `(${currentCategory} · ${currentDifficulty})`;

  $('#options-container')?.classList.remove('hidden');
  displayCurrentQuestion();
}

/** Renders current question. */
function displayCurrentQuestion() {
  if (!currentAttemptQuestions.length) return;

  if (currentQuestionIndex >= currentAttemptQuestions.length) {
    finalizeAttempt();
    return;
  }

  currentQuestionObj = currentAttemptQuestions[currentQuestionIndex];
  $('#current-question').textContent = currentQuestionObj.question_text;

  const answersArea = $('#answers-area');
  const imgBox = $('#question-image');
  answersArea.innerHTML = '';
  if (imgBox) imgBox.innerHTML = '';

  const fb = $('#feedback-message');
  fb.textContent = '';
  fb.classList.remove('wrong');
  $('#next-question-btn').classList.add('hidden');

  /* 🖼️ Image-Single Question (one image, unclickable) */
  if (currentQuestionObj.question_type === 'image-single' && currentQuestionObj.image) {
    const img = document.createElement('img');
    img.src = currentQuestionObj.image;
    img.alt = 'Question image';
    img.className = 'main-question-image';
    img.draggable = false;
    if (imgBox) imgBox.appendChild(img);
  }

  

  /* 🔢 Ordering type */
  if (currentQuestionObj.question_type === 'ordering') {
    const opts = [...currentQuestionObj.options];
    let order = [];

    opts.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.textContent = opt;

      btn.addEventListener('click', () => {
        if (!order.includes(opt)) {
          order.push(opt);
          btn.textContent = `${order.length}. ${opt}`;
          btn.disabled = true;
        }

        if (order.length === opts.length) {
  const correct = JSON.stringify(order) === JSON.stringify(currentQuestionObj.correct_order);
  showAnswerFeedback(correct, fb);

  if (correct) {
    currentAttemptCorrect++;

    // ✅ Update Firebase score
    updateUserScore(currentUserGlobal.uid, currentQuestionObj.points)
      .then(newScore => {
        $('#total-score').textContent = newScore;
        currentUserGlobal.score = newScore;
        fb.style.color = '#00ff99';
        fb.textContent = `Correct order! +${currentQuestionObj.points} points`;
      })
      .catch(err => console.error('Score update failed:', err));
  } else {
    fb.style.color = 'red';
    fb.textContent = 'Incorrect order!';
  }

  $('#next-question-btn').classList.remove('hidden');
}

      });

      answersArea.appendChild(btn);
    });
    return;
  }


  
  /* 🧩 Default / Multiple choice */
  const opts = [...currentQuestionObj.options];
  shuffleInPlace(opts);

  opts.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.dataset.answer = opt;
    btn.textContent = opt;

    btn.addEventListener('click', async () => {
      disableAllButtons();
      const correct = opt === currentQuestionObj.correct_answer;
      if (correct) {
        btn.classList.add('correct-answer');
        currentAttemptCorrect++;
        const newScore = await updateUserScore(currentUserGlobal.uid, currentQuestionObj.points);
        $('#total-score').textContent = newScore;
        currentUserGlobal.score = newScore;
        fb.style.color = '#00ff99';
        fb.textContent = `Correct! +${currentQuestionObj.points} points`;
      } else {
        btn.classList.add('wrong-answer');
        fb.style.color = 'red';
        fb.textContent = 'Wrong answer!';
      }
      $('#next-question-btn').classList.remove('hidden');
    });

    answersArea.appendChild(btn);
  });
}


function handleAnswer(btn, selected) {
  const fb = $('#feedback-message');
  disableAllButtons();

  const correct = selected === currentQuestionObj.correct_answer;
  if (correct) {
    btn.classList.add('correct-answer');
    currentAttemptCorrect++;
    fb.style.color = '#00ff99';
    fb.textContent = `Correct! +${currentQuestionObj.points} points`;
    updateUserScore(currentUserGlobal.uid, currentQuestionObj.points);
  } else {
    btn.classList.add('wrong-answer');
    fb.style.color = 'red';
    fb.textContent = 'Wrong answer!';
  }

  $('#next-question-btn').classList.remove('hidden');
}

function showAnswerFeedback(correct, fbElement) {
  if (correct) {
    fbElement.textContent = "✅ Correct!";
    fbElement.classList.remove("wrong");

    // ✅ Only show popup if explanation_image exists for this question
    if (currentQuestionObj && currentQuestionObj.explanation_image) {
      const overlay = document.createElement("div");
      overlay.className = "feedback-overlay";

      const img = document.createElement("img");
      img.src = currentQuestionObj.explanation_image;
      img.alt = "Explanation";
      img.className = "feedback-image";

      overlay.appendChild(img);
      document.body.appendChild(overlay);

      // Clicking anywhere closes the popup
      overlay.addEventListener("click", () => {
        overlay.classList.add("fade-out");
        setTimeout(() => overlay.remove(), 300);
      });
    }

  } else {
    fbElement.textContent = "❌ Wrong!";
    fbElement.classList.add("wrong");
  }
}




/* */
/**
 * Shows a full-screen popup with the explanation image.
 */
function showExplanationPopup(imageSrc) {
  // Create the overlay container
  const overlay = document.createElement("div");
  overlay.className = "feedback-overlay";

  // Create the content wrapper
  const content = document.createElement("div");
  content.className = "feedback-content";

  // Create the image
  const img = document.createElement("img");
  img.src = imageSrc;
  img.alt = "Explanation";
  img.className = "feedback-image";

  // Create helper text
  const text = document.createElement("p");
  text.className = "tap-to-close";
  text.textContent = "Tap anywhere to continue";

  // Assemble
  content.appendChild(img);
  content.appendChild(text);
  overlay.appendChild(content);
  document.body.appendChild(overlay);

  // Close on click
  overlay.addEventListener("click", () => {
    overlay.style.opacity = '0';
    setTimeout(() => {
        if(document.body.contains(overlay)) {
            document.body.removeChild(overlay);
        }
    }, 300);
  });
}





/** Finalizes the attempt: checks pass/fail, saves to Firebase. */
async function finalizeAttempt() {
  const success = currentAttemptCorrect >= 2;
  const fb = $('#feedback-message');

  if (currentUserGlobal) {
    await incrementUserGamesPlayed(currentUserGlobal.uid);
  }

  if (success) {
    const order = ['easy', 'medium', 'hard'];
    const idx = order.indexOf(currentDifficulty);
    const next = (idx >= 0 && idx < order.length - 1) ? order[idx + 1] : null;

    if (next && currentUserGlobal) {
      await unlockDifficultyInFirebase(currentUserGlobal, currentCategory, next);

      // Update progress in memory
      if (!currentUserGlobal.progress) currentUserGlobal.progress = {};
      if (!currentUserGlobal.progress[currentCategory]) currentUserGlobal.progress[currentCategory] = [];
      if (!currentUserGlobal.progress[currentCategory].includes(next)) {
        currentUserGlobal.progress[currentCategory].push(next);
      }

      updateDifficultyButtons();
    }

    fb.classList.remove('wrong');
    fb.style.color = '#00ff99';
    fb.innerHTML = `Excellent! ${next ? 'Next difficulty unlocked.' : 'Category Completed!'}`;

    // 🔥 NEW CODE: Check if Hard level is done
    if (currentDifficulty === 'hard') {
        // Show the completion popup (Make sure you have this image in your folder)
        showExplanationPopup('images/completed.png'); 
    }

  } else {
    fb.classList.add('wrong');
    fb.style.color = 'red';
    fb.innerHTML = `You failed. Try again!`;
  }
}


/** Sets up event listeners (Runs once). */
function setupGameEventListeners() {
  const answersArea = $('#answers-area');
  const nextBtn = $('#next-question-btn');

  // Answer Clicks
  if (answersArea) {
    // Remove old listeners to prevent duplicates (clone trick)
    const newArea = answersArea.cloneNode(false);
    answersArea.parentNode.replaceChild(newArea, answersArea);
    
    newArea.addEventListener('click', async (e) => {
      const btn = e.target.closest('.option-btn');
      if (!btn || !currentQuestionObj || btn.disabled) return;

      const correct = btn.dataset.answer === currentQuestionObj.correct_answer;

      // Disable buttons
      $$('.option-btn').forEach(b => b.disabled = true);

      if (correct) {
        btn.classList.add('correct-answer');
        currentAttemptCorrect++;

        // Update Score in Firebase
        const newScore = await updateUserScore(currentUserGlobal.uid, currentQuestionObj.points);
        
        // Update UI Score immediately
        $('#total-score').textContent = newScore;
        currentUserGlobal.score = newScore; 

        $('#feedback-message').style.color = '#00ff99';
        $('#feedback-message').innerHTML = `Correct! +${currentQuestionObj.points} points`; 

        // 🔥 NEW CODE: Show Explanation Popup if image exists
        if (currentQuestionObj.explanation_image) {
            showExplanationPopup(currentQuestionObj.explanation_image);
        }

      } else {
        btn.classList.add('wrong-answer');
        $('#feedback-message').innerHTML = `<span style="color:#ff4444;">Wrong answer!</span>`;
      }

      $('#next-question-btn').classList.remove('hidden');
    });
  }

  // Next Button
  if (nextBtn) {
    const newNext = nextBtn.cloneNode(true);
    nextBtn.parentNode.replaceChild(newNext, nextBtn);
    
    newNext.addEventListener('click', () => {
      newNext.classList.add('hidden');
      $('#feedback-message').textContent = "";
      currentQuestionIndex++;
      displayCurrentQuestion();
    });
  }

  // Back Buttons
  $('#back-btn')?.addEventListener('click', () => {
    $('#question-screen').classList.add('hidden');
    $('#start-screen').classList.remove('hidden');
    $('.category-grid').classList.add('hidden');
    $('#difficulty-section').classList.remove('hidden');
  });

  $('#back-to-cats')?.addEventListener('click', () => {
    $('.category-grid').classList.remove('hidden');
    $('#difficulty-section').classList.add('hidden');
    $('#start-intro').classList.remove('hidden');
    currentCategory = null;
  });

  // Difficulty Buttons logic
  $$('.difficulty-btn').forEach(btn => {
    // Remove old listeners
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);

    newBtn.addEventListener('click', () => {
      if (newBtn.classList.contains('locked')) return;
      const diff = newBtn.dataset.diff;
      if (!diff || !currentCategory) return;
      startAttemptFor(currentCategory, diff);
    });
  });
}
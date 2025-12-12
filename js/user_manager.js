/* ================================
   CYBER6014 GAME - USER MANAGER (FIREBASE)
   ================================ */

/** Checks if a username is already taken in Firestore. */
async function isUsernameTaken(username) {
  const snapshot = await db.collection('users')
    .where('username', '==', username)
    .get();
  return !snapshot.empty;
}

/** Registers a new user with Email, Username, and Password. */
async function registerUser(email, username, password) {
  try {
    // ✅ تحقق من قوة الباسوورد (على حسب السياسة المطلوبة)
    const passwordIsValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(password);
    if (!passwordIsValid) {
      throw new Error("Password must contain at least one uppercase letter, one lowercase letter, and one number.");
    }

    // 1. Check if username is unique
    const taken = await isUsernameTaken(username);
    if (taken) {
      throw new Error("Username already exists. Please choose another.");
    }

    // 2. Create Auth User
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // 3. Create User Document in Firestore
    await db.collection('users').doc(user.uid).set({
      username: username,
      email: email,
      score: 0,
      gamesPlayed: 0,
      progress: {},
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      photoURL: DEFAULT_AVATAR,
      hasSeenWelcome: false,
      seenExplanations: {}
    });

    return { success: true, user: user };
  } catch (error) {
    console.error("Registration Error:", error);
    let msg = error.message;
    if (error.code === 'auth/email-already-in-use') msg = "Email is already registered.";
    return { success: false, message: msg };
  }
}


/** Logs in a user using Email OR Username. */
async function loginUser(loginInput, password) {
  let emailToUse = loginInput;

  try {
    // 1. Check if input is NOT an email (assume it's a username)
    if (!loginInput.includes('@')) {
      const snapshot = await db.collection('users')
        .where('username', '==', loginInput)
        .limit(1)
        .get();

      if (snapshot.empty) {
        throw new Error("Username not found.");
      }
      emailToUse = snapshot.docs[0].data().email;
    }

    // 2. Sign in
    const userCredential = await auth.signInWithEmailAndPassword(emailToUse, password);
    return { success: true, user: userCredential.user };

  } catch (error) {
    console.error("Login Error:", error);
    return { success: false, message: error.message };
  }
}

/** Sends a password reset email. */
async function resetUserPassword(email) {
  try {
    await auth.sendPasswordResetEmail(email);
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

/** Updates the score for a specific user in Firestore. */
async function updateUserScore(uid, pts) {
  if (!uid) return;
  const userRef = db.collection('users').doc(uid);

  try {
    // Use transaction to ensure accuracy
    let newTotal = 0;
    await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(userRef);
      if (!doc.exists) return;
      const currentScore = doc.data().score || 0;
      newTotal = currentScore + pts;
      transaction.update(userRef, { score: newTotal });
    });
    return newTotal; // Return the new score to update UI
  } catch (e) { 
    console.error("Score Update Error:", e); 
    return 0;
  }
}

/** Increments the 'gamesPlayed' counter. */
async function incrementUserGamesPlayed(uid) {
  if (!uid) return;
  try {
    await db.collection('users').doc(uid).update({
      gamesPlayed: firebase.firestore.FieldValue.increment(1)
    });
  } catch (e) { console.error("Games Played Update Error:", e); }
}

/** Uploads profile image to Firebase Storage. */
async function uploadUserProfileImage(uid, file) {
  if (!uid || !file) return null;
  try {
    const storageRef = storage.ref().child(`profile_images/${uid}`);
    await storageRef.put(file);
    const downloadURL = await storageRef.getDownloadURL();
    
    await db.collection('users').doc(uid).update({ photoURL: downloadURL });
    return downloadURL;
  } catch (error) {
    console.error("Image Upload Error:", error);
    return null;
  }
}

/** Gets leaderboard data (Top 50). */
async function getLeaderboardData() {
  try {
    const snapshot = await db.collection('users')
      .orderBy('score', 'desc')
      .limit(50)
      .get();
    return snapshot.docs.map(doc => doc.data());
  } catch (error) { return []; }
}

/** Calculates rank (approximate). */
async function getUserRank(uid) {
  try {
    const snapshot = await db.collection('users').orderBy('score', 'desc').get();
    const index = snapshot.docs.findIndex(doc => doc.id === uid);
    return index !== -1 ? `#${index + 1}` : '#--';
  } catch (error) { return '#--'; }
}

/* ===============================
   CYBER6014 GAME - USER MANAGER (FIREBASE)
   (Add these two new functions)
   ================================ */

// ... (existing functions)

/** Updates the user's hasSeenWelcome flag to true. */
async function updateUserHasSeenWelcome(uid) {
  if (!uid) return;
  try {
    await db.collection('users').doc(uid).update({
      hasSeenWelcome: true
    });
  } catch (e) { console.error("Welcome Flag Update Error:", e); }
}

/** Updates the user's seenExplanations for a given category. */
async function updateUserSeenExplanation(uid, category) {
  if (!uid || !category) return;
  try {
    // Use Firebase dot notation to set the specific field within the map
    await db.collection('users').doc(uid).update({
      [`seenExplanations.${category}`]: true
    });
  } catch (e) { console.error("Explanation Flag Update Error:", e); }
}


/** * Updates the 'seenExplanations' map in Firestore for a specific category.
 * Example: users/UID -> seenExplanations: { "Phishing": true }
 */
async function updateUserSeenExplanation(uid, category) {
  if (!uid || !category) return;

  try {
    // We use bracket notation to update a specific key inside the map
    await db.collection('users').doc(uid).update({
      [`seenExplanations.${category}`]: true
    });
  } catch (e) {
    console.error("Error updating explanation flag:", e);
  }
}
/* ================================
   CYBER6014 GAME - PROGRESS MANAGER (FIREBASE)
   ================================ */

/* NOTE: Progress is now stored inside the user's document in Firestore
   under the field 'progress'. 
   Structure: { "Phishing": ["easy", "medium"], "Social media": ["easy"] }
*/

/** * Unlocks a specific difficulty for a category in Firestore.
 * Also updates the local object so the UI refreshes instantly.
 */
async function unlockDifficultyInFirebase(currentUser, category, difficulty) {
  if (!currentUser || !currentUser.uid) return;

  const uid = currentUser.uid;
  
  // 1. Get current progress or init empty
  let currentProgress = currentUser.progress || {};
  
  // 2. Get array for this category or init empty
  let catProgress = currentProgress[category] || [];

  // 3. If already unlocked, do nothing
  if (catProgress.includes(difficulty)) {
    return;
  }

  // 4. Add new difficulty
  catProgress.push(difficulty);
  
  // 5. Update local object (for immediate UI update)
  if (!currentUser.progress) currentUser.progress = {};
  currentUser.progress[category] = catProgress;

  // 6. Update Firestore
  // We use dot notation "progress.CategoryName" to update just that field
  try {
    await db.collection('users').doc(uid).update({
      [`progress.${category}`]: catProgress
    });
    console.log(`Unlocked ${difficulty} for ${category}`);
  } catch (e) {
    console.error("Error unlocking difficulty:", e);
  }
}
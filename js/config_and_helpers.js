/* */
/* ================================
   CYBER6014 GAME - CONFIG & HELPERS
   ================================ */

/* ---------------- FIREBASE CONFIG ---------------- */
const firebaseConfig = {
  apiKey: "AIzaSyD6rYPLg_6UQ4woExTZGDRV85rqJQyJl2w",
  authDomain: "cyber6014.firebaseapp.com",
  projectId: "cyber6014",
  storageBucket: "cyber6014.firebasestorage.app",
  messagingSenderId: "265199882516",
  appId: "1:265199882516:web:d0890f6fb473e1d8e03201",
  measurementId: "G-Y42C8T50BW"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

/* ---------------- Constants ---------------- */
const DEFAULT_AVATAR = 'images/default-avatar.png';

/** Simple DOM Selectors */
const $  = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

/** Shuffles an array in place */
function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

/** Picks N random questions */
function sampleQuestions(pool, n) {
  const copy = pool.slice();
  shuffleInPlace(copy);
  return copy.slice(0, Math.min(n, copy.length));
}

/** Extracts all unique categories */
function getAllCategoriesFromQuestions() {
  if (!Array.isArray(window.questions)) return [];
  const cats = new Set();
  window.questions.forEach(q => { if (q.category) cats.add(q.category); });
  return Array.from(cats);
}
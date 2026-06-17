import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, type User } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';

// Get config from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Check if Firebase config is available
const isFirebaseConfigured = Object.values(firebaseConfig).every(val => val);

let app: any;
let auth: any;
let db: any;

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

export { auth, db, isFirebaseConfigured };

export async function initializeFirebase() {
  if (!isFirebaseConfigured) {
    console.warn('Firebase not configured. Set environment variables to enable cloud sync.');
    return null;
  }

  try {
    // Sign in anonymously if not already signed in
    if (!auth.currentUser) {
      await signInAnonymously(auth);
    }
    return auth.currentUser;
  } catch (error) {
    console.error('Firebase initialization error:', error);
    return null;
  }
}

export function onAuthChange(callback: (user: User | null) => void) {
  if (!isFirebaseConfigured) return () => {};
  return onAuthStateChanged(auth, callback);
}

export async function saveProgressToFirestore(userId: string, data: any) {
  if (!isFirebaseConfigured || !db) return;

  try {
    await setDoc(doc(db, 'progress', userId), {
      topicProgress: data.topicProgress,
      questionAttempts: data.questionAttempts,
      drillResults: data.drillResults,
      examResults: data.examResults,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error saving progress:', error);
  }
}

export async function loadProgressFromFirestore(userId: string) {
  if (!isFirebaseConfigured || !db) return null;

  try {
    const docSnap = await getDoc(doc(db, 'progress', userId));
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    console.error('Error loading progress:', error);
    return null;
  }
}

export function onProgressChange(userId: string, callback: (data: any) => void) {
  if (!isFirebaseConfigured || !db) return () => {};

  return onSnapshot(doc(db, 'progress', userId), (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    }
  });
}

export async function saveCustomQuestionsToFirestore(userId: string, questions: any[]) {
  if (!isFirebaseConfigured || !db) return;

  try {
    await setDoc(doc(db, 'customQuestions', userId), {
      questions,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error saving custom questions:', error);
  }
}

export async function loadCustomQuestionsFromFirestore(userId: string) {
  if (!isFirebaseConfigured || !db) return null;

  try {
    const docSnap = await getDoc(doc(db, 'customQuestions', userId));
    return docSnap.exists() ? docSnap.data()?.questions : null;
  } catch (error) {
    console.error('Error loading custom questions:', error);
    return null;
  }
}

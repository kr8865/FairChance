import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoKeyForFairwayForwardGoogleAuth",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "fairway-forward-demo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "fairway-forward-demo",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "fairway-forward-demo.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "100000000000",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:100000000000:web:abcdef1234567890",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export async function signInWithGooglePopup() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const idToken = await user.getIdToken();
    return {
      user: {
        email: user.email,
        firstName: user.displayName?.split(' ')[0] || 'Golf',
        lastName: user.displayName?.split(' ').slice(1).join(' ') || 'Player',
        avatarUrl: user.photoURL,
        uid: user.uid,
      },
      idToken,
    };
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw new Error(error.message || 'Google Sign-In failed');
  }
}

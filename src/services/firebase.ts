import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  GithubAuthProvider, 
  signInWithRedirect, 
  signOut, 
  onAuthStateChanged, 
  getRedirectResult, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";
import { getFirestore, collection, doc, setDoc, getDoc, updateDoc, onSnapshot, query, where, orderBy } from "firebase/firestore";

// Import the Firebase configuration
import firebaseConfig from '../../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export { app };
export const auth = getAuth(app);

// Enable persistence - keeps user logged in across refresh
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Failed to set persistence:", error);
});

export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const githubProvider = new GithubAuthProvider();

export const signInWithGitHub = async () => {
  try {
    await signInWithRedirect(auth, githubProvider);
  } catch (error) {
    console.error("Error signing in with GitHub", error);
    throw error;
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error("Error signing in with email", error);
    throw error;
  }
};

export const registerWithEmail = async (email: string, password: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error("Error registering with email", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
    throw error;
  }
};

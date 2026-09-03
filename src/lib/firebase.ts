
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBNwmT3Iu4-Z17GHeJ8GidrJe3AN6Yidt8",
  authDomain: "oktopus-app-e16ad.firebaseapp.com",
  projectId: "oktopus-app-e16ad",
  storageBucket: "oktopus-app-e16ad.firebasestorage.app",
  messagingSenderId: "605248451744",
  appId: "1:605248451744:web:c002733263973c656e05c5",
  measurementId: "G-YDN2D68LJX"
};

// Initialize Firebase safely
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

let authInstance: Auth;
try {
  authInstance = getAuth(app);
} catch (e) {
  console.warn("Failed to getAuth(app):", e);
  authInstance = null as unknown as Auth;
}

export const auth = authInstance;
export { app };


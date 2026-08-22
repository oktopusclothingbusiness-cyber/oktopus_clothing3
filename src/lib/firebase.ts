
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBNwmT3Iu4-Z17GHeJ8GidrJe3AN6Yidt8",
  authDomain: "oktopus-app-e16ad.firebaseapp.com",
  projectId: "oktopus-app-e16ad",
  storageBucket: "oktopus-app-e16ad.firebasestorage.app",
  messagingSenderId: "605248451744",
  appId: "1:605248451744:web:c002733263973c656e05c5",
  measurementId: "G-YDN2D68LJX"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };


import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  "projectId": "personaverse-bhx1q",
  "appId": "1:481706654131:web:b826f918e66a9310dd33c6",
  "storageBucket": "personaverse-bhx1q.firebasestorage.app",
  "apiKey": "AIzaSyClJshM8w8qznHs2l2wZtGONNiLGwnNFQc",
  "authDomain": "personaverse-bhx1q.firebaseapp.com",
  "messagingSenderId": "481706654131"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };

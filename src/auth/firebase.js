import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyADIfO9MyeV0-QePXPg4PWTn0_JeuH3_mU",
  authDomain: "nanzan-home.firebaseapp.com",
  projectId: "nanzan-home",
  storageBucket: "nanzan-home.firebasestorage.app",
  messagingSenderId: "19657265870",
  appId: "1:19657265870:web:da9a6372f644bff25fb69f",
  measurementId: "G-9BV2543QVK",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

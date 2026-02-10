
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAYuNZMUxru8owCnz6kglTx8teT_X5R2hw",
  authDomain: "infra-management-3917802-4cc51.firebaseapp.com",
  projectId: "infra-management-3917802-4cc51",
  storageBucket: "infra-management-3917802-4cc51.firebasestorage.app",
  messagingSenderId: "294260885413",
  appId: "1:294260885413:web:937ffcfc8eded06db10a4c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a Firestore instance
export const db = getFirestore(app);

// Get an Auth instance
export const auth = getAuth(app);

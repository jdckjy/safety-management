
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyAUTOe5pSNVuoMzar7kvxKnPXCSK57yf8o",
  authDomain: "safety-management-233137-77a49.firebaseapp.com",
  projectId: "safety-management-233137-77a49",
  storageBucket: "safety-management-233137-77a49.firebasestorage.app",
  messagingSenderId: "103752595169",
  appId: "1:103752595169:web:093d773ade73b21d3c29a0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

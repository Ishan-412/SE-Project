// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB9oE12p56eXB5-jc-qeR5jzTEf6HK8U3Y",
  authDomain: "agentic-ai-58b57.firebaseapp.com",
  projectId: "agentic-ai-58b57",
  storageBucket: "agentic-ai-58b57.firebasestorage.app",
  messagingSenderId: "1065580347412",
  appId: "1:1065580347412:web:dc2d565376ff7fdc27a701",
  measurementId: "G-YH3CW0BWTW",
};

// Initialize
const app = initializeApp(firebaseConfig);

// Services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Cloud Functions (GEN-2) — region mus

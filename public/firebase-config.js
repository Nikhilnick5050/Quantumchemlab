// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore, Timestamp } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBwP3B1Y5Zk4XxKjzApBOHiywHtcRxSbB4",
  authDomain: "quantumchem-f8db7.firebaseapp.com",
  projectId: "quantumchem-f8db7",
  storageBucket: "quantumchem-f8db7.firebasestorage.app",
  messagingSenderId: "393952510354",
  appId: "1:393952510354:web:064c15a98a7eb4caaa814b",
  measurementId: "G-H7MG7G03XR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Export Firebase services
export { app, analytics, auth, db, Timestamp };
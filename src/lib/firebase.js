// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v9-compat and v9
const firebaseConfig = {
  apiKey: "AIzaSyCbDL3qlE_9dyvr-p9HLbomNBFyocpkmTI",
  authDomain: "manimation-3eb0d.firebaseapp.com",
  projectId: "manimation-3eb0d",
  storageBucket: "manimation-3eb0d.firebasestorage.app",
  messagingSenderId: "58939220394",
  appId: "1:58939220394:web:1ccb37a0ed63e33613cbd3",
};

// Debug: Log configuration (remove in production)
console.log("Firebase Config:", {
  apiKey: firebaseConfig.apiKey ? "✓ Set" : "✗ Missing",
  authDomain: firebaseConfig.authDomain ? "✓ Set" : "✗ Missing",
  projectId: firebaseConfig.projectId ? "✓ Set" : "✗ Missing",
  storageBucket: firebaseConfig.storageBucket ? "✓ Set" : "✗ Missing",
  messagingSenderId: firebaseConfig.messagingSenderId ? "✓ Set" : "✗ Missing",
  appId: firebaseConfig.appId ? "✓ Set" : "✗ Missing",
});

// Check if all required config values are present
const requiredConfig = ["apiKey", "authDomain", "projectId", "appId"];
const missingConfig = requiredConfig.filter((key) => !firebaseConfig[key]);

if (missingConfig.length > 0) {
  throw new Error(
    `Missing Firebase configuration: ${missingConfig.join(", ")}`
  );
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

export default app;

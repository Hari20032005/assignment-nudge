
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Firebase configuration (these are safe to be in the client)
const firebaseConfig = {
  apiKey: "AIzaSyBjR32GrJfI_X8Jlw2Vg1lQlpVwzYJdY0M",
  authDomain: "vit-assignment-reminder.firebaseapp.com",
  projectId: "vit-assignment-reminder",
  storageBucket: "vit-assignment-reminder.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:1234567890123456789012"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };

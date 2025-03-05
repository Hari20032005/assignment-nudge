
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Firebase configuration (these are safe to be in the client)
const firebaseConfig = {
  apiKey: "AIzaSyDKNh2PEggT0WShf-6jR4r8yHhdNnmYal4",
  authDomain: "assignmentreminder-2b89c.firebaseapp.com",
  projectId: "assignmentreminder-2b89c",
  storageBucket: "assignmentreminder-2b89c.firebasestorage.app",
  messagingSenderId: "335538143563",
  appId: "1:335538143563:web:976d7b8f6a8ba00f3ea8ce"
};



// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };

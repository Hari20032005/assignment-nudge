
// We're no longer using Firebase for authentication
// This file is kept as a placeholder in case we need Firebase for other features in the future
import { initializeApp } from "firebase/app";

// Firebase configuration (these are safe to be in the client)
const firebaseConfig = {
  apiKey: "AIzaSyDKNh2PEggT0WShf-6jR4r8yHhdNnmYal4",
  authDomain: "assignmentreminder-2b89c.firebaseapp.com",
  projectId: "assignmentreminder-2b89c",
  storageBucket: "assignmentreminder-2b89c.appspot.com",
  messagingSenderId: "335538143563",
  appId: "1:335538143563:web:976d7b8f6a8ba00f3ea8ce"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export { app };

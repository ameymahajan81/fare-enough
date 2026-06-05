import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBLWhOC4JDy_5feDtjGrqNRsJVVWFVUSyQ",
  authDomain: "wheelsforyou-42fe0.firebaseapp.com",
  projectId: "wheelsforyou-42fe0",
  storageBucket: "wheelsforyou-42fe0.firebasestorage.app",
  messagingSenderId: "392152711794",
  appId: "1:392152711794:web:2c6f97707e116a070678eb",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
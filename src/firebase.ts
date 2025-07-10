import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// You'll need to replace this with your actual Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyC5KpiJ5NZ6eOxOT2yIpLhylr1xpi3gCnI",
    authDomain: "hsk1-flashcards.firebaseapp.com",
    projectId: "hsk1-flashcards",
    storageBucket: "hsk1-flashcards.firebasestorage.app",
    messagingSenderId: "956281079231",
    appId: "1:956281079231:web:8477ea554dbd5a82b74d0a",
    measurementId: "G-PCL3J06LZ7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;

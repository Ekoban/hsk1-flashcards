import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC5KpiJ5NZ6eOxOT2yIpLhylr1xpi3gCnI",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "hsk1-flashcards.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "hsk1-flashcards",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "hsk1-flashcards.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "956281079231",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:956281079231:web:8477ea554dbd5a82b74d0a",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-PCL3J06LZ7"
};

// Debug: Log environment variables in development
if (import.meta.env.DEV) {
    console.log('Firebase Config:', {
        apiKey: firebaseConfig.apiKey?.substring(0, 10) + '...',
        authDomain: firebaseConfig.authDomain,
        projectId: firebaseConfig.projectId,
        environmentVariables: {
            VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY ? '✓ Set' : '✗ Missing',
            VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? '✓ Set' : '✗ Missing',
            VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID ? '✓ Set' : '✗ Missing',
        }
    });
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;

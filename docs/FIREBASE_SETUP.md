# Firebase Setup Instructions

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `hsk1-flashcards` (or your preferred name)
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Google" sign-in provider:
   - Click on "Google"
   - Toggle "Enable"
   - Add your email as a test user
   - Save

## Step 3: Enable Firestore Database

1. Go to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select your preferred location
5. Click "Done"

## Step 4: Get Your Firebase Configuration

1. Go to Project Settings (gear icon next to "Project Overview")
2. Scroll down to "Your apps"
3. Click the web icon (`</>`) to add a web app
4. Register your app with a name (e.g., "HSK1 Flashcards")
5. Copy the Firebase configuration object

## Step 5: Update Your App

1. Open `src/firebase.ts`
2. Replace the placeholder configuration with your actual Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-actual-sender-id",
  appId: "your-actual-app-id"
};
```

## Step 6: Test Your App

1. Start your development server: `npm run dev`
2. Try signing in with Google
3. Your progress should now sync to the cloud!

## Security Rules (Production)

When ready for production, update Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /userProgress/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /userSettings/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Costs

- **Free tier includes:**
  - 50,000 document reads/day
  - 20,000 document writes/day
  - 10,000 auth users
  - 1GB storage

This is more than enough for 5 users and even moderate usage by 100+ users!

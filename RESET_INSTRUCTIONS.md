# Firebase Console Commands to Reset User Data

## Option A: Using Firebase CLI (Recommended)

### 1. Install Firebase CLI (if not already installed)
npm install -g firebase-tools

### 2. Login to Firebase
firebase login

### 3. Set your project
firebase use hsk1-flashcards

### 4. Delete all user progress data
firebase firestore:delete --all-collections userProgress --yes

### 5. Delete all user settings data  
firebase firestore:delete --all-collections userSettings --yes

### 6. (Optional) Add reset timestamp to user profiles
# This requires a custom script since CLI doesn't support updates


## Option B: Using Firebase Console Web Interface

### 1. Go to Firebase Console
https://console.firebase.google.com/project/hsk1-flashcards/firestore

### 2. Delete userProgress collection
- Click on "userProgress" collection
- Select all documents (click checkbox at top)
- Click "Delete" button
- Confirm deletion

### 3. Delete userSettings collection  
- Click on "userSettings" collection
- Select all documents (click checkbox at top)
- Click "Delete" button
- Confirm deletion

### 4. Users collection (keep intact)
- The "users" collection contains login info and profiles
- DO NOT delete this collection
- Users will keep their accounts but lose all progress


## What happens after reset:

✅ User accounts remain intact - users can still log in
✅ All learning progress is reset to zero 
✅ All session settings revert to defaults
✅ Users start fresh with all 2,219 words as "new"
✅ Guest users are unaffected (they use localStorage)

⚠️ This action cannot be undone!
⚠️ All users will lose their learning streaks, progress, and custom settings

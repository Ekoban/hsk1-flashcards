# 🔐 SECURITY NOTICE

## Firebase Configuration

### ✅ Safe to Commit
- `src/firebase.ts` - Contains Firebase client configuration
- Firebase client API keys are **safe to expose publicly**
- They identify your project but don't grant database access without proper Firestore security rules

### ❌ Never Commit
- `.env` files with sensitive data
- `*serviceAccountKey*.json` files (Firebase Admin SDK keys)
- `firebase-adminsdk-*.json` files
- Any files containing private keys or secrets

## Reset Scripts Security

### `reset-user-data.js` (Admin SDK)
- Requires a Firebase service account key (not included in repo)
- Download from Firebase Console > Project Settings > Service Accounts
- Save as `serviceAccountKey.json` (gitignored)
- **NEVER commit service account keys to version control**

### `quick-reset.js` (Firebase CLI)
- Uses Firebase CLI authentication
- No sensitive files needed
- Safer option for regular use

## Environment Variables

Use `.env.local` for local development:
```bash
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
VITE_FIREBASE_PROJECT_ID=your_project_id_here
# ... etc
```

## Firestore Security

Database access is controlled by Firestore security rules in `firestore.rules`, not by hiding API keys.

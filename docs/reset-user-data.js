/**
 * Firebase Admin Script to Reset All User Data
 * 
 * This script will:
 * 1. Delete all user progress data (userProgress collection)
 * 2. Reset all user settings to defaults (userSettings collection)
 * 3. Keep user accounts and profiles intact (users collection)
 * 
 * IMPORTANT: This action cannot be undone!
 * 
 * To run this script:
 * 1. Install Firebase Admin SDK: npm install firebase-admin
 * 2. Get your Firebase service account key from Firebase Console
 * 3. Set the path to your service account key below
 * 4. Run: node reset-user-data.js
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// SECURITY NOTE: This script requires a Firebase service account key
// Download it from: Firebase Console > Project Settings > Service Accounts > Generate new private key
// Save it as 'serviceAccountKey.json' in this directory (it's gitignored for security)
// DO NOT commit service account keys to version control!

let serviceAccount;
try {
  serviceAccount = require('./serviceAccountKey.json');
} catch (error) {
  console.error('❌ Service account key not found!');
  console.error('📋 To use this script:');
  console.error('   1. Go to Firebase Console > Project Settings > Service Accounts');
  console.error('   2. Click "Generate new private key"');
  console.error('   3. Save the downloaded file as "serviceAccountKey.json" in this directory');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'hsk1-flashcards' // Your project ID
});

const db = admin.firestore();

async function resetAllUserData() {
  console.log('🚀 Starting user data reset...');
  
  try {
    // Get all user progress documents
    console.log('📊 Fetching user progress data...');
    const progressSnapshot = await db.collection('userProgress').get();
    console.log(`Found ${progressSnapshot.size} user progress records`);
    
    // Delete all user progress
    if (progressSnapshot.size > 0) {
      console.log('🗑️ Deleting user progress data...');
      const batch = db.batch();
      progressSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log('✅ All user progress data deleted');
    }
    
    // Get all user settings documents
    console.log('⚙️ Fetching user settings data...');
    const settingsSnapshot = await db.collection('userSettings').get();
    console.log(`Found ${settingsSnapshot.size} user settings records`);
    
    // Delete all user settings (they'll revert to defaults)
    if (settingsSnapshot.size > 0) {
      console.log('🗑️ Deleting user settings data...');
      const batch2 = db.batch();
      settingsSnapshot.docs.forEach(doc => {
        batch2.delete(doc.ref);
      });
      await batch2.commit();
      console.log('✅ All user settings data deleted');
    }
    
    // Optional: Update user profiles to mark the reset
    console.log('👤 Updating user profiles with reset timestamp...');
    const usersSnapshot = await db.collection('users').get();
    if (usersSnapshot.size > 0) {
      const batch3 = db.batch();
      usersSnapshot.docs.forEach(doc => {
        batch3.update(doc.ref, {
          dataResetAt: admin.firestore.FieldValue.serverTimestamp(),
          lastDataReset: new Date().toISOString()
        });
      });
      await batch3.commit();
      console.log('✅ User profiles updated with reset timestamp');
    }
    
    console.log('\n🎉 USER DATA RESET COMPLETE!');
    console.log('📋 Summary:');
    console.log(`   • ${progressSnapshot.size} user progress records deleted`);
    console.log(`   • ${settingsSnapshot.size} user settings records deleted`);
    console.log(`   • ${usersSnapshot.size} user profiles updated with reset timestamp`);
    console.log('\n⚠️ All users will start fresh with:');
    console.log('   • No learning progress (all words reset to "new")');
    console.log('   • Default session settings');
    console.log('   • Their accounts and login info intact');
    
  } catch (error) {
    console.error('❌ Error resetting user data:', error);
  } finally {
    process.exit(0);
  }
}

// Confirmation prompt
console.log('⚠️  WARNING: This will permanently delete all user learning data!');
console.log('📚 All users will lose their progress and start from scratch.');
console.log('🔐 User accounts and login credentials will remain intact.');
console.log('\nAre you sure you want to continue? (y/N)');

process.stdin.once('data', (data) => {
  const input = data.toString().trim().toLowerCase();
  if (input === 'y' || input === 'yes') {
    resetAllUserData();
  } else {
    console.log('Operation cancelled.');
    process.exit(0);
  }
});

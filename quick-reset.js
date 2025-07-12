#!/usr/bin/env node

/**
 * Quick Firebase Data Reset Script
 * 
 * This script will reset all user data using Firebase CLI commands.
 * Run this with: node quick-reset.js
 */

const { execSync } = require('child_process');

function runCommand(command, description) {
  console.log(`\n🔄 ${description}...`);
  try {
    const result = execSync(command, { encoding: 'utf8', stdio: 'inherit' });
    console.log(`✅ ${description} completed`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    return false;
  }
}

async function resetFirebaseData() {
  console.log('🚀 Starting Firebase data reset...');
  console.log('📋 This will delete all user progress and settings data.');
  
  // Check if user is logged in to Firebase
  console.log('\n🔐 Checking Firebase authentication...');
  try {
    execSync('firebase projects:list', { encoding: 'utf8', stdio: 'pipe' });
    console.log('✅ Firebase CLI authenticated');
  } catch (error) {
    console.log('❌ Not logged in to Firebase. Please run: firebase login');
    return;
  }
  
  // Set the project
  if (!runCommand('firebase use hsk1-flashcards', 'Setting Firebase project')) {
    return;
  }
  
  // Reset user progress data
  if (!runCommand('firebase firestore:delete --all-collections userProgress --yes', 'Deleting user progress data')) {
    return;
  }
  
  // Reset user settings data
  if (!runCommand('firebase firestore:delete --all-collections userSettings --yes', 'Deleting user settings data')) {
    return;
  }
  
  console.log('\n🎉 RESET COMPLETE!');
  console.log('📊 All user learning data has been deleted');
  console.log('🔐 User accounts remain intact');
  console.log('📚 All users will start fresh with 2,219 new words');
  console.log('⚙️ All settings will revert to defaults');
}

// Run the reset
resetFirebaseData().catch(console.error);

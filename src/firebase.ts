// Firebase Configuration for Light House Academy
// INSTRUCTIONS: Replace the config below with your own Firebase project config

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, onValue, push, remove, update } from 'firebase/database';

// ============================================
// STEP 1: Go to https://console.firebase.google.com
// STEP 2: Click "Create a project" or "Add project"
// STEP 3: Name it "LightHouseAcademy" and click Continue
// STEP 4: Disable Google Analytics (optional) and click Create Project
// STEP 5: Once created, click on "Web" icon (</>) to add a web app
// STEP 6: Name it "LHA Web App" and click Register
// STEP 7: Copy the firebaseConfig object and paste it below
// STEP 8: Go to "Build" > "Realtime Database" in the sidebar
// STEP 9: Click "Create Database" > Select location > Start in TEST MODE
// STEP 10: Your database is ready! The app will now sync across devices
// ============================================

const firebaseConfig = {
  apiKey: "AIzaSyAGL-uMNU-46n_zbafbAcEfDWiA3zp6e_8",
  authDomain: "lighthouseministry-ed84b.firebaseapp.com",
  databaseURL: "https://lighthouseministry-ed84b-default-rtdb.firebaseio.com",
  projectId: "lighthouseministry-ed84b",
  storageBucket: "lighthouseministry-ed84b.firebasestorage.app",
  messagingSenderId: "72583394869",
  appId: "1:72583394869:web:9621232e747ee77ed9237c"
};

// Initialize Firebase
let app: any = null;
let database: any = null;

// Check if Firebase is configured
export const isFirebaseConfigured = () => {
  return firebaseConfig.apiKey !== "YOUR_API_KEY" && 
         firebaseConfig.apiKey !== "" && 
         !firebaseConfig.apiKey.includes("XXXXX");
};

// Initialize Firebase only if configured
if (isFirebaseConfigured()) {
  try {
    app = initializeApp(firebaseConfig);
    database = getDatabase(app);
    console.log("✅ Firebase connected successfully!");
  } catch (error) {
    console.error("❌ Firebase initialization error:", error);
  }
} else {
  console.log("⚠️ Firebase not configured. Using localStorage as fallback.");
}

// Export database reference
export { database, ref, set, get, onValue, push, remove, update };

// Database paths
export const DB_PATHS = {
  STUDENTS: 'students',
  SESSIONS: 'sessions',
  MATERIALS: 'materials',
  MESSAGES: 'messages',
  SITE_SETTINGS: 'siteSettings'
};

// Helper functions for database operations
export const dbHelpers = {
  // Save data to a path
  saveData: async (path: string, data: any) => {
    if (!database) return false;
    try {
      await set(ref(database, path), data);
      return true;
    } catch (error) {
      console.error(`Error saving to ${path}:`, error);
      return false;
    }
  },

  // Get data from a path
  getData: async (path: string) => {
    if (!database) return null;
    try {
      const snapshot = await get(ref(database, path));
      return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
      console.error(`Error getting ${path}:`, error);
      return null;
    }
  },

  // Update specific fields
  updateData: async (path: string, data: any) => {
    if (!database) return false;
    try {
      await update(ref(database, path), data);
      return true;
    } catch (error) {
      console.error(`Error updating ${path}:`, error);
      return false;
    }
  },

  // Delete data at path
  deleteData: async (path: string) => {
    if (!database) return false;
    try {
      await remove(ref(database, path));
      return true;
    } catch (error) {
      console.error(`Error deleting ${path}:`, error);
      return false;
    }
  },

  // Subscribe to real-time updates
  subscribe: (path: string, callback: (data: any) => void) => {
    if (!database) return () => {};
    const dbRef = ref(database, path);
    return onValue(dbRef, (snapshot) => {
      const data = snapshot.exists() ? snapshot.val() : null;
      callback(data);
    });
  }
};

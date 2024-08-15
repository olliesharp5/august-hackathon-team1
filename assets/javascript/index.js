import { saveScore, getLeaderboard, testFirestoreConnection } from '/assets/javascript/firebase.js';

console.log("Hello World!");

document.addEventListener('DOMContentLoaded', async () => {
    try {
      const testDocId = await testFirestoreConnection();
      console.log(`Firestore is connected. Test document ID: ${testDocId}`);
    } catch (error) {
      console.error("Failed to connect to Firestore:", error);
    }
  });
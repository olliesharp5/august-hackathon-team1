// Import Firebase SDK components
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-analytics.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAhhZYGXejd2HgV36XKr_969bB-n3qU6pc",
  authDomain: "duck-hunt-reloaded.firebaseapp.com",
  projectId: "duck-hunt-reloaded",
  storageBucket: "duck-hunt-reloaded.appspot.com",
  messagingSenderId: "478753334953",
  appId: "1:478753334953:web:78ff06955d26f700ffabb8",
  measurementId: "G-KKD85Q3FKY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Function to save a score to Firestore
export async function saveScore(username, score) {
  try {
    const docRef = await addDoc(collection(db, "leaderboard"), {
      username: username,
      score: score,
      timestamp: new Date()
    });
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

// Function to get and display the leaderboard from Firestore
export async function getLeaderboard() {
  const q = query(collection(db, "leaderboard"), orderBy("score", "desc"), limit(10));
  const querySnapshot = await getDocs(q);
  const leaderboard = [];
  querySnapshot.forEach((doc) => {
    leaderboard.push(doc.data());
  });

  // Return the leaderboard data for display
  return leaderboard;
}

// Function to test Firestore connection by writing a test document
export async function testFirestoreConnection() {
    try {
      const docRef = await addDoc(collection(db, "testCollection"), {
        testField: "This is a test document",
        timestamp: new Date()
      });
      console.log("Test document written with ID: ", docRef.id);
      return docRef.id;
    } catch (e) {
      console.error("Error writing test document: ", e);
      throw e;
    }
  }

// Handle Firebase connection and initialisation
document.addEventListener('DOMContentLoaded', async () => {
  try {
      const testDocId = await testFirestoreConnection();
      console.log(`Firestore is connected. Test document ID: ${testDocId}`);
  } catch (error) {
      console.error("Failed to connect to Firestore:", error);
  }

});


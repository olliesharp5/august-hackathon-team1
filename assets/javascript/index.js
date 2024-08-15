import { saveScore, getLeaderboard, testFirestoreConnection } from '/assets/javascript/firebase.js';

// firebase
document.addEventListener('DOMContentLoaded', async () => {
    try {
      const testDocId = await testFirestoreConnection();
      console.log(`Firestore is connected. Test document ID: ${testDocId}`);
    } catch (error) {
      console.error("Failed to connect to Firestore:", error);
    }
  });


// gameState variables
let level = 0;
let remainingDucks = 0;
let misses = 0;
let maxMisses = 3;
let score = 0;

// Menu
// Calls playGame() or leaderBoard()
document.addEventListener("DOMContentLoaded", function () {
    let buttons = document.getElementsByTagName("button");
    for (let button of buttons) {
      button.addEventListener("click", function () {
        if (this.getAttribute("data-type") === "play") {
          playGame();
        } else {
          if (this.getAttribute("data-type") === "leaderboard") {
            leaderBoard();
          }
        }
    })
}
});

/**
 * This function does:
 * Set the level variable
 * Modify the DOM
 * call the startLevel function
 **/
function playGame() {
    // swap the body content to canvas
    let gameContent = `
    <main>
    <canvas id="game-area">
    </canvas>
    </main>
    `;
    document.body.innerHTML = gameContent;
    startLevel();
}

/**
 * This function does:
 * handle the leaderboard
 **/
function leaderBoard() {
    console.log("you have clicked leaderboard");
}

/**
 * This function does:
 * start the first level
 * set the variables
 **/
function startLevel() {
    level = 1;
    remainingDucks = 3;
    misses = 0;
    maxMisses = 3;
    score = 0;
};
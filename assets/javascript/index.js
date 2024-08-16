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

// Music Controls

document.addEventListener("DOMContentLoaded", function () {
  const music = document.getElementById("bg-audio");
  const musicControls = document.getElementById("music-controls");
  const pauseIcon = `<svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
    <path fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm9-3a1 1 0 1 0-2 0v6a1 1 0 1 0 2 0V9Zm4 0a1 1 0 1 0-2 0v6a1 1 0 1 0 2 0V9Z" clip-rule="evenodd"/>
  </svg>
  `;
  const playIcon = `<svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
  <path fill-rule="evenodd" d="M8.6 5.2A1 1 0 0 0 7 6v12a1 1 0 0 0 1.6.8l8-6a1 1 0 0 0 0-1.6l-8-6Z" clip-rule="evenodd"/>
</svg>`;
  
  musicControls.addEventListener("click", function () {
    if (music.paused) {
      music.play();
      musicControls.innerHTML = pauseIcon;
    } else {
      music.pause();
      musicControls.innerHTML = playIcon;
    }
  });
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
    const gameArea = document.getElementById("game-area");
    gameArea.innerHTML = gameContent;
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
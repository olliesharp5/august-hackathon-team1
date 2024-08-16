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
        });
    }
});

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d'); 

/**
 * This function does:
 * handle the leaderboard
 **/
async function leaderBoard() {
    const leaderboard = await getLeaderboard();
    let leaderboardContent = `
    <main>
    <h1>Leaderboard</h1>
    <ul>
        ${leaderboard.map(entry => `<li>${entry.name}: ${entry.score}</li>`).join('')}
    </ul>
    <button data-type="play">Play Again</button>
    </main>
    `;
    document.body.innerHTML = leaderboardContent;
    document.querySelector('button[data-type="play"]').addEventListener('click', playGame);
}


/**
 * Sets up the initial game state and starts the first level
 **/
function playGame() {
    const gameState = {
        level: 1,
        remainingDucks: 0,
        misses: 0,
        maxMisses: 3,
        score: 0
    };
    
    let gameContent = `
    <main>
    <canvas id="game-area" width="800" height="600"></canvas>
    <p>Score: <span id="score">0</span></p>
    <p>Misses: <span id="misses">0</span>/<span id="max-misses">${gameState.maxMisses}</span></p>
    </main>
    `;
    const gameArea = document.getElementById("game-area");
    gameArea.innerHTML = gameContent;

    startLevel(gameState);
}


/**
 * Prepares the game state for a new level by resetting the misses, setting the number of ducks for the level, and spawning them
 **/
function startLevel(gameState) {
    gameState.misses = 0;  // Reset misses
    gameState.remainingDucks = gameState.level * 3;  // Number of ducks per level

    spawnDucks(gameState.level, gameState);
}



function spawnDucks(numDucks, gameState) {
    for (let i = 0; i < numDucks; i++) {
        const duck = createDuck(gameState.level);
        animateDuck(duck, gameState);
    }
}






/**
 * This function does:
 * Handles leveling up the game
 */
function levelUp() {
    level++;
    remainingDucks = 3 + level;
    spawnDuck();
}

/**
 * This function does:
 * Ends the game
 * Saves the score
 * Displays the leaderboard
 */
function gameOver() {
    saveScore(score).then(() => {
        alert(`Game Over! Your score: ${score}`);
        leaderBoard();
    });
}
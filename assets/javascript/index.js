import { saveScore, getLeaderboard, testFirestoreConnection } from '/assets/javascript/firebase.js';

// Firebase connection initialisation
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const testDocId = await testFirestoreConnection();
        console.log(`Firestore is connected. Test document ID: ${testDocId}`);
    } catch (error) {
        console.error("Failed to connect to Firestore:", error);
    }

});

/**
 * This function takes in a min and max value and returns a random integer between the two values.
 * @param {Integer} min 
 * @param {Integer} max 
 * @returns 
 */
const getRandomInteger = (min, max) => {
  min = Math.ceil(min)
  max = Math.floor(max)

  return Math.floor(Math.random() * (max - min)) + min
}

/**
 * This set of functions does:
 * Play and pause music
 * Shuffle music
 * Volume control
 */

document.addEventListener("DOMContentLoaded", function () {
  const music = document.getElementById("bg-audio");
  const playToggle = document.getElementById("playToggle");
  const shuffleButton = document.getElementById("shuffleButton");
  const volumeControl = document.getElementById("volumeControl");
  let mouseDown = false;

  const pauseIcon = `<svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
    <path fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm9-3a1 1 0 1 0-2 0v6a1 1 0 1 0 2 0V9Zm4 0a1 1 0 1 0-2 0v6a1 1 0 1 0 2 0V9Z" clip-rule="evenodd"/>
  </svg>
  `;
  const playIcon = `<svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
    <path fill-rule="evenodd" d="M8.6 5.2A1 1 0 0 0 7 6v12a1 1 0 0 0 1.6.8l8-6a1 1 0 0 0 0-1.6l-8-6Z" clip-rule="evenodd"/>
  </svg>`;
  
  // Play and pause music
  playToggle.addEventListener("click", function () {
      if (music.paused) {
        music.play();
        playToggle.innerHTML = pauseIcon;
      } else {
        music.pause();
        playToggle.innerHTML = playIcon;
      }
    });

  // Shuffle music
  shuffleButton.addEventListener("click", function () {
    let currentSong = getRandomInteger(1, 5);
    if(!music.paused && music.duration > 0) {
      music.pause(); 
      playToggle.innerHTML = playIcon;
    }
      music.src = `/assets/sounds/bgmusic${currentSong}.mp3`;  
    
      music.play();
      playToggle.innerHTML = pauseIcon;
  });

  volumeControl.addEventListener("mouseup", up);
  volumeControl.addEventListener("mousedown", down);
  volumeControl.addEventListener("mousemove", volumeSlide, true);

  function down() {
    mouseDown = true;
  }

  function up() {
    mouseDown = false;
  }

  // Volume control limits
  const volumeControllimit = volumeControl.getBoundingClientRect().width;

  /**
   * Detect input on volume slider to adjust volume
   * @param {*} e 
   */
  function volumeSlide(e) {
    if (mouseDown) {
      let volume = e.offsetX / volumeControllimit;
      music.volume = volume;
    }
  }

  // Set volume to 50% on load
  music.volume = 0.5;

  // Toggle volume mute
  const volumeToggle = document.getElementById("volumeToggle");
  const muteIcon = `<svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
    <path d="M5.707 4.293a1 1 0 0 0-1.414 1.414l14 14a1 1 0 0 0 1.414-1.414l-.004-.005C21.57 16.498 22 13.938 22 12a9.972 9.972 0 0 0-2.929-7.071 1 1 0 1 0-1.414 1.414A7.972 7.972 0 0 1 20 12c0 1.752-.403 3.636-1.712 4.873l-1.433-1.433C17.616 14.37 18 13.107 18 12c0-1.678-.69-3.197-1.8-4.285a1 1 0 1 0-1.4 1.428A3.985 3.985 0 0 1 16 12c0 .606-.195 1.335-.59 1.996L13 11.586V6.135c0-1.696-1.978-2.622-3.28-1.536L7.698 6.284l-1.99-1.991ZM4 8h.586L13 16.414v1.451c0 1.696-1.978 2.622-3.28 1.536L5.638 16H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2Z"/>
  </svg>`;
  const notMutedIcon = `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.5 8.43A4.985 4.985 0 0 1 17 12a4.984 4.984 0 0 1-1.43 3.5m2.794 2.864A8.972 8.972 0 0 0 21 12a8.972 8.972 0 0 0-2.636-6.364M12 6.135v11.73a1 1 0 0 1-1.64.768L6 15H4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h2l4.36-3.633a1 1 0 0 1 1.64.768Z"/>
  </svg>`;

  volumeToggle.addEventListener("click", function () {
    if (music.muted) {
      music.muted = false;
      volumeToggle.innerHTML = notMutedIcon;
    } else {
      music.muted = true;
      volumeToggle.innerHTML = muteIcon;
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
    document.querySelector('button[data-type="play"]').addEventListener('click', playGame());
}


/**
 * Sets up the initial game state and starts the first level
 **/
function playGame() {

  const gameArea = document.getElementById('game-area');

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
  gameArea.innerHTML = gameContent;

  const canvas = document.getElementById('game-area');
  const ctx = canvas.getContext('2d'); 

  startLevel(gameState, ctx);
}


/**
 * Prepares the game state for a new level by resetting the misses, setting the number of ducks for the level, and spawning them
 **/
function startLevel(gameState, ctx) {
    gameState.misses = 0;  // Reset the misses
    gameState.remainingDucks = gameState.level * 3;  // Number of ducks per level

    spawnDucks(gameState.level, gameState, ctx);
}


/**
 * Spawns the required number of ducks based on the level
 */
function spawnDucks(numDucks, gameState, ctx) {
    const canvas = ctx.canvas;  // Get the canvas from the context
    for (let i = 0; i < numDucks; i++) {
        const duck = createDuck(gameState.level, canvas);
        animateDuck(duck, gameState, ctx);
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
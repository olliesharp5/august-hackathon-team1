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

// Random number generator
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
        });
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
    <canvas id="game-area" width="800" height="600"></canvas>
    <p>Score: <span id="score">0</span></p>
    <p>Misses: <span id="misses">0</span>/<span id="max-misses">${maxMisses}</span></p>
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
    
    document.getElementById("score").textContent = score;
    document.getElementById("misses").textContent = misses;

    spawnDuck();
}

/**
 * This function does:
 * Spawns a duck in the game area
 * Handles duck movement
 * Adds event listener for shooting the duck
 */
function spawnDuck() {
    const canvas = document.getElementById('game-area');
    const ctx = canvas.getContext('2d');

    let duckX = 0;
    let duckY = Math.random() * (canvas.height - 50);
    let duckSpeed = 3 + level;

    function moveDuck() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'yellow';
        ctx.fillRect(duckX, duckY, 50, 50);
        duckX += duckSpeed;

        if (duckX < canvas.width) {
            requestAnimationFrame(moveDuck);
        } else {
            missDuck();
        }
    }

    canvas.addEventListener('click', function shootDuck(event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        if (x >= duckX && x <= duckX + 50 && y >= duckY && y <= duckY + 50) {
            score += 10;
            document.getElementById('score').textContent = score;
            remainingDucks--;

            if (remainingDucks > 0) {
                duckX = 0;
                duckY = Math.random() * (canvas.height - 50);
                requestAnimationFrame(moveDuck);
            } else {
                levelUp();
            }
        }
    }, { once: true });

    moveDuck();
}

/**
 * This function does:
 * Handles when the player misses a duck
 */
function missDuck() {
    misses++;
    document.getElementById('misses').textContent = misses;

    if (misses >= maxMisses) {
        gameOver();
    } else {
        spawnDuck();
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
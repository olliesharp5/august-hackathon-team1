import { saveScore, getLeaderboard, testFirestoreConnection } from '/assets/javascript/firebase.js';

// Handle Firebase connection and initialisation
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const testDocId = await testFirestoreConnection();
        console.log(`Firestore is connected. Test document ID: ${testDocId}`);
    } catch (error) {
        console.error("Failed to connect to Firestore:", error);
    }

});

/**
 * This function:
 * Handles the music controls
 * Toggles play/pause
 * Toggles volume mute/unmute
 * Shuffles music
 */
document.addEventListener("DOMContentLoaded", function () {
  // Get the audio element and the music controls
  const music = document.getElementById("bg-audio");
  const playToggle = document.getElementById("playToggle");
  const volumeToggle = document.getElementById("volumeToggle");
  const shuffleButton = document.getElementById("shuffleButton");
  const volumeControl = document.getElementById("volumeControl");

  // Icons
  const pauseIcon = `<svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
  <path fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm9-3a1 1 0 1 0-2 0v6a1 1 0 1 0 2 0V9Zm4 0a1 1 0 1 0-2 0v6a1 1 0 1 0 2 0V9Z" clip-rule="evenodd"/>
  </svg>
  `;
  const playIcon = `<svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
  <path fill-rule="evenodd" d="M8.6 5.2A1 1 0 0 0 7 6v12a1 1 0 0 0 1.6.8l8-6a1 1 0 0 0 0-1.6l-8-6Z" clip-rule="evenodd"/>
  </svg>`;
  const muteIcon = `<svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
    <path d="M5.707 4.293a1 1 0 0 0-1.414 1.414l14 14a1 1 0 0 0 1.414-1.414l-.004-.005C21.57 16.498 22 13.938 22 12a9.972 9.972 0 0 0-2.929-7.071 1 1 0 1 0-1.414 1.414A7.972 7.972 0 0 1 20 12c0 1.752-.403 3.636-1.712 4.873l-1.433-1.433C17.616 14.37 18 13.107 18 12c0-1.678-.69-3.197-1.8-4.285a1 1 0 1 0-1.4 1.428A3.985 3.985 0 0 1 16 12c0 .606-.195 1.335-.59 1.996L13 11.586V6.135c0-1.696-1.978-2.622-3.28-1.536L7.698 6.284l-1.99-1.991ZM4 8h.586L13 16.414v1.451c0 1.696-1.978 2.622-3.28 1.536L5.638 16H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2Z"/>
  </svg>`;
  const notMutedIcon = `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.5 8.43A4.985 4.985 0 0 1 17 12a4.984 4.984 0 0 1-1.43 3.5m2.794 2.864A8.972 8.972 0 0 0 21 12a8.972 8.972 0 0 0-2.636-6.364M12 6.135v11.73a1 1 0 0 1-1.64.768L6 15H4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h2l4.36-3.633a1 1 0 0 1 1.64.768Z"/>
  </svg>`;
  
  // Set volume to 50% on load (It's very loud otherwise)
  music.volume = 0.5;

  // Toggle play/pause
  playToggle.addEventListener("click", function () {
    if (music.paused) {
      music.play();
      playToggle.innerHTML = pauseIcon;
    } else {
      music.pause();
      playToggle.innerHTML = playIcon;
    }
  }
);

  // Toggle volume mute/unmute
  volumeToggle.addEventListener("click", function () {
    if (music.muted) {
      music.muted = false;
      volumeToggle.innerHTML = notMutedIcon;
    } else {
      music.muted = true;
      volumeToggle.innerHTML = muteIcon;
    }
  });

  // Shuffle music
  shuffleButton.addEventListener("click", function () {
    /**
     * Generate random integer between 1 and 5
     * @returns {number} Random integer between 1 and 5
     */
    function getRandomInt() {
      return Math.floor(Math.random() * 11) + 1;
    }

    music.pause();
    music.src = `assets/sounds/music${getRandomInt()}.mp3`;
    music.play();
    playToggle.innerHTML = pauseIcon;
  });

  // Volume Control
  let mouseDown = false;

  volumeControl.addEventListener("mousedown", function () {
    mouseDown = true;
  });
  volumeControl.addEventListener("mouseup", function () {
    mouseDown = false;
  });

  volumeControl.addEventListener("mousemove", volumeSlide, true);

  function volumeSlide() {
    if (mouseDown) {
      music.volume = volumeControl.value / 100;
    }
  }
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
    document.querySelector('button[data-type="play"]').addEventListener('click', playGame);
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
  <canvas id="game" width="800" height="600"></canvas>
  <p>Score: <span id="score">0</span></p>
  <p>Misses: <span id="misses">0</span>/<span id="max-misses">${gameState.maxMisses}</span></p>
  `;
  gameArea.innerHTML = gameContent;

  const canvas = document.getElementById('game');
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


function createDuck(level, canvas) {
    const duckSize = 50 - (level * 5);  // Decrease hitbox size with level
    const speed = 2 + (level * 0.5);  // Increase speed with level

    const duck = {
        x: Math.random() * (canvas.width - duckSize),
        y: Math.random() * (canvas.height / 2),
        size: duckSize,
        speed: speed,
        direction: Math.random() < 0.5 ? 1 : -1,  // Randomly left or right
        spriteWidth: 64,  // Width of a single frame in the sprite sheet
        spriteHeight: 64,  // Height of a single frame in the sprite sheet
        totalFrames: 3,  // Total number of animation frames
        currentFrame: 0,  // Start at the first frame
        frameCounter: 0,  // To control animation speed
        frameSpeed: 10  // How many game ticks before the next frame
    };

    return duck;
}


function animateDuck(duck, gameState, ctx) {
    const canvas = ctx.canvas; // Access the canvas from the context
    const interval = setInterval(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        duck.x += duck.speed * duck.direction;

        // Bounce off the walls
        if (duck.x <= 0 || duck.x + duck.size >= canvas.width) {
            duck.direction *= -1;
            duck.bounces = (duck.bounces || 0) + 1;

            if (duck.bounces >= 3) {
                // Duck leaves the area
                clearInterval(interval);
                gameState.remainingDucks --;
            }
        }

        // Handle sprite animation
        duck.frameCounter++;
        if (duck.frameCounter >= duck.frameSpeed) {
            duck.currentFrame = (duck.currentFrame + 1) % duck.totalFrames;
            duck.frameCounter = 0;
        }

        drawDuck(duck, ctx);  // Redraw duck at new position

    }, 20);
}


function drawDuck(duck, ctx) {
    const duckSprite = new Image();
    duckSprite.src = 'assets/images/sprites/duck-sprite.png';
    // Save the current context state
    ctx.save();

    // Calculate the source x position of the current frame in the sprite sheet
    const srcX = duck.currentFrame * duck.spriteWidth;

    // Flip the duck horizontally ONLY if it's moving to the left
    if (duck.direction === -1) {
        ctx.translate(duck.x + duck.size, duck.y);
        ctx.scale(-1, 1); 
    } else {
        ctx.translate(duck.x, duck.y); 
    }

    // Draw the duck at its new position
    ctx.drawImage(
        duckSprite,            // Image source
        srcX, 0,               // Source x, y (top-left corner of the frame in the sprite sheet)
        duck.spriteWidth, duck.spriteHeight, // Source width, height (size of the frame)
        0, 0,                  // Destination x, y (already translated, so use 0, 0)
        duck.size, duck.size   // Destination width, height (size on the canvas)
    );

    // Restore the context to its original state
    ctx.restore();
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
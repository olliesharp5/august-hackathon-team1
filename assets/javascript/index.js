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
    document.body.innerHTML = gameContent;

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
        duck.x += duck.speed * duck.direction;

        // Bounce off the walls
        if (duck.x <= 0 || duck.x + duck.size >= canvas.width) {
            duck.direction *= -1;
            duck.bounces = (duck.bounces || 0) + 1;

            if (duck.bounces >= 3) {
                // Duck leaves the area
                clearInterval(interval);
                handleMiss(gameState);
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
    ctx.clearRect(duck.x, duck.y, duck.spriteWidth, duck.spriteHeight);  // Clear old position

    // Calculate the source x position of the current frame in the sprite sheet
    const srcX = duck.currentFrame * duck.spriteWidth;

    if (duck.direction === -1) {
        
    }

    // Draw the current frame
    ctx.drawImage(
        duckSprite,            // Image source
        srcX, 0,               // Source x, y (top-left corner of the frame in the sprite sheet)
        duck.spriteWidth, duck.spriteHeight, // Source width, height (size of the frame)
        duck.x, duck.y,        // Destination x, y (where to draw on the canvas)
        duck.size, duck.size   // Destination width, height (size on the canvas)
    );
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
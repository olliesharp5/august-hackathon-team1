import { saveScore, getLeaderboard } from '/assets/javascript/firebase.js';

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

let activeDucks = [];  // Array to hold all active ducks

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
  <canvas id="gameCanvas" width="800" height="600"></canvas>
  <p id="display-score">Score: <span id="score">0</span></p>
  <p id="display-misses">Misses: <span id="misses">0</span>/<span id="max-misses">${gameState.maxMisses}</span></p>
  `;
  gameArea.innerHTML = gameContent;

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d'); 

  startLevel(gameState, ctx, canvas);

}


/**
 * Prepares the game state for a new level by resetting the misses, setting the number of ducks for the level, and spawning them
 **/
function startLevel(gameState, ctx, canvas) {
    gameState.misses = 0;  // Reset the misses for the new level
    activeDucks = [];  // Clear any previous ducks from the array
    gameState.remainingDucks = gameState.level * 6;  // Set the correct number of ducks for this level
    spawnDucks(gameState, ctx);  // Start spawning ducks for the level
    requestAnimationFrame(() => drawAllDucks(ctx));  // Start the centralized drawing loop

  // Event listener for shooting ducks
  canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Check if the click hit any of the ducks and if so, 
    // replace the duck with blood splatter png which fades out after 3 seconds
    activeDucks.forEach(duck => {
        let minAreaX = duck.x - (duck.size);
        let maxAreaX = duck.x + (duck.size / 2);
        let minAreaY = duck.y - (duck.size);
        let maxAreaY = duck.y + (duck.size / 2);
  
        if (x > minAreaX && x < maxAreaX && y > minAreaY && y < maxAreaY) {
            const blood = new Image();
            blood.src = 'assets/images/sprites/blood-splatter.jpg';
            ctx.drawImage(blood, duck.x, duck.y, duck.size, duck.size);
            activeDucks = activeDucks.filter(d => d !== duck);  // Remove the duck from the activeDucks array
            gameState.score += 100;  // Increase the score
            score.innerHTML = gameState.score;  // Update the score display
        } else {
            gameState.misses++;  // Increase the misses
            document.getElementById("display-misses").innerHTML = `Misses: <span id="misses">${gameState.misses}</span>/<span id="max-misses">${gameState.maxMisses}</span>`;
      }
    });
  });
}

/**
 * Spawns the required number of ducks based on the level
 */
function spawnDucks(gameState, ctx) {
    const canvas = ctx.canvas;
    const ducksPerBatch = gameState.level * 2;  // Number of ducks to spawn at once

    console.log(`Level ${gameState.level} - Remaining Ducks: ${gameState.remainingDucks}`);

    // Spawn ducksPerBatch ducks at once with the same speed
    for (let i = 0; i < ducksPerBatch && gameState.remainingDucks > 0; i++) {
        const duck = createDuck(gameState.level, canvas, 2 + gameState.level * 0.5);  // Use consistent speed
        activeDucks.push(duck);  // Add the duck to the activeDucks array
        animateDuck(duck, gameState, ctx);
        gameState.remainingDucks--;  // Decrease the remaining ducks counter
    }
}


function createDuck(level, canvas) {
    const duckSize = 50 - (level * 5);  // Decrease hitbox size with level
    const speed = 2 + (level * 1.5);  // Increase speed with level

    // Randomly decide if the duck starts from the left or right border
    const startFromLeft = Math.random() < 0.5;

    const duck = {
        x: startFromLeft ? 0 : canvas.width - duckSize,  // Start at the left or right border
        y: Math.random() * (canvas.height / 2),
        size: duckSize,
        speed: speed,

        direction: Math.random() < 0.5 ? 1 : -1,  // Randomly left or right
        spriteWidth: 125,  // Width of a single frame in the sprite sheet
        spriteHeight: 100,  // Height of a single frame in the sprite sheet
        totalFrames: 3,  // Total number of animation frames
        currentFrame: 0,  // Start at the first frame
        frameCounter: 0,  // To control animation speed
        frameSpeed: 10  // How many game ticks before the next frame
    };

    return duck;
}


function animateDuck(duck, gameState, ctx, callback = () => {}) {
    const canvas = ctx.canvas;
    const interval = setInterval(() => {
        duck.x += duck.speed * duck.direction;

        // Bounce off the walls
        if (duck.x <= 0 || duck.x + duck.size >= canvas.width) {
            duck.direction *= -1;
            duck.bounces = (duck.bounces || 0) + 1;

            if (duck.bounces >= 3) {
                // Duck leaves the screen
                clearInterval(interval);
                
                // Remove duck from activeDucks array
                activeDucks = activeDucks.filter(d => d !== duck);

                // Decrement remainingDucks
                gameState.remainingDucks--;
                console.log(`Duck left the screen. Remaining Ducks: ${gameState.remainingDucks}`);

                // Check if there are no more active ducks and remaining ducks to spawn
                if (activeDucks.length === 0) {
                    if (gameState.remainingDucks > 0) {
                        console.log(`Spawning more ducks. Remaining Ducks to Spawn: ${gameState.remainingDucks}`);
                        spawnDucks(gameState, ctx); // Spawn more ducks
                    } else if (gameState.level < 5) {
                        console.log(`Moving to next level.`);
                        nextLevel(gameState, ctx); // Move to the next level
                    } else {
                        console.log("You completed all levels!");
                        gameOver(gameState); // End the game
                    }
                }
            }
        }

        // Handle sprite animation
        duck.frameCounter++;
        if (duck.frameCounter >= duck.frameSpeed) {
            duck.currentFrame = (duck.currentFrame + 1) % duck.totalFrames;
            duck.frameCounter = 0;
        }

        // Draw the duck
        drawDuck(duck, ctx);
    }, 20);
}

function drawAllDucks(ctx) {
    const canvas = ctx.canvas;

    // Clear the entire canvas before drawing the new frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all active ducks
    activeDucks.forEach(duck => {
        // Handle sprite animation
        duck.frameCounter++;
        if (duck.frameCounter >= duck.frameSpeed) {
            duck.currentFrame = (duck.currentFrame + 1) % duck.totalFrames;
            duck.frameCounter = 0;
        }

        drawDuck(duck, ctx);
    });

    requestAnimationFrame(() => drawAllDucks(ctx));  // Schedule the next frame
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
function nextLevel(gameState, ctx) {
    gameState.level++;
    console.log(`Starting Level ${gameState.level}`);

    // Start the next level
    startLevel(gameState, ctx);
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
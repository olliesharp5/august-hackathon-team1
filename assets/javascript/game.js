import {
    saveScore,
    getLeaderboard
} from './firebase.js';

document.addEventListener("DOMContentLoaded", function () {
    setupMenuButtons();
    showMainMenu();  // Display the main menu with the top score when the page loads
});

function setupMenuButtons() {
    let buttons = document.getElementsByTagName("button");
    for (let button of buttons) {
        button.addEventListener("click", function () {
            if (this.getAttribute("data-type") === "play") {
                playGame();
            } else if (this.getAttribute("data-type") === "leaderboard") {
                leaderBoard();
            } else if (this.getAttribute("data-type") === "menu") {
                showMainMenu();
            }
        });
    }
}

async function showMainMenu() {
    let topScoreText = 'Loading...';

    // Fetch the top score from the leaderboard
    const leaderboard = await getLeaderboard();
    if (leaderboard && leaderboard.length > 0) {
        const topScore = leaderboard[0].score;
        topScoreText = `Top Score: ${topScore} by ${leaderboard[0].username}`;
    } else {
        topScoreText = 'No scores yet.';
    }

    const mainMenuContent = `
    <div class="menu-container">
        <h1 class="main-heading">DuckHunt Reloaded</h1>
        <h1 class="main-heading">Leaderboard</h1>
        <button class="menu-item" data-type="play">Play</button><br>
        <button class="menu-item" data-type="leaderboard">Leaderboard</button><br>
        <h1 id="top-score">${topScoreText}</h1>
    </div>
    `;    
}

async function leaderBoard() {
    const leaderboard = await getLeaderboard();
    let leaderboardContent = `
    <div class="menu-container">
        <h1 class="main-heading">Leaderboard</h1>
        <ul>
            ${leaderboard.map(entry => `<li>${entry.username}: ${entry.score}</li>`).join('')}
        </ul>
        <button class="menu-item" data-type="play">Play Again</button><br>
        <button class="menu-item" data-type="menu">Back to Main Menu</button>
    </div>
    `;
    document.getElementById('game-area').innerHTML = leaderboardContent;

    // Reattach event listeners to the buttons in the leaderboard
    setupMenuButtons();
}

let activeDucks = []; // Array to hold all active ducks
let animationFrameId; // Declare the global variable
let duckIntervals = []; // Global array to keep track of all duck intervals

/**
 * Sets up the initial game state and starts the first level
 **/
function playGame() {
    let gameArea = document.getElementById('game-area');

    // If the gameArea does not exist, create it or ensure it is reinserted
    if (!gameArea) {
        gameArea = document.createElement('div');
        gameArea.id = 'game-area';
        document.body.appendChild(gameArea);
    }

    // Cancel any existing animation frame to prevent overlaps
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }

    const gameState = {
        level: 1,
        remainingDucks: 0,
        misses: 0,
        maxMisses: 3,
        score: 0,
        totalDucks: 0, 
        roundOver: false,
        levelTransitioning: false
    };

    let gameContent = `
    <canvas id="gameCanvas" width="800" height="600"></canvas>
    <p id="display-score">Score: <span id="score">0</span></p>
    <p id="display-misses">Misses: <span id="misses">0</span>/<span id="max-misses">${gameState.maxMisses}</span></p>
    `;
    gameArea.innerHTML = gameContent;

    const canvas = document.getElementById('gameCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        startLevel(gameState, ctx, canvas);
    } else {
        console.error("Canvas element not found after attempting to create it!");
    }
}


/**
 * Prepares the game state for a new level by resetting the misses, setting the number of ducks for the level, and spawning them
 **/
let lastTouchTime = 0;

function startLevel(gameState, ctx, canvas) {
    // Reset game state for the new level
    gameState.misses = 0;
    gameState.roundOver = false;
    gameState.levelTransitioning = false;
    activeDucks = []; // Clear active ducks array

    // Reset UI elements
    document.getElementById("display-misses").innerHTML = `Misses: <span id="misses">0</span>/<span id="max-misses">${gameState.maxMisses}</span>`;

    // Define the number of ducks for this level
    const ducksPerRound = [6, 12, 18, 24, 30];
    gameState.totalDucks = ducksPerRound[gameState.level - 1];
    gameState.remainingDucks = gameState.totalDucks;

    // Clear the canvas before starting a new level
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Spawn ducks for the current level
    spawnDucks(gameState, ctx); // Start spawning ducks

    // Start the animation loop for drawing ducks
    animationFrameId = requestAnimationFrame(() => drawAllDucks(ctx));

    // Set up the click handler for shooting ducks
    canvas.onclick = function (event) {
        if (gameState.roundOver) return; // Stop interaction if the round is over

        const gunshot = new Audio('../assets/sounds/gunshot.mp3');
        gunshot.play();
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;    // Account for horizontal scaling
        const scaleY = canvas.height / rect.height;  // Account for vertical scaling
        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;

        processHit(x, y, gameState, ctx, canvas);
    };

    // Set up the touch handler for shooting ducks on touch devices
    canvas.addEventListener('touchstart', function (event) {
        const now = Date.now();
        if (now - lastTouchTime < 300) {
            return; // Ignore if the last touch event was too recent
        }
        lastTouchTime = now;
        event.preventDefault(); // Prevent default touch behavior

        const gunshot = new Audio('../assets/sounds/gunshot.mp3');
        gunshot.play();
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;    // Account for horizontal scaling
        const scaleY = canvas.height / rect.height;  // Account for vertical scaling
        const x = (event.touches[0].clientX - rect.left) * scaleX;
        const y = (event.touches[0].clientY - rect.top) * scaleY;

        processHit(x, y, gameState, ctx, canvas);
    });

    console.log(`Started Level ${gameState.level}`);
}


function processHit(x, y, gameState, ctx, canvas) {
    let duckHit = false;
    activeDucks.forEach(duck => {
        // Adjust the hitbox with padding to improve touch accuracy
        const hitboxPadding = 10; // Adjust this value as needed
        const minAreaX = duck.x - hitboxPadding;
        const maxAreaX = duck.x + duck.size + hitboxPadding;
        const minAreaY = duck.y - hitboxPadding;
        const maxAreaY = duck.y + duck.size + hitboxPadding;

        console.log(`Duck Hitbox: X(${minAreaX} - ${maxAreaX}), Y(${minAreaY} - ${maxAreaY})`);

        if (x > minAreaX && x < maxAreaX && y > minAreaY && y < maxAreaY) {
            console.log("Duck hit!");
            const blood = new Image();
            blood.src = 'assets/images/sprites/blood-splatter.jpg';
            ctx.drawImage(blood, duck.x, duck.y, duck.size, duck.size);
            duck.state = "dead";
            duck.fallSpeed = 15;
            gameState.score += 100;
            document.getElementById('score').innerText = gameState.score;
            duckHit = true;
        }
    });

    if (!duckHit) {
        console.log("Missed!");
        gameState.misses++;
        document.getElementById("display-misses").innerHTML = `Misses: <span id="misses">${gameState.misses}</span>/<span id="max-misses">${gameState.maxMisses}</span>`;
        gameState.score = Math.max(0, gameState.score - 50);
        document.getElementById('score').innerText = gameState.score;

        if (gameState.misses >= gameState.maxMisses) {
            endLevel(gameState, ctx, canvas); // End the level immediately on too many misses
        }
    }

    // Check if all ducks are gone
    checkForEndOfLevel(gameState, ctx, canvas);
}


function checkForEndOfLevel(gameState, ctx, canvas) {
    console.log(`Checking for end of level. Remaining Ducks: ${gameState.remainingDucks}, Active Ducks: ${activeDucks.length}`);
    if (activeDucks.length === 0 && gameState.remainingDucks === 0) {
        if (!gameState.levelTransitioning) {
            console.log("All ducks handled, ending level.");
            endLevel(gameState, ctx, canvas);
        }
    }
}


function endLevel(gameState, ctx, canvas) {
    if (gameState.levelTransitioning) return;

    gameState.roundOver = true;
    gameState.levelTransitioning = true;

    // Stop all duck animations
    activeDucks = []; // Clear the activeDucks array
    cancelAnimationFrame(animationFrameId); // Cancel any ongoing animations
    duckIntervals.forEach(interval => clearInterval(interval)); // Clear all duck intervals
    duckIntervals = []; // Reset the intervals array

    // Clear the canvas to remove any remaining ducks or trails
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Display "Level Complete" message
    ctx.font = "30px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(`Level ${gameState.level} complete!`, ctx.canvas.width / 2, ctx.canvas.height / 2 - 50);

    // Create the "Next Level" button
    const nextButton = document.createElement('button');
    nextButton.innerText = 'Next Level';
    nextButton.style.position = 'absolute';
    nextButton.style.top = '60%';
    nextButton.style.left = '50%';
    nextButton.style.transform = 'translate(-50%, -50%)';
    nextButton.style.fontSize = '20px';
    nextButton.style.padding = '10px 20px';
    nextButton.style.backgroundColor = '#a87d32';
    nextButton.style.border = 'none';
    nextButton.style.color = '#fff';
    nextButton.style.cursor = 'pointer';
    nextButton.style.fontFamily = 'Arial, sans-serif';

    nextButton.onclick = function () {
        document.body.removeChild(nextButton);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Clear the canvas before starting the next level
        nextLevel(gameState, ctx, canvas); // Call nextLevel here to start the next level
    };

    document.body.appendChild(nextButton);
}




/**
 * Spawns the required number of ducks based on the level
 */
function spawnDucks(gameState, ctx) {
    if (gameState.roundOver) return; // Stop spawning if the round is over

    const canvas = ctx.canvas;
    const ducksPerBatch = Math.min(2 * gameState.level, gameState.remainingDucks);

    console.log(`Spawning ducks. Ducks per batch: ${ducksPerBatch}, Remaining Ducks: ${gameState.remainingDucks}, Active Ducks: ${activeDucks.length}`);

    for (let i = 0; i < ducksPerBatch; i++) {
        setTimeout(() => {
            if (!gameState.roundOver && gameState.remainingDucks > 0) { // Check if the round is still active and ducks remain to be spawned
                const duck = createDuck(gameState.level, canvas);
                activeDucks.push(duck);
                animateDuck(duck, gameState, ctx);

                gameState.remainingDucks--; // Decrement remaining ducks count when a duck is spawned
                console.log(`Spawned a duck. Remaining Ducks: ${gameState.remainingDucks}, Active Ducks: ${activeDucks.length}`);
                
                if (gameState.remainingDucks === 0 && activeDucks.length === 0) {
                    checkForEndOfLevel(gameState, ctx, canvas);
                }
            }
        }, i * 500); // Stagger the duck spawns
    }
}


/**
 * Creates a new duck object for the game
 */
function createDuck(level, canvas) {
    const duckSize = 50 - (level * 5); // Decrease hitbox size with level
    const speed = 2 + (level * 1.5); // Increase speed with level

    // Randomly decide if the duck starts from the left or right border
    const startFromLeft = Math.random() < 0.5;

    const duck = {
        x: startFromLeft ? 0 : canvas.width - duckSize, // Start at the left or right border
        y: Math.random() * (canvas.height / 2),
        size: duckSize,
        speed: speed,
        state: "alive",
        fallSpeed: 0,
        lastX: null, // To track the duck's previous position to detect unexpected disappearance
        direction: startFromLeft ? 1 : -1, // Moving direction, 1 for right, -1 for left
        spriteWidth: 125, // Width of a single frame in the sprite sheet
        spriteHeight: 100, // Height of a single frame in the sprite sheet
        totalFrames: 3, // Total number of animation frames
        currentFrame: 0, // Start at the first frame
        frameCounter: 0, // To control animation speed
        frameSpeed: 10, // How many game ticks before the next frame

        // New properties for vertical movement
        amplitude: (level >= 2) ? 30 : 0, // Vertical movement amplitude; only for level 3 and onwards
        frequency: (level >= 2) ? 0.05 + (0.01 * (level - 2)) : 0, // Base frequency increases slightly with each level
        baseY: null, // Base Y position to oscillate around
        time: 0 // Time variable to create the wave motion
    };

    // Set baseY to current y position, to oscillate around this y position
    duck.baseY = duck.y;

    return duck;
}

/**
 * Animates the duck
 */
function animateDuck(duck, gameState, ctx) {
    const canvas = ctx.canvas;
    const interval = setInterval(() => {
        if (duck.state === "alive") {
            duck.x += duck.speed * duck.direction;

            // Vertical movement logic (sine wave)
            if (gameState.level >= 2) {
                duck.time += duck.frequency; // Increment time
                duck.y = duck.baseY + duck.amplitude * Math.sin(duck.time); // Calculate new y position based on sine wave
            }

            // Bounce off the walls
            if (duck.x <= 0 || duck.x + duck.size >= canvas.width) {
                duck.direction *= -1; // Reverse direction
                duck.bounces = (duck.bounces || 0) + 1;

                if (duck.bounces >= 3) {
                    // Duck leaves the screen after 3 bounces
                    clearInterval(interval);
                    activeDucks = activeDucks.filter(d => d !== duck);
                    spawnDucks(gameState, ctx); // Attempt to spawn new ducks if needed
                    checkForEndOfLevel(gameState, ctx, canvas); // Check if level should end after duck removal
                }
            }

            // Check if the duck leaves the screen
            if (duck.x < -duck.size || duck.x > canvas.width) {
                clearInterval(interval);
                activeDucks = activeDucks.filter(d => d !== duck);
                spawnDucks(gameState, ctx); // Attempt to spawn new ducks if needed
                checkForEndOfLevel(gameState, ctx, canvas); // Check if level should end after duck removal
            }

        } else {
            // Duck is dead
            duck.y += duck.fallSpeed;
            if (duck.y >= canvas.height) {
                clearInterval(interval);
                activeDucks = activeDucks.filter(d => d !== duck);
                spawnDucks(gameState, ctx); // Attempt to spawn new ducks if needed
                checkForEndOfLevel(gameState, ctx, canvas); // Check if level should end after duck removal
            }
        }

        // Always ensure the ducks are drawn on the screen
        drawDuck(duck, ctx);
    }, 20);

    duckIntervals.push(interval); // Store the interval so we can clear it later
}


/**
 * Draws all ducks on the canvas
 */
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

    // Request the next animation frame
    animationFrameId = requestAnimationFrame(() => drawAllDucks(ctx));
}


/**
 * Draws a single duck on the canvas
 */
function drawDuck(duck, ctx) {
    const aliveDuckSprite = new Image();
    aliveDuckSprite.src = 'assets/images/sprites/duck-sprite.png';

    const deadDuckSprite = new Image();
    deadDuckSprite.src = 'assets/images/sprites/dead-duck-sprite.png';

    // Save the current context state
    ctx.save();

    if (duck.state === "alive") {
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
            aliveDuckSprite, // Image source
            srcX, 0, // Source x, y (top-left corner of the frame in the sprite sheet)
            duck.spriteWidth, duck.spriteHeight, // Source width, height (size of the frame)
            0, 0, // Destination x, y (already translated, so use 0, 0)
            duck.size, duck.size // Destination width, height (size on the canvas)
        );
    } else {
        ctx.translate(duck.x, duck.y);
        ctx.drawImage(
            deadDuckSprite, // Image source
            0, 0, // Source x, y (top-left corner of the frame in the sprite sheet)
            50, 50, // Source width, height (size of the frame)
            0, 0, // Destination x, y (already translated, so use 0, 0)
            duck.size, duck.size // Destination width, height (size on the canvas)
        );
    }

    // Restore the context to its original state
    ctx.restore();
}

/**
 * Handles leveling up the game
 */
function nextLevel(gameState, ctx, canvas) {
    if (gameState.level < 5) {
        gameState.level++;
        gameState.misses = 0;
        gameState.roundOver = false;
        gameState.levelTransitioning = true; // Set the transitioning flag
        console.log(`Starting Level ${gameState.level}`);

        // Cancel the ongoing animation frame
        cancelAnimationFrame(animationFrameId);

        // Clear the canvas and show a message
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        ctx.font = "30px Arial";
        ctx.fillStyle = "white"; // Ensure the text is visible
        ctx.textAlign = "center";
        ctx.fillText(`Get ready for Level ${gameState.level}...`, ctx.canvas.width / 2, ctx.canvas.height / 2);

        // Delay to show the message before starting the next level
        setTimeout(() => {
            gameState.levelTransitioning = false; // Reset the flag before starting the level
            startLevel(gameState, ctx, canvas); // Resume the game
        }, 3000); // Display message for 3 seconds
    } else {
        console.log("You completed all levels!");
        gameOver(gameState);
    }
}



/**
 * Ends the game, saves the score, and displays the leaderboard
 */
function gameOver(gameState) {
    // Ensure that score is saved only once and is a valid number
    if (typeof gameState.score === 'number' && !isNaN(gameState.score)) {
        // Prompt the user for their username
        const username = prompt("Game Over! Please enter your username to save your score:");

        if (username) {
            // If a username is provided, save the score and then show the leaderboard
            saveScore(username, gameState.score).then(() => {
                alert(`Your score: ${gameState.score} has been saved!`);
                leaderBoard();
            }).catch(error => {
                console.error("Error saving score: ", error);
                leaderBoard();  // Redirect to leaderboard even if saving fails
            });
        } else {
            // If no username is provided, just show the leaderboard
            alert("No username entered. Your score was not saved.");
            leaderBoard();
        }
    } else {
        console.error("Invalid score value. Game Over skipped score save.");
        leaderBoard();  // Redirect to leaderboard even if the score is invalid
    }
}
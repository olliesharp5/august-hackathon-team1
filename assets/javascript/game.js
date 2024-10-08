import {
    saveScore,
    getLeaderboard
} from './firebase.js';

document.addEventListener("DOMContentLoaded", function () {
    setupMenuButtons();
    showMainMenu(); // Display the main menu with the top score when the page loads
});

/**
 * Sets up event listeners for menu buttons and handles their actions based on the button clicked.
 */
function setupMenuButtons() {
    let buttons = document.getElementsByTagName("button");
    for (let button of buttons) {
        button.addEventListener("click", function () {
            const dataType = this.getAttribute("data-type");
            console.log(`Button clicked: ${dataType}`);
            if (dataType === "play") {
                playGame();
            } else if (dataType === "leaderboard") {
                leaderBoard();
            } else if (dataType === "menu") {
                showMainMenu();
            }
        });
    }
}

/**
 * Displays the main menu and shows the top score from the leaderboard.
 */
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

    // Prepare the main menu content
    const mainMenuContent = `
    <div class="menu-container">
        <h1 class="main-heading">DuckHunt Reloaded</h1>
        <button class="menu-item" data-type="play">Play</button><br>
        <button class="menu-item" data-type="leaderboard">Leaderboard</button><br>
        <h1 id="top-score" class="main-heading">${topScoreText}</h1>
    </div>
    `;

    // Ensure the game area exists and then update its content
    const gameArea = document.getElementById('game-area');
    if (gameArea) {
        gameArea.innerHTML = mainMenuContent;
    } else {
        console.error('game-area element not found!');
        return;
    }

    // Reattach event listeners to the new buttons
    setupMenuButtons();
}

/**
 * Displays the leaderboard with player scores and provides options to play again or return to the main menu.
 */
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
let backgroundImage;

/**
 * Initializes the game, setting up the game area and starting the first level.
 */
function playGame() {
    let gameArea = document.getElementById('game-area');

    // If the gameArea does not exist, create it or ensure it is reinserted
    if (!gameArea) {
        gameArea = document.createElement('div');
        gameArea.id = 'game-area';
        document.body.appendChild(gameArea);
    }

    // Remove the instructions toggle if it exists
    const instructionsToggle = document.getElementById('instructions-toggle');
    if (instructionsToggle) {
        instructionsToggle.remove();
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
    <div id="menu-button-container">
        <button id="back-to-menu" class="menu-item" data-type="menu">Back to Main Menu</button>
    </div>
    <canvas id="gameCanvas" width="800" height="600"></canvas>
    <div id="flash-overlay"></div>
    <div id="game-info">
        <p id="display-score" class="game-info-item">Score: <span id="score">0</span></p>
        <p id="display-level" class="game-info-item">Level: <span id="level">${gameState.level}</span></p>
        <p id="display-misses" class="game-info-item">Misses: <span id="misses">0</span>/<span id="max-misses">${gameState.maxMisses}</span></p>
    </div>
    `;
    gameArea.innerHTML = gameContent;

    // Reattach event listeners to the buttons
    setupMenuButtons();

    // Add event listener to the "Back to Main Menu" button
    const backButton = document.getElementById('back-to-menu');
    if (backButton) {
        backButton.addEventListener('click', function () {
            endGameAndReturnToMenu();
        });
    }

    const canvas = document.getElementById('gameCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        startLevel(gameState, ctx, canvas);

        const flashOverlay = document.getElementById('flash-overlay');

        // Function to handle the screen flash
        function flashScreen() {
            flashOverlay.style.opacity = 1;
            setTimeout(() => {
                flashOverlay.style.opacity = 0;
            }, 70); // Duration of the flash in milliseconds
        }

        // Set up the click handler for shooting ducks
        canvas.onclick = function (event) {
            if (gameState.roundOver || gameState.levelTransitioning) return; // Stop interaction if the round is over or the level hasn't started

            flashScreen(); // Trigger the flash effect

            const gunshot = new Audio('assets/sounds/gunshot.mp3');
            gunshot.volume = 0.5;
            gunshot.play();
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width; // Account for horizontal scaling
            const scaleY = canvas.height / rect.height; // Account for vertical scaling
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

            if (gameState.roundOver || gameState.levelTransitioning) return; // Stop interaction if the round is over or the level hasn't started

            flashScreen(); // Trigger the flash effect

            const gunshot = new Audio('assets/sounds/gunshot.mp3');
            gunshot.volume = 0.5;
            gunshot.play();
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width; // Account for horizontal scaling
            const scaleY = canvas.height / rect.height; // Account for vertical scaling
            const x = (event.touches[0].clientX - rect.left) * scaleX;
            const y = (event.touches[0].clientY - rect.top) * scaleY;

            processHit(x, y, gameState, ctx, canvas);
        });
    } else {
        console.error("Canvas element not found after attempting to create it!");
    }
}

/**
 * Ends the game, clears ongoing processes, and returns to the main menu.
 */
function endGameAndReturnToMenu() {
    // Stop all ongoing game processes
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }

    // Clear intervals and active ducks
    duckIntervals.forEach(interval => clearInterval(interval));
    duckIntervals = [];
    activeDucks = [];

    // Clear the canvas
    const canvas = document.getElementById('gameCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Remove the Next Level button if it exists
    const nextButton = document.querySelector('button[data-role="next-level"]');
    if (nextButton) {
        document.body.removeChild(nextButton);
    }

    // Return to the main menu
    showMainMenu();
}

/**
 * Starts a new level, resetting the game state and spawning the appropriate number of ducks.
 */
let lastTouchTime = 0;


function startLevel(gameState, ctx, canvas) {
    // Reset game state for the new level
    gameState.misses = 0;
    gameState.roundOver = false;
    gameState.levelTransitioning = true; // Set to true during the transition
    activeDucks = []; // Clear active ducks array

    // Update the level display
    document.getElementById("level").innerText = gameState.level;

    // Reset UI elements
    document.getElementById("display-misses").innerHTML = `Misses: <span id="misses">0</span>/<span id="max-misses">${gameState.maxMisses}</span>`;

    // Define the number of ducks for this level
    const ducksPerRound = [6, 12, 18, 24, 30];
    gameState.totalDucks = ducksPerRound[gameState.level - 1];
    gameState.remainingDucks = gameState.totalDucks;

    // Clear the canvas before starting a new level
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Load the background image for the current level
    backgroundImage = new Image();
    backgroundImage.src = `assets/images/background${gameState.level}.jpg`;

    backgroundImage.onload = function() {
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

        // Show "Get ready for Level #" message
        ctx.font = "30px 'Jersey 10', sans-serif";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText(`Get ready for Level ${gameState.level}...`, ctx.canvas.width / 2, ctx.canvas.height / 2);

        // Delay for 3 seconds before starting the level
        setTimeout(() => {
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the message
            ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height); // Redraw the background after clearing
            gameState.levelTransitioning = false; // Allow interactions as the level starts

            spawnDucks(gameState, ctx); // Start spawning ducks
            animationFrameId = requestAnimationFrame(() => drawAllDucks(ctx)); // Start the animation loop

            console.log(`Started Level ${gameState.level}`);
        }, 3000); // 3-second delay for the transition
    };
}


/**
 * Handles the logic when a player clicks or taps to shoot, determining if a duck was hit or missed.
 */
function processHit(x, y, gameState, ctx, canvas) {
    let duckHit = false;
    activeDucks.forEach(duck => {
        // Adjust the hitbox with padding to improve touch accuracy
        const hitboxPadding = 20;
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

/**
 * Checks if the current level should end based on the number of remaining ducks and active ducks.
 */
function checkForEndOfLevel(gameState, ctx, canvas) {
    console.log(`Checking for end of level. Remaining Ducks: ${gameState.remainingDucks}, Active Ducks: ${activeDucks.length}`);
    if (activeDucks.length === 0 && gameState.remainingDucks === 0) {
        if (!gameState.levelTransitioning) {
            console.log("All ducks handled, ending level.");
            endLevel(gameState, ctx, canvas);
        }
    }
}

/**
 * Ends the current level, stops animations, and displays an end-of-level message with options to proceed.
 */
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

    // Determine the appropriate message
    let message;
    if (gameState.misses >= gameState.maxMisses) {
        message = `You missed too many shots! `;
    } else {
        if (gameState.misses === 0) {
            message = `Well done, you didn't miss any shots. `;
        } else if (gameState.misses === 1) {
            message = `Well done, you only missed 1 shot. `;
        } else {
            message = `Well done, you only missed ${gameState.misses} shots. `;
        }
    }

    // Append the appropriate next step
    if (gameState.level < 5) {
        message += `Proceed to the next level!`;
    } else {
        message += `GAME OVER!`;
    }

    // Style and display the message on the canvas
    ctx.font = '30px "Jersey 10", sans-serif'; // Set the custom font
    ctx.fillStyle = '#a87d32'; // Set the background color
    ctx.textAlign = 'center';

    // Display a rectangle behind the text to create a "background" effect
    const textWidth = ctx.measureText(message).width;
    ctx.fillRect((ctx.canvas.width - textWidth) / 2 - 10, ctx.canvas.height / 2 - 70, textWidth + 20, 50);
    ctx.fillStyle = 'black'; // Set the text color
    ctx.fillText(message, ctx.canvas.width / 2, ctx.canvas.height / 2 - 35);

    // Create the button
    const nextButton = document.createElement('button');
    nextButton.classList.add("next-button");
    if (gameState.level < 5) {
        nextButton.innerText = 'Next Level';
    } else {
        nextButton.innerText = 'Add to Leaderboard';
    }
    nextButton.style.position = 'absolute';
    nextButton.style.top = '60%';
    nextButton.style.left = '50%';
    nextButton.style.transform = 'translate(-50%, -50%)';
    nextButton.style.fontSize = '20px';
    nextButton.style.padding = '10px 20px';
    nextButton.style.backgroundColor = '#a87d32';
    nextButton.style.border = 'none';
    nextButton.style.color = '#000';
    nextButton.style.cursor = 'pointer';
    nextButton.style.fontFamily = '"Jersey 10", sans-serif';

    // Set the appropriate action for the button
    nextButton.onclick = function () {
        document.body.removeChild(nextButton);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Clear the canvas before starting the next level
        if (gameState.level < 5) {
            nextLevel(gameState, ctx, canvas); // Proceed to the next level
        } else {
            gameOver(gameState); // End the game and add to leaderboard
        }
    };

    document.body.appendChild(nextButton);
}

/**
 * Spawns ducks based on the current level and handles their movement and behavior.
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
 * Creates a duck object with properties based on the current level, including size, speed, and movement direction.
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
 * Handles the animation of each duck, including movement, wall bouncing, and removal when out of bounds or dead.
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
 * Draws all active ducks on the canvas, ensuring smooth animation and background rendering.
 */
function drawAllDucks(ctx) {
    const canvas = ctx.canvas;

    // Clear the entire canvas before drawing the new frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Redraw the background image
    if (backgroundImage) {
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    }

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
 * Draws a single duck on the canvas, handling both live and dead states with appropriate sprites.
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
 * Proceeds to the next level, resetting the game state and displaying a transition message.
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

        function showLevelUpMessage(level) {
            // Set up the background for the message
            ctx.fillStyle = "#a87d32"; // Background color
            const padding = 20;
            const text = `Get ready for Level ${level}...`;
            ctx.font = "30px 'Jersey 10', sans-serif"; // Custom font
            const textWidth = ctx.measureText(text).width;
            const textHeight = 40; // Estimated height based on font size

            // Draw background rectangle
            ctx.fillRect(
                ctx.canvas.width / 2 - textWidth / 2 - padding,
                ctx.canvas.height / 2 - textHeight / 2 - padding / 2,
                textWidth + padding * 2,
                textHeight + padding
            );

            // Draw the text over the background
            ctx.fillStyle = "black";
            ctx.textAlign = "center";
            ctx.fillText(
                text,
                ctx.canvas.width / 2,
                ctx.canvas.height / 2 + textHeight / 4
            );
        }

        // Call this function whenever the player progresses to the next level
        showLevelUpMessage(gameState.level);



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
 * Ends the game, prompts the user for a username to save the score, and displays the leaderboard.
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
                leaderBoard(); // Redirect to leaderboard even if saving fails
            });
        } else {
            // If no username is provided, just show the leaderboard
            alert("No username entered. Your score was not saved.");
            leaderBoard();
        }
    } else {
        console.error("Invalid score value. Game Over skipped score save.");
        leaderBoard(); // Redirect to leaderboard even if the score is invalid
    }
}
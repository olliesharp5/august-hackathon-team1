import { saveScore, getLeaderboard, testFirestoreConnection } from '/assets/javascript/firebase.js';

// Initialize game state variables
let level = 0; // Current level of the game
let remainingDucks = 0; // Number of ducks left to hit in the current level
let misses = 0; // Number of misses by the player
let maxMisses = 3; // Maximum number of misses allowed before game over
let score = 0; // Player's score

// Reticle variables
const reticle = {
    x: 0, // x-coordinate of the reticle
    y: 0, // y-coordinate of the reticle
    size: 50 // Size of the reticle
};
const reticleImage = new Image();
reticleImage.src = '/path/to/reticle-image.png'; // Replace with the actual path to your reticle image

/**
 * This function initializes Firebase connection and game setup:
 * - Tests the Firestore connection
 * - Initializes music controls
 */
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const testDocId = await testFirestoreConnection();
        console.log(`Firestore is connected. Test document ID: ${testDocId}`);
    } catch (error) {
        console.error("Failed to connect to Firestore:", error);
    }

    // Initialize music controls
    initMusicControls();
});

/**
 * This function generates a random integer between min and max (inclusive):
 * - Ensures the generated number is within the specified range
 */
const getRandomInteger = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * This function initializes music controls:
 * - Toggles play/pause of the background music
 * - Shuffles the music to play a random track
 */
function initMusicControls() {
    const music = document.getElementById("bg-audio");
    const playToggle = document.getElementById("playToggle");
    const shuffleButton = document.getElementById("shuffleButton");

    const pauseIcon = `<svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm9-3a1 1 0 1 0-2 0v6a1 1 0 1 0 2 0V9Zm4 0a1 1 0 1 0-2 0v6a1 1 0 1 0 2 0V9Z" clip-rule="evenodd"/></svg>`;
    const playIcon = `<svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M8.6 5.2A1 1 0 0 0 7 6v12a1 1 0 0 0 1.6.8l8-6a1 1 0 0 0 0-1.6l-8-6Z" clip-rule="evenodd"/></svg>`;
    
    // Toggle play/pause on button click
    playToggle.addEventListener("click", function () {
        if (music.paused) {
            music.play();
            playToggle.innerHTML = pauseIcon;
        } else {
            music.pause();
            playToggle.innerHTML = playIcon;
        }
    });

    // Shuffle music on button click
    shuffleButton.addEventListener("click", function () {
        const numSongs = 5; // Number of music files
        const currentSong = getRandomInteger(1, numSongs + 1); 
        console.log(currentSong);
        music.pause();
        music.src = `/assets/sounds/bgmusic${currentSong}.mp3`;  
        music.play();
    });
}

/**
 * This function sets up menu buttons:
 * - Starts the game when the "Play" button is clicked
 * - Displays the leaderboard when the "Leaderboard" button is clicked
 */
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("button[data-type]").forEach(button => {
        button.addEventListener("click", function () {
            if (this.getAttribute("data-type") === "play") {
                playGame();
            } else if (this.getAttribute("data-type") === "leaderboard") {
                leaderBoard();
            }
        });
    });
});

/**
 * This function starts the game:
 * - Replaces the body content with the game canvas and score information
 * - Calls the function to start the first level
 */
function playGame() {
    let gameContent = `
    <main>
        <canvas id="gameCanvas" width="800" height="600"></canvas>
        <p>Score: <span id="score">0</span></p>
        <p>Misses: <span id="misses">0</span>/<span id="max-misses">${maxMisses}</span></p>
    </main>
    `;
    document.body.innerHTML = gameContent;
    startLevel();
}

/**
 * This function handles the leaderboard:
 * - Fetches leaderboard data
 * - Displays the leaderboard with player scores
 * - Provides an option to play the game again
 */
async function leaderBoard() {
    try {
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
    } catch (error) {
        console.error("Failed to load leaderboard:", error);
    }
}

/**
 * This function starts a new level:
 * - Resets level and game state
 * - Spawns ducks for the current level
 */
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
 * This function spawns a new duck:
 * - Sets up the duck with position, speed, and animation
 * - Draws the duck and handles its movement and collisions
 */
function spawnDuck() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return; // Ensure canvas exists
    const ctx = canvas.getContext('2d');

    const duckImage = new Image();
    duckImage.src = '/path/to/your/duck-spritesheet.png'; // Replace with the actual path to your sprite sheet

    let duck = {
        x: 0,
        y: Math.random() * (canvas.height - 50),
        size: 50,
        speed: 3 + level,
        direction: 1, // 1 means moving right, -1 means moving left
        bounces: 0,
        currentFrame: 0,
        totalFrames: 4, // Assuming 4 frames in the sprite sheet
        frameCounter: 0,
        frameSpeed: 10, // Number of intervals between frame updates
        spriteWidth: 50, // Width of a single frame in the sprite sheet
        spriteHeight: 50, // Height of the sprite
    };

    function drawDuck() {
        // Clear the previous duck position
        ctx.clearRect(duck.x - duck.speed * duck.direction, duck.y, duck.size, duck.size);

        // Calculate the source x position of the current frame in the sprite sheet
        const srcX = duck.currentFrame * duck.spriteWidth;

        // Draw the current frame of the duck
        ctx.drawImage(
            duckImage, // The image object containing the sprite sheet
            srcX, // Source x position in the sprite sheet
            0, // Source y position (assuming the sprite sheet is a single row)
            duck.spriteWidth, // Width of the frame in the sprite sheet
            duck.spriteHeight, // Height of the frame in the sprite sheet
            duck.x, // Destination x position on the canvas
            duck.y, // Destination y position on the canvas
            duck.size, // Width of the frame on the canvas
            duck.size // Height of the frame on the canvas
        );
    }

    const interval = setInterval(() => {
        // Update duck position
        duck.x += duck.speed * duck.direction;

        // Handle wall collisions
        if (duck.x <= 0 || duck.x + duck.size >= canvas.width) {
            duck.direction *= -1; // Reverse direction
            duck.bounces++;

                        // Check if duck should leave the area
                        if (duck.bounces >= 3) {
                            clearInterval(interval); // Duck leaves after 3 bounces
                            remainingDucks--;
            
                            if (remainingDucks > 0) {
                                spawnDuck(); // Spawn a new duck
                            } else {
                                levelUp(); // Level up when all ducks are handled
                            }
                            return;
                        }
                    }
            
                    // Handle sprite animation
                    duck.frameCounter++;
                    if (duck.frameCounter >= duck.frameSpeed) {
                        duck.currentFrame = (duck.currentFrame + 1) % duck.totalFrames;
                        duck.frameCounter = 0;
                    }
            
                    // Redraw the duck
                    drawDuck();
            
                }, 1000 / 60); // 60 frames per second
            
                /**
                 * Handles shooting logic:
                 * - Checks if the click hits the duck
                 * - Updates score and remaining ducks
                 * - Spawns a new duck or levels up based on the result
                 */
                canvas.addEventListener('click', function shootDuck(event) {
                    const rect = canvas.getBoundingClientRect();
                    const x = event.clientX - rect.left;
                    const y = event.clientY - rect.top;
                    if (x >= duck.x && x <= duck.x + duck.size && y >= duck.y && y <= duck.y + duck.size) {
                        score += 10;
                        document.getElementById('score').textContent = score;
                        remainingDucks--;
            
                        clearInterval(interval); // Clear the interval on duck hit
            
                        if (remainingDucks > 0) {
                            spawnDuck(); // Spawn a new duck
                        } else {
                            levelUp(); // Continue to the next level
                        }
                    } else {
                        missDuck(); // Handle miss
                    }
                }, { once: true }); // Ensure the click event only triggers once per duck
            
                // Draw the reticle initially
                drawReticle();
            }
            
            /**
             * This function handles leveling up:
             * - Increases the level
             * - Spawns additional ducks for the new level
             */
            function levelUp() {
                level++;
                remainingDucks = 3 + level;
                spawnDuck();
            }
            
            /**
             * This function ends the game:
             * - Saves the score
             * - Displays an alert with the final score
             * - Displays the leaderboard
             */
            function gameOver() {
                saveScore(score).then(() => {
                    alert(`Game Over! Your score: ${score}`);
                    leaderBoard();
                }).catch(error => {
                    console.error("Failed to save score:", error);
                });
            }
            
            /**
             * This function draws the reticle on the canvas:
             * - Clears the previous reticle drawing
             * - Draws the reticle at its current position
             */
            function drawReticle() {
                const canvas = document.getElementById('gameCanvas');
                if (!canvas) return; // Ensure canvas exists
                const ctx = canvas.getContext('2d');
            
                // Clear previous reticle drawing
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            
                // Draw the reticle
                ctx.drawImage(
                    reticleImage, // The image object containing the reticle
                    reticle.x - reticle.size / 2, // Center the reticle on the cursor
                    reticle.y - reticle.size / 2, // Center the reticle on the cursor
                    reticle.size, // Width of the reticle
                    reticle.size  // Height of the reticle
                );
            }
            
            /**
             * This function updates the reticle position based on mouse movement:
             * - Calculates the new position of the reticle
             * - Redraws the reticle at the new position
             */
            function updateReticlePosition(event) {
                const canvas = document.getElementById('gameCanvas');
                if (!canvas) return; // Ensure canvas exists
                const rect = canvas.getBoundingClientRect();
                reticle.x = event.clientX - rect.left;
                reticle.y = event.clientY - rect.top;
            
                drawReticle(); // Redraw the reticle at the new position
            }
            
            // Initialize reticle and add event listener to update its position
            document.addEventListener('mousemove', updateReticlePosition);
            
            /**
             * This function handles when the player misses a duck:
             * - Increments the miss count
             * - Ends the game if the maximum number of misses is reached
             * - Spawns a new duck if misses are within the limit
             */
            function missDuck() {
                misses++;
                document.getElementById('misses').textContent = misses;
            
                if (misses >= maxMisses) {
                    gameOver(); // End the game if misses exceed the limit
                } else {
                    spawnDuck(); // Spawn a new duck
                }
            }
            
            // Initialize the game on page load
            document.addEventListener("DOMContentLoaded", () => {
                // Set initial state or perform other initialization here
                // For example, display the main menu or intro screen.
            });
            
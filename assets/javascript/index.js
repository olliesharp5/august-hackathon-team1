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
    document.body.innerHTML = gameContent;
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
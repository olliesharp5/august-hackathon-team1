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

//Menu
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
    })
}
});

function playGame() {
    console.log("you have clicked playgame");
}

function leaderBoard() {
    console.log("you have clicked leaderboard");
}
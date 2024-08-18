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
    volumeControl.value = 50;
  
    // Set initial icons based on autoplay
    if (music.muted) {
      volumeToggle.innerHTML = playIcon;
    } else {
      volumeToggle.innerHTML = notMutedIcon;
    }
  
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

  document.addEventListener("DOMContentLoaded", function () {
    const instructionsToggle = document.getElementById("instructions-toggle");
    const instructions = document.getElementById("instructions");
    const closeButton = document.getElementById("close-button");

    instructionsToggle.addEventListener("click", function () {
      instructions.classList.toggle("hidden");
    
    closeButton.addEventListener("click", function () {
      instructions.classList.add("hidden");
    });
    });
  });
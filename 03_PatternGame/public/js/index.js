$(document).ready(function () {
  // Define an array of possible colors for the sequence
  const colors = ["green", "red", "yellow", "blue"];
  // Initialize the color sequence array
  let color_sequence = [];
  // Variable to track the current step in the user's input
  let step = 0;
  // Boolean to check if the game has started
  let started = false;

  // Function to add a new random color to the sequence
  function addNewColorToSequence() {
    // Generate a random index to select a color
    const randomIndex = Math.floor(Math.random() * colors.length);
    // Get the color corresponding to the random index
    const newColor = colors[randomIndex];
    // Add the selected color to the sequence
    color_sequence.push(newColor);

    // Update the level displayed on the page
    $("#page-message").text("Level " + color_sequence.length);

    // Loop through the sequence to flash the colors
    color_sequence.forEach((color, i) => {
      // Calculate when to start and stop the flash
      const flash_start = i * 600;
      const flash_stop = flash_start + 400;

      // Set a timeout to add the 'flash' class (change color) after a delay. This is to indicate which colors to be memorized
      setTimeout(() => {
        $(`#${color}`).addClass("flash");
      }, flash_start);

      // Set a timeout to remove the 'flash' class after a delay
      setTimeout(() => {
        $(`#${color}`).removeClass("flash");
        // Once the sequence is finished flashing, allow user interaction.
        // If this is not done, then the user can click while colors are flashing. This step blocks the user from interrupting.
        if (i == color_sequence.length - 1) {
          started = true;
        }
      }, flash_stop);
    });
  }

  function resetGame() {
    // Clear the color sequence
    color_sequence = [];
    // Reset the step counter
    step = 0;
    // Reset the game state
    max_steps = 0;
    started = false;
    // Update the page message to indicate the game is over
    $("#page-message").text("Game Over! Press Any Key to Restart");
  }

  // Function to handle user button clicks
  function buttonClick() {
    // Only process clicks if the game has started
    if (started) {
      const color = $(this).attr("id");

      // Check if the clicked color matches the expected color in the sequence
      if (color_sequence[step] === color) {
        // If correct, increment the step counter
        step++;
        // If the user has completed the sequence
        if (step >= color_sequence.length) {
          // Temporarily stop interaction
          started = false;
          // Reset the step counter
          step = 0;
          // Add a new color to the sequence after a delay.This will show new color sequence to the player
          setTimeout(addNewColorToSequence, 1000);
        }
        // Flash the correct color briefly when clicked
        $(`#${color}`).addClass("flash-correct");
        setTimeout(() => {
          $(`#${color}`).removeClass("flash-correct");
        }, 200);
      } else {
        // If the clicked color is incorrect, flash the 'wrong' indication
        $(`#${color}`).addClass("flash-wrong");
        setTimeout(() => {
          $(`#${color}`).removeClass("flash-wrong");
        }, 500);
        // Reset the game after a wrong input
        resetGame();
      }
    }
  }

  // Start the game when any key is pressed
  $(document).on("keypress", () => {
    // Start the game only if it hasn't already started
    if (!started) {
      started = true;
      addNewColorToSequence();
    }
  });

  // Attach the button click handler to all elements with class 'button'
  $(".button").on("click", buttonClick);
});

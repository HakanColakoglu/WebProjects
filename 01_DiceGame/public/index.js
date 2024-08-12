// Images
const diceImages = [
    "images/dice_face_1.png",
    "images/dice_face_2.png",
    "images/dice_face_3.png",
    "images/dice_face_4.png",
    "images/dice_face_5.png",
    "images/dice_face_6.png"
];

function rollDice() {
    // Generate random numbers between 1 and 6
    const randomNumber1 = Math.floor(Math.random() * 6);
    const randomNumber2 = Math.floor(Math.random() * 6);

    document.querySelectorAll("img")[0].setAttribute("src", diceImages[randomNumber1]);
    document.querySelectorAll("img")[1].setAttribute("src", diceImages[randomNumber2]);

    // Display the winner
    if (randomNumber1 > randomNumber2) {
        document.querySelector("h1").innerHTML = "Player 1 Wins!";
    } else if (randomNumber2 > randomNumber1) {
        document.querySelector("h1").innerHTML = "Player 2 Wins!";
    } else {
        document.querySelector("h1").innerHTML = "It's a Draw!";
    }
}

// Call rollDice function on page load
rollDice();

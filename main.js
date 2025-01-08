let humanScore = 0;
let computerScore = 0;

menu();
for (let i = 0; i < 5; i++) {
	playGame();
}
endGame();

function menu() {
	alert("Welcome to Rock, Paper, Scissors!\nPress any key to start the game.");
}

function endGame() {
	alert(
		`Game Over!\nFinal Score: You ${humanScore} - Computer ${computerScore}`,
	);
}

function getComputerChoice() {
	const choices = ["rock", "paper", "scissors"];
	const randomIndex = Math.floor(Math.random() * choices.length);
	return choices[randomIndex];
}

function getHumanChoice() {
	let option;
	do {
		option = prompt("Enter your choice:\n1. Rock\n2. Paper\n3. Scissors");
		switch (option) {
			case "1":
				return "rock";
			case "2":
				return "paper";
			case "3":
				return "scissors";
			default:
				alert("Invalid option. Please enter 1, 2, or 3.");
		}
	} while (true);
}

function playRound(humanChoice, computerChoice) {
	if (humanChoice === computerChoice) {
		return "It's a tie!";
	}

	const winConditions = {
		rock: "scissors",
		paper: "rock",
		scissors: "paper",
	};

	if (computerChoice === winConditions[humanChoice]) {
		humanScore++;
		return `You win! ${humanChoice} beats ${computerChoice}`;
	} else {
		computerScore++;
		return `You lose! ${computerChoice} beats ${humanChoice}`;
	}
}

function playGame() {
	const humanSelection = getHumanChoice();
	const computerSelection = getComputerChoice();

	const result = playRound(humanSelection, computerSelection);
	alert(`${result}\nScore: You ${humanScore} - Computer ${computerScore}`);
}

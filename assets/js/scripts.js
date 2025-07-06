document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menu-toggle");
  const currentQuestionElement = document.getElementById("currentQuestion");

  menuToggle?.addEventListener("click", () =>
    menuToggle.classList.toggle("open")
  );

  document.querySelectorAll(".category-btn").forEach((button) => {
    button.addEventListener("click", (event) => {
      currentCategory = event.target.textContent.trim();
      startQuiz(currentCategory);
    });
  });

  document.getElementById("start-quiz").addEventListener("click", function () {
    document.querySelector("#quiz-interface h2").textContent = "";

    document
      .querySelectorAll(".instructions")
      .forEach((el) => el.classList.add("hidden"));

    document.getElementById("category-selection").classList.add("hidden");
    this.classList.add("hidden");

    currentQuestionIndex = 0;
    score = 0;

    currentQuestionElement.classList.remove("hidden");
    document.getElementById("score-container").classList.remove("hidden");
    document.getElementById("answerChoices").classList.remove("hidden");
    document.getElementById("timer-container").classList.remove("hidden");

    displayQuestion(questions[currentQuestionIndex]);
  });

  document
    .getElementById("retake-quiz-intro")
    .addEventListener("click", retakeQuiz);
  document
    .getElementById("retake-quiz-results")
    .addEventListener("click", retakeQuiz);

  document
    .getElementById("next-question")
    .addEventListener("click", function () {
      if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        displayQuestion(questions[currentQuestionIndex]);
      } else {
        endQuiz();
      }
    });
});

// Initialize quiz
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let currentCategory = "";
let timer;
let timeLeft;
let currentDifficulty = 'medium';



/**
 * Starts the quiz for the given category.
 */
async function startQuiz(category) {
  showLoading();
  if (!category) {
    alert("Please select a category first.");
    return;
  }

  document.querySelector(".quiz-intro").classList.add("hidden");
  document
    .querySelectorAll(".instructions")
    .forEach((el) => el.classList.remove("hidden"));

  currentQuestionIndex = 0;
  score = 0;
  currentCategory = category;

  try {
    questions = await fetchQuestions(category);

    const quizInterface = document.getElementById("quiz-interface");
    const categorySelection = document.getElementById("category-selection");

    if (questions.length > 0) {
      document.getElementById("start-quiz").classList.remove("hidden");
      document.getElementById("retake-quiz-intro").classList.remove("hidden");
      quizInterface.classList.remove("hidden");
      categorySelection.classList.add("hidden");
    } else {
      alert(
        "No questions available for this category. Please choose another category."
      );
      quizInterface.classList.add("hidden");
      categorySelection.classList.remove("hidden");
    }
  } catch (error) {
    console.error("Error fetching questions:", error);
    alert("An error occurred while fetching quiz questions. Please try again.");
  }
  document.getElementById("retake-quiz-results").classList.remove("hidden");
}

/**
 * Fetches quiz questions based on the selected category.
 */
async function fetchQuestions(categoryName) {
  try {
    const response = await fetch("assets/js/questions.json");
    const questions = await response.json();
    return questions.filter(q => q.category === categoryName);
  } catch (error) {
    console.error("Fetch error: ", error);
    return [];
  }
}

/**
 * Updates the progress bar based on the current progress of the quiz.
 */
function updateProgressBar() {
  const progressBar = document.getElementById("progress-bar");

  if (!progressBar) {
    console.error("Progress bar element not found");
    return;
  }

  const progressPercentage =
    ((currentQuestionIndex + 1) / questions.length) * 100;
  progressBar.style.width = `${progressPercentage}%`;
}

/**
 * Displays the current question and its answer choices.
 */
function displayQuestion(question) {
  const currentQuestionElement = document.getElementById("currentQuestion");
  const answerChoicesContainer = document.getElementById("answerChoices");

  if (!currentQuestionElement || !answerChoicesContainer) {
    console.error(
      "Required elements for displaying the question are not found in the DOM"
    );
    return;
  }

  currentQuestionElement.innerHTML = question.question;

  answerChoicesContainer.innerHTML = "";

  const answers = shuffleArray([
    question.answer,
    ...question.options.filter(o => o !== question.answer),
  ]);

  const choiceLetters = ["A", "B", "C", "D"];
  answers.forEach((answer, index) => {
    const answerButton = document.createElement("button");
    answerButton.className = "answer-button";
    answerButton.textContent = `${choiceLetters[index]}. ${answer}`;
    answerButton.addEventListener("click", () =>
      handleAnswerSelection(answer, question.answer)
    );
    answerChoicesContainer.appendChild(answerButton);
  });

  document.getElementById("score-container").classList.remove("hidden");
  document.getElementById("currentQuestion").classList.remove("hidden");
  document.getElementById("answerChoices").classList.remove("hidden");
  document.getElementById("progressBar-container").classList.remove("hidden");

  updateProgressBar();

  clearInterval(timer);
  startTimer();
}



/**
 * Shuffles an array in place.
 */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Handles the logic when an answer is selected.
 */
function handleAnswerSelection(selectedAnswer, correctAnswer) {
  clearInterval(timer);
  const answerButtons = document.querySelectorAll(".answer-button");
  const currentScoreElement = document.getElementById("currentScore");

  answerButtons.forEach((button) => {
    button.disabled = true;

    if (button.textContent.includes(selectedAnswer)) {
      if (selectedAnswer === correctAnswer) {
        const points = 50 + (timeLeft * 2);
        score += points;
        if (currentScoreElement) {
          currentScoreElement.textContent = `${score}`;
        }
        button.classList.add("correct-answer");
        playSound('correct');
      } else {
        button.classList.add("incorrect-answer");
        playSound('incorrect');
      }
    }
  });

  document.getElementById("next-question").classList.remove("hidden");
}

/**
 * Moves to the next quiz question or ends the quiz if all questions are answered.
 */
function nextQuestion() {
  if (currentQuestionIndex < questions.length - 1) {
    currentQuestionIndex++;
    displayQuestion(questions[currentQuestionIndex]);
    resetAnswerButtons();
  } else {
    endQuiz();
  }
}

/**
 * Resets the answer buttons to their initial state and hides the 'Next Question' button.
 */
function resetAnswerButtons() {
  const answerButtons = document.querySelectorAll(".answer-button");
  answerButtons.forEach((button) => {
    button.disabled = false;
    button.classList.remove("correct-answer", "incorrect-answer");
  });
  document.getElementById("next-question").classList.add("hidden");
}

/**
 * Ends the quiz, hides the quiz interface, and shows the results.
 */
function endQuiz() {
  const quizInterface = document.getElementById("quiz-interface");
  const resultsSection = document.getElementById("results");

  if (quizInterface && resultsSection) {
    quizInterface.classList.add("hidden");
    resultsSection.classList.remove("hidden");

    let feedbackMessage;
    if (score / questions.length === 1) {
      feedbackMessage = "Perfect score! You're a trivia master!";
    } else if (score / questions.length >= 0.7) {
      feedbackMessage = "Great job! You have a strong grasp on these topics.";
    } else if (score / questions.length >= 0.5) {
      feedbackMessage = "Not bad! A little more study and you'll be on top.";
    } else {
      feedbackMessage = "Keep practicing and you'll improve.";
    }

    resultsSection.innerHTML = `<h2>Your Results</h2>
    <p id="results-text">You got ${score} out of ${questions.length}. ${feedbackMessage}</p>
    <button id="retake-quiz-results">Retake Quiz</button>
    <button id="choose-new-category">Choose New Category</button>`;

    document
      .getElementById("retake-quiz-results")
      .addEventListener("click", retakeQuiz);
    document
      .getElementById("choose-new-category")
      .addEventListener("click", chooseNewCategory);
  }
  resetQuiz();
  document.getElementById("retake-quiz-intro").classList.add("hidden");
}

/**
 * Resets the quiz to its initial state, clearing the previous questions and resetting the score.
 */
function resetQuiz() {
  score = 0;
  currentQuestionIndex = 0;
  questions = [];

  const scoreElement = document.getElementById("currentScore");
  if (scoreElement) {
    scoreElement.textContent = `Score: ${score}`;
  }

  const progressBarContainer = document.getElementById("progressBar-container");
  if (progressBarContainer) {
    progressBarContainer.classList.add("hidden");
  }

  const currentQuestionElement = document.getElementById("currentQuestion");
  const answerChoicesContainer = document.getElementById("answerChoices");
  if (currentQuestionElement && answerChoicesContainer) {
    currentQuestionElement.textContent = "";
    answerChoicesContainer.innerHTML = "";
  }

  document.getElementById("retake-quiz-intro").classList.add("hidden");
}

/**
 * Handles the retaking of the quiz. Resets the quiz and starts it again with the same category.
 */
function retakeQuiz() {
  resetQuiz();
  const quizIntro = document.querySelector(".quiz-intro");
  const startQuizButton = document.getElementById("start-quiz");

  if (quizIntro && startQuizButton) {
    quizIntro.classList.remove("hidden");
    startQuizButton.classList.remove("hidden");
  }

  const resultsSection = document.getElementById("results");
  if (resultsSection) {
    resultsSection.classList.add("hidden");
  }

  const nextQuestionButton = document.getElementById("next-question");
  if (nextQuestionButton) {
    nextQuestionButton.classList.add("hidden");
  }

  startQuiz(currentCategory);
  document.getElementById("retake-quiz-intro").classList.add("hidden");
  document.getElementById("retake-quiz-results").classList.add("hidden");
}

/**
 * Handles the action of choosing a new category after a quiz is completed or during a quiz.
 */
function chooseNewCategory() {
  resetQuiz();

  document.getElementById("results").classList.add("hidden");

  document.getElementById("category-selection").classList.remove("hidden");
  document.querySelector(".quiz-intro").classList.remove("hidden");
  document.getElementById("start-quiz").classList.remove("hidden");

  document.getElementById("score-container").classList.add("hidden");
  document.getElementById("next-question").classList.add("hidden");
}

function startTimer() {
  timeLeft = 30;
  const timerElement = document.getElementById('timer');
  
  timer = setInterval(() => {
    timeLeft--;
    timerElement.textContent = timeLeft;
    
    if (timeLeft <= 0) {
      clearInterval(timer);
      handleTimeUp();
    }
  }, 1000);
}

function handleTimeUp() {
  const answerButtons = document.querySelectorAll('.answer-button');
  answerButtons.forEach(button => button.disabled = true);
  
  // Show correct answer
  const currentQuestion = questions[currentQuestionIndex];
  answerButtons.forEach(button => {
    if (button.textContent.includes(currentQuestion.answer)) {
      button.classList.add('correct-answer');
    }
  });
  
  document.getElementById('next-question').classList.remove('hidden');
}

function updateApiUrl(categoryId) {
  return `https://opentdb.com/api.php?amount=10&category=${categoryId}&difficulty=${currentDifficulty}&type=multiple`;
}

function updateScore() {
  const scoreElement = document.getElementById('currentScore');
  scoreElement.classList.add('score-update');
  scoreElement.textContent = score;
  
  setTimeout(() => {
    scoreElement.classList.remove('score-update');
  }, 500);
}

function saveHighScore() {
  const highScores = JSON.parse(localStorage.getItem('highScores')) || {};
  
  if (!highScores[currentCategory] || score > highScores[currentCategory]) {
    highScores[currentCategory] = score;
    localStorage.setItem('highScores', JSON.stringify(highScores));
    return true;
  }
  return false;
}

function displayHighScore() {
  const highScores = JSON.parse(localStorage.getItem('highScores')) || {};
  const categoryHighScore = highScores[currentCategory] || 0;
  
  return `<p>High Score: ${categoryHighScore}</p>`;
}

function showLoading() {
  const loadingHTML = `
    <div class="loading-spinner">
      <div class="spinner"></div>
      <p>Loading questions...</p>
    </div>
  `;
  
  document.getElementById('quiz-interface').innerHTML = loadingHTML;
}

const sounds = {
  correct: new Audio('assets/sounds/correct.mp3'),
  incorrect: new Audio('assets/sounds/incorrect.mp3'),
  gameOver: new Audio('assets/sounds/game-over.mp3')
};

function playSound(type) {
  sounds[type].play();
}

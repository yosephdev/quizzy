document.addEventListener("DOMContentLoaded", () => {
  // DOM elements
  const menuToggle = document.getElementById("menu-toggle");
  const currentQuestionElement = document.getElementById("currentQuestion");

  // Event listeners for menu toggle
  menuToggle?.addEventListener("click", () =>
    menuToggle.classList.toggle("open")
  );

  // Event listeners for category buttons
  document.querySelectorAll(".category-btn").forEach((button) => {
    button.addEventListener("click", (event) => {
      currentCategory = event.target.textContent.trim();
      startQuiz(currentCategory);
    });
  });

  // Event listener for Start Quiz button
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
    document.getElementById("progressBar-container").classList.remove("hidden");

    displayQuestion(questions[currentQuestionIndex]);
  });

  // Event listener for Next Question button
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

/**
 * Maps category names to their corresponding category IDs used in the quiz API.
 * @param {string} categoryName - The name of the category.
 * @returns {number} The ID corresponding to the given category name.
 */
function getCategoryId(categoryName) {
  const categories = {
    Science: 17,
    Math: 19,
    History: 23,
    Literature: 10,
    Technology: 18,
    Geography: 22,
    Arts: 25,
    Sports: 21,
  };

  return categories[categoryName] || 17;
}

/**
 * Starts the quiz for the given category.
 * @param {string} category - The category of the quiz.
 */
async function startQuiz(category) {
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
}

/**
 * Fetches quiz questions based on the selected category.
 * @param {string} categoryName - The name of the selected quiz category.
 * @returns {Promise<Object[]>} - A promise that resolves to an array of question objects.
 */
async function fetchQuestions(categoryName) {
  const categoryId = getCategoryId(categoryName);

  const apiURL = `https://opentdb.com/api.php?amount=10&category=${categoryId}&type=multiple`;

  try {
    const response = await fetch(apiURL);
    const data = await response.json();

    if (data.response_code === 0) {
      return data.results;
    } else {
      console.error("API response error: ", data);
      return [];
    }
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
 * @param {Object} question - The question object to display.
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

  currentQuestionElement.innerHTML = decodeHtml(question.question);

  answerChoicesContainer.innerHTML = "";

  const answers = shuffleArray([
    question.correct_answer,
    ...question.incorrect_answers,
  ]);

  const choiceLetters = ["A", "B", "C", "D"];
  answers.forEach((answer, index) => {
    const answerButton = document.createElement("button");
    answerButton.className = "answer-button";
    answerButton.textContent = `${choiceLetters[index]}. ${decodeHtml(answer)}`;
    answerButton.addEventListener("click", () =>
      handleAnswerSelection(answer, question.correct_answer)
    );
    answerChoicesContainer.appendChild(answerButton);
  });

  document.getElementById("score-container").classList.remove("hidden");
  document.getElementById("currentQuestion").classList.remove("hidden");
  document.getElementById("answerChoices").classList.remove("hidden");
  document.getElementById("progressBar-container").classList.remove("hidden");

  updateProgressBar();
}

/**
 * Decodes HTML entities in a given string.
 * @param {string} html - The string with HTML entities.
 * @returns {string} - The decoded string.
 */
function decodeHtml(html) {
  var txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

/**
 * Shuffles an array in place.
 * @param {Array} array - The array to shuffle.
 * @returns {Array} - The shuffled array.
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
 * @param {string} selectedAnswer - The answer selected by the user.
 * @param {string} correctAnswer - The correct answer for the current question.
 */
function handleAnswerSelection(selectedAnswer, correctAnswer) {
  const answerButtons = document.querySelectorAll(".answer-button");
  const currentScoreElement = document.getElementById("currentScore");

  answerButtons.forEach((button) => {
    button.disabled = true;

    if (button.textContent.includes(selectedAnswer)) {
      if (selectedAnswer === correctAnswer) {
        score++;
        if (currentScoreElement) {
          currentScoreElement.textContent = `${score}`;
        }
        button.classList.add("correct-answer");
      } else {
        button.classList.add("incorrect-answer");
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
  const resultsText = document.getElementById("results-text");

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
    <button id="retake-quiz">Retake Quiz</button>
    <button id="choose-new-category">Choose New Category</button>`;

    document
      .getElementById("retake-quiz")
      .addEventListener("click", retakeQuiz);
    document
      .getElementById("choose-new-category")
      .addEventListener("click", chooseNewCategory);
  }
  resetQuiz();
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

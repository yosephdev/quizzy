document.addEventListener("DOMContentLoaded", () => {
    // DOM elements
    const menuToggle = document.getElementById("menu-toggle");   

    // Event listeners for menu toggle and navigation links
    menuToggle?.addEventListener("click", () => menuToggle.classList.toggle("open"));    

    // Event listeners for category buttons
    document.querySelectorAll(".category-btn").forEach((button) => {
        button.addEventListener("click", (event) => {
            console.log("Category button clicked:", event.target.textContent.trim());
            currentCategory = event.target.textContent.trim();
            startQuiz(currentCategory);
        });
    });

    // Event listener for Start Quiz button - Show quiz elements and display the first question
    document.getElementById("start-quiz").addEventListener("click", function () {
        this.classList.add("hidden"); // Hide the Start Quiz button
        document.getElementById("score-container").classList.remove("hidden"); // Show score container
        document.getElementById("currentQuestion").classList.remove("hidden"); // Show current question
        document.getElementById("answerChoices").classList.remove("hidden"); // Show answer choices
        document.getElementById("progressBar-container").classList.remove("hidden"); // Show progress bar
        displayQuestion(questions[currentQuestionIndex]); // Display the first question
    });

    document.getElementById("start-quiz").addEventListener("click", function () {
        this.classList.add("hidden"); // Hide the Start Quiz button
        document.getElementById("score-container").classList.remove("hidden"); // Show score container
        document.getElementById("currentQuestion").classList.remove("hidden"); // Show current question
        document.getElementById("answerChoices").classList.remove("hidden"); // Show answer choices
        document.getElementById("progressBar-container").classList.remove("hidden"); // Show progress bar
        displayQuestion(questions[currentQuestionIndex]); // Display the first question
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
    // Mapping of category names to their respective category IDs
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

    // Return the category ID for the given category name or default to Science (ID 17) if not found
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

    currentQuestionIndex = 0;
    score = 0;
    currentCategory = category;

    try {
        questions = await fetchQuestions(category);

        const quizInterface = document.getElementById("quiz-interface");
        const categorySelection = document.getElementById("category-selection");

        if (questions.length > 0) {
            // Hide the Start Quiz button now that the quiz is starting
            document.getElementById("start-quiz").classList.remove("hidden"); // Show start button
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
    // Get the category ID based on the category name
    const categoryId = getCategoryId(categoryName);

    // Construct the URL for fetching questions
    const apiURL = `https://opentdb.com/api.php?amount=10&category=${categoryId}&type=multiple`;

    try {
        // Fetch questions from the API
        const response = await fetch(apiURL);
        const data = await response.json();

        // Check if the API call was successful and return the results
        if (data.response_code === 0) {
            return data.results;
        } else {
            // Log an error if the API response is not successful
            console.error("API response error: ", data);
            return [];
        }
    } catch (error) {
        // Log any fetch errors
        console.error("Fetch error: ", error);
        return [];
    }
}

/**
 * Updates the progress bar based on the current progress of the quiz.
 */
function updateProgressBar() {
    // Retrieve the progress bar element from the DOM
    const progressBar = document.getElementById("progress-bar");

    if (!progressBar) {
        console.error("Progress bar element not found");
        return;
    }

    // Calculate the progress percentage based on the current question index and total questions
    const progressPercentage =
        ((currentQuestionIndex + 1) / questions.length) * 100;

    // Update the width of the progress bar to reflect the current progress
    progressBar.style.width = `${progressPercentage}%`;
}

/**
 * Displays the current question and its answer choices.
 * @param {Object} question - The question object to display.
 */
function displayQuestion(question) {
    const currentQuestionElement = document.getElementById("currentQuestion");
    const answerChoicesContainer = document.getElementById("answerChoices");

    // Make sure the elements are found in the DOM
    if (!currentQuestionElement || !answerChoicesContainer) {
        console.error(
            "Required elements for displaying the question are not found in the DOM"
        );
        return;
    }

    // Set the question text, decoding any HTML entities
    currentQuestionElement.innerHTML = decodeHtml(question.question);

    // Clear any previous answer choices
    answerChoicesContainer.innerHTML = "";

    // Combine correct and incorrect answers, and shuffle them
    const answers = shuffleArray([
        question.correct_answer,
        ...question.incorrect_answers,
    ]);

    const choiceLetters = ["A", "B", "C", "D"];
    // Create a button for each answer
    answers.forEach((answer, index) => {
        const answerButton = document.createElement("button");
        answerButton.className = "answer-button";
        // Prepend the choice letter
        answerButton.textContent = `${choiceLetters[index]}. ${decodeHtml(answer)}`;
        answerButton.addEventListener("click", () =>
            handleAnswerSelection(answer, question.correct_answer)
        );
        answerChoicesContainer.appendChild(answerButton);
    });

    // Show the elements for the current question
    document.getElementById("score-container").classList.remove("hidden");
    document.getElementById("currentQuestion").classList.remove("hidden");
    document.getElementById("answerChoices").classList.remove("hidden");
    document.getElementById("progressBar-container").classList.remove("hidden");

    // Update the progress bar to reflect the new question
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
    // Retrieve all answer buttons and the current score display element
    const answerButtons = document.querySelectorAll(".answer-button");
    const currentScoreElement = document.getElementById("currentScore");

    answerButtons.forEach((button) => {
        // Disable all buttons to prevent further selections
        button.disabled = true;

        // Highlight the selected answer
        if (button.textContent === selectedAnswer) {
            if (selectedAnswer === correctAnswer) {
                // Increment score and update display if the answer is correct
                score++;
                if (currentScoreElement) {
                    currentScoreElement.textContent = `${score}`;
                }
                button.classList.add("correct-answer");
            } else {
                // Mark as incorrect if the answer is wrong
                button.classList.add("incorrect-answer");
            }
        }
    });

    // Set a timeout to proceed to the next question or end the quiz
    setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
            // Increment index and display the next question if more questions are available
            currentQuestionIndex++;
            displayQuestion(questions[currentQuestionIndex]);
        } else {
            // End the quiz if all questions have been answered
            endQuiz();
        }
    }, 1000); // Delay for 1 second before moving on
}

/**
 * Ends the quiz, hides the quiz interface, and shows the results.
 */
function endQuiz() {
    const quizInterface = document.getElementById("quiz-interface");
    const resultsSection = document.getElementById("results");

    // Hide the quiz interface
    // quizInterface.classList.add("hidden");

    // Show the results section with the user's score
    // resultsSection.classList.remove("hidden");

    if (quizInterface && resultsSection) {
        quizInterface.classList.add("hidden");
        resultsSection.classList.remove("hidden");

        // Update results content
        resultsSection.innerHTML = `<h2>You got ${score} out of ${questions.length}. Well done!</h2>
                              <button id="retake-quiz">Retake Quiz</button>
                              <button id="choose-new-category">Choose New Category</button>`;

        // Attach Event Listeners to Result Buttons
        document
            .getElementById("retake-quiz")
            .addEventListener("click", retakeQuiz);
        document
            .getElementById("choose-new-category")
            .addEventListener("click", chooseNewCategory);
    }
}

/**
 * Resets the quiz to its initial state, clearing the previous questions and resetting the score.
 */
function resetQuiz() {
    // Resetting score and question index
    score = 0;
    currentQuestionIndex = 0;
    questions = [];

    // Update the displayed score to 0
    const scoreElement = document.getElementById("currentScore");
    if (scoreElement) {
        scoreElement.textContent = `Score: ${score}`;
    }

    // Hide the progress bar container as we are resetting the quiz
    const progressBarContainer = document.getElementById("progressBar-container");
    if (progressBarContainer) {
        progressBarContainer.classList.add("hidden");
    }

    // Clear the content of the current question and answer choices
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
    // Reset the quiz to its initial state
    resetQuiz();

    // Start the quiz again with the same category that was previously selected
    startQuiz(currentCategory);
}

/**
 * Handles the action of choosing a new category after a quiz is completed or during a quiz.
 */
function chooseNewCategory() {
    // Reset the quiz to its initial state
    resetQuiz();

    // Hide the start button and score container elements
    document.getElementById("start-quiz").classList.add("hidden");
    document.getElementById("score-container").classList.add("hidden");

    // Show the category selection section and hide the results section
    document.getElementById("category-selection").classList.remove("hidden");
    document.getElementById("results").classList.add("hidden");
}

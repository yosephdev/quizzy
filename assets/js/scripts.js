document.addEventListener("DOMContentLoaded", () => {
    const app = new QuizApp();
    app.init();
});

class QuizApp {
    constructor() {
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.currentCategory = "";
        this.timer = null;
        this.timeLeft = 0;
        this.currentDifficulty = 'medium';

        this.menuToggle = document.getElementById("menu-toggle");
        this.currentQuestionElement = document.getElementById("currentQuestion");
        this.categoryButtons = document.querySelectorAll(".category-btn");
        this.startQuizButton = document.getElementById("start-quiz");
        this.retakeQuizIntroButton = document.getElementById("retake-quiz-intro");
        this.retakeQuizResultsButton = document.getElementById("retake-quiz-results");
        this.nextQuestionButton = document.getElementById("next-question");
        this.chooseNewCategoryButton = document.getElementById("choose-new-category");
        this.initialQuizInterfaceHTML = document.getElementById("quiz-interface").innerHTML;

        this.sounds = {
            correct: new Audio('assets/sounds/correct.mp3'),
            incorrect: new Audio('assets/sounds/incorrect.mp3'),
            gameOver: new Audio('assets/sounds/game-over.mp3')
        };
    }

    init() {
        this.addEventListeners();
    }

    playSound(type) {
        this.sounds[type].play();
    }

    updateScoreDisplay() {
        const scoreElement = document.getElementById('currentScore');
        scoreElement.classList.add('score-update');
        scoreElement.textContent = this.score;
        setTimeout(() => {
            scoreElement.classList.remove('score-update');
        }, 500);
    }

    addEventListeners() {
        this.menuToggle?.addEventListener("click", () => this.menuToggle.classList.toggle("open"));

        this.categoryButtons.forEach((button) => {
            button.addEventListener("click", (event) => {
                this.currentCategory = event.target.textContent.trim();
                this.startQuiz(this.currentCategory);
            });
        });

        this.startQuizButton.addEventListener("click", () => {
            document.querySelector("#quiz-interface h2").textContent = "";
            document.querySelectorAll(".instructions").forEach((el) => el.classList.add("hidden"));
            document.getElementById("category-selection").classList.add("hidden");
            this.startQuizButton.classList.add("hidden");

            this.currentQuestionIndex = 0;
            this.score = 0;

            this.currentQuestionElement.classList.remove("hidden");
            document.getElementById("score-container").classList.remove("hidden");
            document.getElementById("answerChoices").classList.remove("hidden");
            document.getElementById("timer-container").classList.remove("hidden");
            document.getElementById("progressBar-container").classList.remove("hidden");

            this.displayQuestion(this.questions[this.currentQuestionIndex]);
        });

        this.retakeQuizIntroButton.addEventListener("click", () => this.retakeQuiz());
        this.retakeQuizResultsButton.addEventListener("click", () => this.retakeQuiz());
        this.chooseNewCategoryButton.addEventListener("click", () => this.chooseNewCategory());

        this.nextQuestionButton.addEventListener("click", () => {
            if (this.currentQuestionIndex < this.questions.length - 1) {
                this.currentQuestionIndex++;
                this.displayQuestion(this.questions[this.currentQuestionIndex]);
                this.resetAnswerButtons();
            } else {
                this.endQuiz();
            }
        });
    }

    getCategoryId(categoryName) {
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

    async startQuiz(category) {
        this.showLoading();
        if (!category) {
            alert("Please select a category first.");
            return;
        }

        document.querySelector(".quiz-intro").classList.add("hidden");
        document.querySelectorAll(".instructions").forEach((el) => el.classList.remove("hidden"));

        this.currentQuestionIndex = 0;
        this.score = 0;
        this.currentCategory = category;

        try {
            this.questions = await this.fetchQuestions(category);
            const quizInterface = document.getElementById("quiz-interface");
            const categorySelection = document.getElementById("category-selection");

            if (this.questions.length > 0) {
                quizInterface.innerHTML = this.initialQuizInterfaceHTML; // Restore original HTML
                this.startQuizButton = document.getElementById("start-quiz"); // Re-get reference
                this.retakeQuizIntroButton = document.getElementById("retake-quiz-intro"); // Re-get reference
                this.nextQuestionButton = document.getElementById("next-question"); // Re-get reference

                this.startQuizButton.classList.remove("hidden");
                this.retakeQuizIntroButton.classList.remove("hidden");
                quizInterface.classList.remove("hidden");
                categorySelection.classList.add("hidden");

                // Re-attach event listeners
                this.startQuizButton.addEventListener("click", () => {
                    document.querySelector("#quiz-interface h2").textContent = "";
                    document.querySelectorAll(".instructions").forEach((el) => el.classList.add("hidden"));
                    document.getElementById("category-selection").classList.add("hidden");
                    this.startQuizButton.classList.add("hidden");

                    this.currentQuestionIndex = 0;
                    this.score = 0;

                    this.currentQuestionElement.classList.remove("hidden");
                    document.getElementById("score-container").classList.remove("hidden");
                    document.getElementById("answerChoices").classList.remove("hidden");
                    document.getElementById("timer-container").classList.remove("hidden");
                    document.getElementById("progressBar-container").classList.remove("hidden");

                    this.displayQuestion(this.questions[this.currentQuestionIndex]);
                });
                this.retakeQuizIntroButton.addEventListener("click", () => this.retakeQuiz());
                this.nextQuestionButton.addEventListener("click", () => {
                    if (this.currentQuestionIndex < this.questions.length - 1) {
                        this.currentQuestionIndex++;
                        this.displayQuestion(this.questions[this.currentQuestionIndex]);
                        this.resetAnswerButtons();
                    } else {
                        this.endQuiz();
                    }
                });

            } else {
                alert("No questions available for this category. Please choose another category.");
                quizInterface.classList.add("hidden");
                categorySelection.classList.remove("hidden");
            }

    async fetchQuestions(categoryName) {
        const categoryId = this.getCategoryId(categoryName);
        const apiURL = `https://opentdb.com/api.php?amount=10&category=${categoryId}&difficulty=${this.currentDifficulty}&type=multiple`;

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

    updateProgressBar() {
        const progressBar = document.getElementById("progress-bar");
        if (!progressBar) {
            console.error("Progress bar element not found");
            return;
        }
        const progressPercentage = ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
        progressBar.style.width = `${progressPercentage}%`;
    }

    displayQuestion(question) {
        this.currentQuestionElement.innerHTML = this.decodeHtml(question.question);
        const answerChoicesContainer = document.getElementById("answerChoices");
        answerChoicesContainer.innerHTML = "";

        const answers = this.shuffleArray([
            question.correct_answer,
            ...question.incorrect_answers,
        ]);

        const choiceLetters = ["A", "B", "C", "D"];
        answers.forEach((answer, index) => {
            const answerButton = document.createElement("button");
            answerButton.className = "answer-button";
            answerButton.innerHTML = `<span class="choice-letter">${choiceLetters[index]}</span> ${this.decodeHtml(answer)}`;
            answerButton.addEventListener("click", () =>
                this.handleAnswerSelection(answer, question.correct_answer)
            );
            answerChoicesContainer.appendChild(answerButton);
        });

        document.getElementById("score-container").classList.remove("hidden");
        this.currentQuestionElement.classList.remove("hidden");
        answerChoicesContainer.classList.remove("hidden");
        document.getElementById("progressBar-container").classList.remove("hidden");

        this.updateProgressBar();
        clearInterval(this.timer);
        this.startTimer();
    }

    decodeHtml(html) {
        const txt = document.createElement("textarea");
        txt.innerHTML = html;
        return txt.value;
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    handleAnswerSelection(selectedAnswer, correctAnswer) {
        clearInterval(this.timer);
        const answerButtons = document.querySelectorAll(".answer-button");
        const currentScoreElement = document.getElementById("currentScore");

        answerButtons.forEach((button) => {
            button.disabled = true;
            if (button.textContent.includes(selectedAnswer)) {
                if (selectedAnswer === correctAnswer) {
                    const points = 50 + (this.timeLeft * 2);
                    this.score += points;
                    if (currentScoreElement) {
                        currentScoreElement.textContent = `${this.score}`;
                        currentScoreElement.classList.add("score-update");
                    }
                    button.classList.add("correct-answer");
                    this.playSound('correct');
                    this.updateScoreDisplay();
                } else {
                    button.classList.add("incorrect-answer");
                    this.playSound('incorrect');
                }
            }
        });

        this.nextQuestionButton.classList.remove("hidden");
    }

    resetAnswerButtons() {
        const answerButtons = document.querySelectorAll(".answer-button");
        answerButtons.forEach((button) => {
            button.disabled = false;
            button.classList.remove("correct-answer", "incorrect-answer");
        });
        this.nextQuestionButton.classList.add("hidden");
    }

    endQuiz() {
        const quizInterface = document.getElementById("quiz-interface");
        const resultsSection = document.getElementById("results");

        if (quizInterface && resultsSection) {
            quizInterface.classList.add("hidden");
            resultsSection.classList.remove("hidden");

            let feedbackMessage;
            const percentage = this.score / (this.questions.length * 70);
            if (percentage === 1) {
                feedbackMessage = "Perfect score! You're a trivia master!";
            } else if (percentage >= 0.7) {
                feedbackMessage = "Great job! You have a strong grasp on these topics.";
            } else if (percentage >= 0.5) {
                feedbackMessage = "Not bad! A little more study and you'll be on top.";
            } else {
                feedbackMessage = "Keep practicing and you'll improve.";
            }

            const newHighScore = this.saveHighScore();

            resultsSection.innerHTML = `<h2>Your Results</h2>
            <p id="results-text">You scored ${this.score} points. ${feedbackMessage}</p>
            ${newHighScore ? "<p class='new-high-score'>New High Score!</p>" : ""}
            ${this.displayHighScore()}
            <button id="retake-quiz-results">Retake Quiz</button>
            <button id="choose-new-category">Choose New Category</button>`;

            document.getElementById("retake-quiz-results").addEventListener("click", () => this.retakeQuiz());
            document.getElementById("choose-new-category").addEventListener("click", () => this.chooseNewCategory());
        }
        this.resetQuiz();
    }

    resetQuiz() {
        this.score = 0;
        this.currentQuestionIndex = 0;
        this.questions = [];

        const scoreElement = document.getElementById("currentScore");
        if (scoreElement) {
            scoreElement.textContent = "0";
        }

        document.getElementById("progressBar-container").classList.add("hidden");
        this.currentQuestionElement.textContent = "";
        document.getElementById("answerChoices").innerHTML = "";
        this.retakeQuizIntroButton.classList.add("hidden");
    }

    retakeQuiz() {
        this.resetQuiz();
        document.querySelector(".quiz-intro").classList.remove("hidden");
        this.startQuizButton.classList.remove("hidden");
        document.getElementById("results").classList.add("hidden");
        this.nextQuestionButton.classList.add("hidden");
        this.startQuiz(this.currentCategory);
    }

    chooseNewCategory() {
        this.resetQuiz();
        document.getElementById("results").classList.add("hidden");
        document.getElementById("category-selection").classList.remove("hidden");
        document.querySelector(".quiz-intro").classList.remove("hidden");
        this.startQuizButton.classList.remove("hidden");
        document.getElementById("score-container").classList.add("hidden");
        this.nextQuestionButton.classList.add("hidden");
    }

    startTimer() {
        this.timeLeft = 30;
        const timerElement = document.getElementById('timer');
        timerElement.textContent = this.timeLeft;

        this.timer = setInterval(() => {
            this.timeLeft--;
            timerElement.textContent = this.timeLeft;

            if (this.timeLeft <= 0) {
                clearInterval(this.timer);
                this.handleTimeUp();
            }
        }, 1000);
    }

    handleTimeUp() {
        const answerButtons = document.querySelectorAll('.answer-button');
        answerButtons.forEach(button => button.disabled = true);

        const currentQuestion = this.questions[this.currentQuestionIndex];
        answerButtons.forEach(button => {
            if (button.textContent.includes(currentQuestion.correct_answer)) {
                button.classList.add('correct-answer');
            }
        });

        this.nextQuestionButton.classList.remove('hidden');
    }

    saveHighScore() {
        const highScores = JSON.parse(localStorage.getItem('highScores')) || {};
        if (!highScores[this.currentCategory] || this.score > highScores[this.currentCategory]) {
            highScores[this.currentCategory] = this.score;
            localStorage.setItem('highScores', JSON.stringify(highScores));
            return true;
        }
        return false;
    }

    displayHighScore() {
        const highScores = JSON.parse(localStorage.getItem('highScores')) || {};
        const categoryHighScore = highScores[this.currentCategory] || 0;
        return `<p>High Score for ${this.currentCategory}: ${categoryHighScore}</p>`;
    }

    showLoading() {
        const quizInterface = document.getElementById('quiz-interface');
        const loadingHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Loading questions...</p>
            </div>
        `;
        quizInterface.innerHTML = loadingHTML;
    }
}

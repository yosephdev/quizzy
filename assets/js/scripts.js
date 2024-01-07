document.addEventListener('DOMContentLoaded', () => {
    // Toggle navigation menu
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.getElementById('main-nav');

    menuToggle.addEventListener('click', () => {
        mainNav.classList.toggle('hidden');
    });

    document.querySelectorAll('#main-nav a').forEach(link => {
        link.addEventListener('click', function (event) {

            if (this.getAttribute('href').startsWith('#')) {
                event.preventDefault();

                const targetId = this.getAttribute('href');
                const targetSection = document.querySelector(targetId);

                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    mainNav.classList.add('hidden');
                }
            }
        });
    });

    const categoryButtons = document.querySelectorAll(".category-btn");
    categoryButtons.forEach((button) => {
        button.addEventListener("click", function () {
            const category = this.textContent;
            startQuiz(category);
        });
    });
});

function startQuiz(category) {
    const quizInterface = document.getElementById("quiz-interface");
    quizInterface.classList.remove("hidden");

    const quizTitle = quizInterface.querySelector("h2");
    quizTitle.textContent = `${category} Quiz`;

    fetchQuestions(category);
}

function fetchQuestions(categoryName) {
    const categoryId = getCategoryId(categoryName);
    const apiURL = `https://opentdb.com/api.php?amount=10&category=${categoryId}&type=multiple`;

    fetch(apiURL)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network response was not ok " + response.statusText);
            }
            return response.json();
        })
        .then((data) => {
            console.log(data.results);
        })
        .catch((error) => {
            console.error("Error fetching quiz questions:", error);
        });
}


function getCategoryId(categoryName) {

    const categories = {
        Science: 17,
        Math: 19,
        History: 23,
        Literature: 10,
        Technology: 18,
        Geography: 22,
        Arts: 25,
        Sports: 21
    };

    return categories[categoryName] || 17;
}

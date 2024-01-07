document.addEventListener('DOMContentLoaded', () => {
    // Toggle navigation menu
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.getElementById('main-nav');

    menuToggle.addEventListener('click', () => {
        mainNav.classList.toggle('hidden');
    });

    // Smooth scroll for internal links only
    document.querySelectorAll('#main-nav a').forEach(link => {
        link.addEventListener('click', function (event) {
            // Check if the link is internal
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

    // Setup category buttons
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(button => {
        button.addEventListener('click', function () {
            startQuiz(this.textContent);
        });
    });
});

function startQuiz(category) {
    // Hide category selection and show quiz interface
    document.getElementById('category-selection').classList.add('hidden');

    const quizInterface = document.getElementById('quiz-interface');
    quizInterface.classList.remove('hidden');

    // Update the quiz title within the <h2> element of the quiz interface
    const quizTitle = quizInterface.querySelector('h2');
    quizTitle.textContent = `${category} Quiz`;
}

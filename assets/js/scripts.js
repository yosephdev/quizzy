document.addEventListener('DOMContentLoaded', () => {
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

                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

                mainNav.classList.add('hidden');
            }
        });
    });
});


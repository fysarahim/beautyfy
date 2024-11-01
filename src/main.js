const { ipcRenderer } = require('electron');
            
function quitApp() {
    ipcRenderer.send('quit-app');
}

document.addEventListener('DOMContentLoaded', () => {
    const quitButton = document.getElementById("quitButton");
    if (quitButton) {
        quitButton.addEventListener('click', (e) => {
            e.preventDefault();
            quitApp();
        });
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const slides = document.querySelectorAll('.slide');
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    let currentSlide = 0;

    function showSlide(index) {
        slides[currentSlide].classList.remove('active');
        currentSlide = (index + slides.length) % slides.length; // Loop back to the start
        slides[currentSlide].classList.add('active');
    }

    prevButton.addEventListener('click', function() {
        showSlide(currentSlide - 1);
    });

    nextButton.addEventListener('click', function() {
        showSlide(currentSlide + 1);
    });

    showSlide(currentSlide); // Show the first slide
});
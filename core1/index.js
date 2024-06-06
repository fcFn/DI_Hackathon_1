// Event date
const eventDate = new Date('2024-12-31T23:59:59');

// Elements
const countdownElement = document.getElementById('countdown');

// Calculating temaining time

function calculateTimeRemaining() {
    const now = new Date();
    const timeRemaining = eventDate - now;
    
    const years = Math.floor(timeRemaining / (1000 * 60 * 60 * 24 * 365));
    const months = Math.floor((timeRemaining % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
    const days = Math.floor((timeRemaining % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
    
    return { years, months, days, hours, minutes, seconds };
}

// Update remaining time

function updateCountdown() {
    const { years, months, days, hours, minutes, seconds } = calculateTimeRemaining();
    countdownElement.textContent = `${years}y ${months}m ${days}d ${hours}h ${minutes}m ${seconds}s`;
    gsap.to(countdownElement, { duration: 0.5, scale: 1.1, yoyo: true, repeat: 1 });
}

// Set interval to update every second

setInterval(updateCountdown, 1000);

// Initial animaiton
gsap.from(".event-name", { duration: 1, opacity: 0, y: -50 });
gsap.from(".buttons button", { duration: 0.5, opacity: 0, y: 20, stagger: 0.2 });

// Animation for the test by clicking start

document.getElementById("start").addEventListener("click", function() {
    gsap.to(".countdown", { duration: 0.5, scale: 1.2, repeat: 1, yoyo: true });
});
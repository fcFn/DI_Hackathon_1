// Event date
let eventDate = new Date('2024-12-31T23:59:59');

// Elements
const countdownElement = document.getElementById('countdown');
const eventNameElement = document.getElementById('eventName')
const shareButton = document.getElementById('shareButton')

let countdownInterval;
let isPaused = false;
let timeRemaining;

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
    gsap.to(countdownElement, { duration: 0.5, color: "grey" });
}

// Initial animaiton
gsap.from(".event-name", { duration: 1, opacity: 0, y: -50 });
gsap.from(".buttons button", { duration: 0.5, opacity: 0, y: 20, stagger: 0.2 });

// Animation for the test by clicking start

document.getElementById("start").addEventListener("click", function() {
    gsap.to(".countdown", { duration: 0.5, scale: 1.2, repeat: 1, yoyo: true });
});

function generatrURL (){
    const name = eventNameElement.textContent;
    const time = eventDate.toISOString()
    const url = `${window.location.origin}${window.location.pathname}?name=${name}&time=${time}`
    return url
}

function startCountdown() {
    if (countdownInterval) return;
    countdownInterval = setInterval(updateCountdown, 1000);
    isPaused = false;
}

function pauseCountdown() {
    clearInterval(countdownInterval);
    countdownInterval = null;
    isPaused = true;
}

function resetCountdown() {
    pauseCountdown();
    eventDate = new Date('2024-12-31T23:59:59');
    updateCountdown();
}

document.getElementById('start').addEventListener('click', () => {
    if (isPaused) {
        startCountdown();
    } else {
        pauseCountdown();
    }
});

document.getElementById('pause').addEventListener('click', pauseCountdown);

document.getElementById('reset').addEventListener('click', resetCountdown);

shareButton.addEventListener("click", ()=>{
    document.getElementById("shareButton").addEventListener("click", function() {
        const shareURL = generatrURL();
        navigator.clipboard.writeText(shareURL).then(() => {
            alert('link was copied: ' + shareURL);
        }).catch(err => {
            console.error('Cannot copy the link ', err);
        });
    });
})

document.getElementById('eventForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const eventNameInput = document.getElementById('eventNameInput').value;
    const eventDateInput = new Date(document.getElementById('eventDateInput').value);
    eventNameElement.textContent = eventNameInput;
    eventDate = eventDateInput;
    initialEventDate = new Date(eventDateInput);
    updateCountdown();
    startCountdown()
});
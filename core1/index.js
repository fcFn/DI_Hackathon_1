// Checking GASP: title animation

gsap.from(".event-name", { duration: 1, opacity: 0, y: -50 });

 // Buttons animation

        gsap.from(".buttons button", {
            duration: 0.5,
            opacity: 0,
            y: 20,
            stagger: 0.2
        });

 // Animation for the test

        document.getElementById("start").addEventListener("click", function() {
            gsap.to(".countdown", { duration: 0.5, scale: 1.2, repeat: 1, yoyo: true });
        });
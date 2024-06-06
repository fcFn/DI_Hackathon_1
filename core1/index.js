// Проверка работы GSAP: анимация заголовка

gsap.from(".event-name", { duration: 1, opacity: 0, y: -50 });

 // Анимация кнопок при загрузке страницы

        gsap.from(".buttons button", {
            duration: 0.5,
            opacity: 0,
            y: 20,
            stagger: 0.2
        });

 // Анимация для тестирования

        document.getElementById("start").addEventListener("click", function() {
            gsap.to(".countdown", { duration: 0.5, scale: 1.2, repeat: 1, yoyo: true });
        });
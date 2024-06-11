let interval;
let notificationTimer;
function createTimer(millis) {
  clearInterval(interval);
  clearTimeout(notificationTimer);
  const timer = () => {
    if (Date.now() <= millis) {
      interval = setInterval(() => {
        self.postMessage(millis);
      }, 1000);
    }
  };
  notificationTimer = setTimeout(() => {
    // TODO: show event name here
    console.log("fooo");
    clearInterval(interval);
    if (Notification.permission === "granted") {
      self.postMessage('TIMES_UP')
      new Notification("Time's up!", { body: "The time you set has elapsed." });
    }
  }, millis - Date.now());
  return timer;
}

let timer;
self.onmessage = (event) => {
  timer = createTimer(event.data);
  timer();
};

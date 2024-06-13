import setLongTimeout from "./helpers";

let interval;
let notificationTimer = {};
function createTimer(millis) {
  clearInterval(interval);
  clearTimeout(notificationTimer?.timeout);
  const timer = () => {
    if (Date.now() <= millis) {
      interval = setInterval(() => {
        self.postMessage(millis);
      }, 1000);
    }
  };
  setLongTimeout(
    () => {
      // TODO: show event name here
      clearInterval(interval);
      self.postMessage("TIMES_UP");
    },
    millis - 1000 - Date.now(),
    notificationTimer,
  );
  return timer;
}

let timer;
self.onmessage = (event) => {
  timer = createTimer(event.data);
  timer();
};

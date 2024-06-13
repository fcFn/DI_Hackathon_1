import { DateTime } from "luxon";
import { getTimeDifference, stopTimer } from "./script.js";

// import worker from "./worker.js";
const worker = new Worker(new URL("./worker.js", import.meta.url), {
  type: "module",
});

function updateTitle(millis) {
  const diff = getTimeDifference(
    DateTime.local(),
    DateTime.fromMillis(parseInt(millis)),
  );
  // Format the time difference and display in the title, do not include
  // units that are 0
  let timeString = "";
  if (diff.years) {
    timeString += `${diff.years}Y `;
  }
  if (diff.monhts) {
    timeString += `${diff.months}M `;
  }
  if (diff.days) {
    timeString += `${diff.days}D `;
  }
  if (diff.hours) {
    timeString += `${diff.hours}h `;
  }
  if (diff.minutes) {
    timeString += `${diff.minutes}m `;
  }
  if (diff.seconds) {
    timeString += `${diff.seconds.toFixed(0) === 60 ? 59 : diff.seconds.toFixed(0)}s `;
  }
  document.title = timeString;
}

export function startBGTimer(millis) {
  worker.postMessage(millis);
  worker.onmessage = (event) => {
    if (event.data === "TIMES_UP") {
      document.title = "Time's up!";
      if (Notification.permission === "granted") {
        self.postMessage("TIMES_UP");
        const notification = new Notification("Time's up!", {
          body: "The time you set has elapsed.",
        });
        notification.onclick = (event) => {
          event.preventDefault();
          window.focus();
          parent.focus();
        };
      }
      stopTimer();
    } else {
      updateTitle(event.data);
    }
  };
}

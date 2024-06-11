import { DateTime } from "luxon";
import { getTimeDifference } from "./script.js";

// import worker from "./worker.js";
const worker = new Worker(new URL("./worker.js", import.meta.url));

function updateTitle(millis) {
  const diff = getTimeDifference(DateTime.local(), DateTime.fromMillis(parseInt(millis)));
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
    timeString += `${Math.floor(diff.seconds)}s `;
  }
  document.title = timeString;
}

export function startBGTimer(millis) {
  worker.postMessage(millis);
  worker.onmessage = (event) => {
    if (event.data === "TIMES_UP") {
      document.title = "Time's up!";
    } else {
      updateTitle(event.data);
    }
  };
}

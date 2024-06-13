// Import DateTime and Duration from the Luxon library
import gsap from "gsap";
import { DateTime } from "luxon";
import startParticles from "./confetti.js";
import { events as builtInEvents } from "./events.js";
import { determineCountryAndFetchHolidays } from "./geo.js";
import { startBGTimer } from "./worker-helper.js";
// Array to store the timelines for the timer
const timelines = [];
let targetDate = DateTime.fromISO("2025-01-01T00:00:00");
// Function to calculate the difference between two dates
// and return it as an object with time components
export function getTimeDifference(startDate, endDate) {
  // Calculate the difference between the two dates
  const diff = endDate.diff(startDate, [
    "years",
    "months",
    "days",
    "hours",
    "minutes",
    "seconds",
  ]);

  // Return the difference as an object
  return {
    years: diff.years,
    months: diff.months,
    days: diff.days,
    hours: diff.hours,
    minutes: diff.minutes,
    seconds: diff.seconds,
  };
}
let timeUnits;

// Function to create a timer
function createTimer() {
  // Create a new div element for the timer
  const timer = document.createElement("div");
  const timerContainer = document.getElementById("timer-container");
  timer.id = "timer";
  // Set the inner HTML of the timer
  timer.innerHTML = `
  
        <div class="time-unit" id="years">
            <div class="number-container">
                <span class="number">0</span>
            </div>
            <span class="label">years</span>
        </div>
        <div class="time-unit" id="months">
            <div class="number-container">
                <span class="number">0</span>
            </div>
            <span class="label">months</span>
        </div>
        <div class="time-unit" id="days">
            <div class="number-container">
                <span class="number">0</span>
            </div>
            <span class="label">days</span>
        </div>
        <div class="time-unit" id="hours">
            <div class="number-container">
                <span class="number">0</span>
            </div>
            <span class="label">hours</span>
        </div>
        <div class="time-unit" id="minutes">
            <div class="number-container">
                <span class="number">0</span>
            </div>
            <span class="label">minutes</span>
        </div>
        <div class="time-unit" id="seconds">
            <div class="number-container">
                <span class="number">0</span>
            </div>
            <span class="label">seconds</span>
        </div>
  `;

  // Append the timer to the body of the document
  timerContainer.appendChild(timer);
  // Define the time units for the timer
  timeUnits = {
    // Define the properties for each time unit
    // Each time unit has a rollOverValue, a unit function, and a nextUnit
    // The rollOverValue is the value at which the unit rolls over to the next unit
    // The unit function returns the DOM element for the unit
    // The nextUnit is the unit that this unit rolls over to
    // For example, the seconds unit rolls over to the minutes unit every 60 seconds
    // The minutes unit rolls over to the hours unit every 60 minutes, and so on
    seconds: {
      rollOverValue: 59,
      unit: () => document.querySelector("#seconds .number"),
      nextUnit: "minutes",
    },
    minutes: {
      rollOverValue: 59,
      prevUnit: "seconds",
      unit: () => document.querySelector("#minutes .number"),
      nextUnit: "hours",
    },
    hours: {
      rollOverValue: 23,
      unit: () => document.querySelector("#hours .number"),
      nextUnit: "days",
    },
    days: {
      get rollOverValue() {
        // Get the number of days in the previous month
        return DateTime.local().minus({ month: 1 }).daysInMonth;
      },
      unit: () => document.querySelector("#days .number"),
      nextUnit: "months",
    },
    months: {
      rollOverValue: 12,
      unit: () => document.querySelector("#months .number"),
      nextUnit: "years",
    },
    years: {
      rollOverValue: 0,
      unit: () => document.querySelector("#years .number"),
    },
  };
}

// Function to set the values of the time units
function setTimeValues({
  years = 0,
  months = 0,
  days = 0,
  hours = 0,
  minutes = 0,
  seconds = 0,
}) {
  // Set the text content of each time unit to the corresponding value in the difference object
  timeUnits.years.unit().textContent = years;
  timeUnits.months.unit().textContent = months;
  timeUnits.days.unit().textContent = days;
  timeUnits.hours.unit().textContent = hours;
  timeUnits.minutes.unit().textContent = minutes;
  timeUnits.seconds.unit().textContent = seconds.toFixed(0);
}
// Function to create a timeline for a time unit
const createTimeline = (
  { unit, rollOverValue, nextUnit, prevUnit },
  delay,
  runOnce,
) => {
  // Get the target element for the timeline
  const target = unit();

  // Get the current value of the target element
  const value = parseInt(target.textContent);
  // Create a new element with the same content as the target element
  const newElement = target.cloneNode(true);

  // Set the text content of the new element to the value of the target element minus 1
  // If the value of the target element is 0, set the text content of the new element to the rollOverValue
  newElement.textContent = value - 1 >= 0 ? value - 1 : rollOverValue;

  // Append the new element to the parent of the target element
  target.parentNode.appendChild(newElement);

  // Create a new timeline with the specified delay
  const timeline = gsap.timeline({
    delay,
    onComplete() {
      // Check if the previous unit has reached its rollOverValue
      // so that next unit only rolls over once per previous unit max value
      // i.e. minutes roll over once every 60 seconds
      let rollNextValue = true;
      if (prevUnit) {
        const prevUnitValue = parseInt(timeUnits[prevUnit].unit().textContent);
        if (prevUnitValue === timeUnits[prevUnit].rollOverValue) {
          rollNextValue = false;
        }
      }

      // If rollNextValue is true and runOnce is false, create a new timeline for the new element
      if (rollNextValue && !runOnce) {
        createTimeline(
          { unit: () => newElement, nextUnit, rollOverValue },
          0.5,
        );
      }

      // Remove the target element from the DOM
      target.remove();
    },
    onStart() {
      // Stop the timer if the target date has been reached
      if (
        timeUnits.years.unit().textContent === "0" &&
        timeUnits.months.unit().textContent === "0" &&
        timeUnits.days.unit().textContent === "0" &&
        timeUnits.hours.unit().textContent === "0" &&
        timeUnits.minutes.unit().textContent === "0" &&
        timeUnits.seconds.unit().textContent === "0"
      ) {
        stopTimer();
        return;
      }
      // If the value of the target element is 0 and there is a next unit, create a new timeline for the next unit
      // But run the timeline only once since we only need it to do at most every 60 seconds
      if (value <= 0 && nextUnit) {
        createTimeline(timeUnits[nextUnit], 0, true);
      }
    },
  });

  // Add the timeline to the timelines array
  timelines.push(
    timeline
      // .timeScale(0.4)
      .set(target, { transformOrigin: "center bottom" })
      .set(newElement, { transformOrigin: "center top" })
      .fromTo(
        target,
        { rotationX: 0 },
        { duration: 0.5, rotationX: -150, y: "100%", ease: "none" },
      )
      .fromTo(
        newElement,
        { y: "-100%", rotationX: 150 },
        { duration: 0.5, y: "0%", rotationX: 0, ease: "none" },
        "<",
      ),
  );
};

export function stopTimer() {
  if (gsap.globalTimeline.paused()) {
    return;
  }
  function startParticlesOnVisibilityChange() {
    if (document.visibilityState === "visible") {
      startParticles();
      document.removeEventListener(
        "visibilitychange",
        startParticlesOnVisibilityChange,
      );
    }
  }
  function resetTimeUnits() {
    Object.values(timeUnits).forEach((unit) => {
      unit.unit().textContent = 0;
    });
  }

  document.removeEventListener("visibilitychange", onVisibilityChange);

  if (document.visibilityState === "visible") {
    startParticles();
  } else {
    document.addEventListener(
      "visibilitychange",
      startParticlesOnVisibilityChange,
    );
  }
  gsap.globalTimeline.pause(0);
  resetTimeUnits();
}

// Add an event listener for the visibilitychange event
// When the visibility of the document changes, call the onVisibilityChange function
document.addEventListener("visibilitychange", onVisibilityChange);

// Function to handle the visibilitychange event
function onVisibilityChange() {
  // If the visibility of the document is visible, update the timer
  if (document.visibilityState === "visible") {
    // Kill all the timelines
    timelines.forEach((timeline) => timeline.kill());
    // Update the time difference after being in background
    // UGLY!!! Really gotta get rid of that weird global date variable
    const difference = getTimeDifference(DateTime.local(), targetDate);
    setupTimer(difference);
  }
}

// Get the current location and fetch events
// Cache in localStorage
let events = localStorage.getItem("events");
if (!events) {
  determineCountryAndFetchHolidays(new Date().getFullYear(), (events) => {
    if (events) {
      localStorage.setItem("events", JSON.stringify(events));
    }
  })
    .finally(() => {
      let events = localStorage.getItem("events");
      if (!events) {
        console.log("Using built-in events");
        events = builtInEvents;
      } else {
        events = JSON.parse(events);
      }
      createOptions(events);
    })
    .catch((error) => {
      console.error(error);
    });
} else {
  // Create a select element for the events
  createOptions(JSON.parse(events));
}

function createOptions([events, eventsNextYear]) {
  const select = document.createElement("select");
  select.id = "events";
  select.innerHTML = `<option value="">Select an event</option>`;
  const eventsData = events;
  eventsData.forEach((event) => {
    // TODO: Sort options by date
    let optionName = `${event.name} (${event.date.iso})`;
    // TODO: We should probably subtract 1 second from the date
    let date = DateTime.fromISO(`${event.date.iso}T00:00:00`);
    if (DateTime.local() >= date) {
      date = eventsNextYear.find(
        (eventNextYear) => eventNextYear.name === event.name,
      );
      if (date) {
      optionName = `${date.name} (${date.date.iso})`;
      date = DateTime.fromISO(`${date.date.iso}T00:00:00`);
      } else {
        return;
      }
    }

    const option = document.createElement("option");
    option.value = date.toISO();
    option.textContent = optionName;
    select.appendChild(option);
  });
  select.addEventListener("change", (event) => {
    const eventDate = DateTime.fromISO(`${event.target.value}`);
    targetDate = eventDate;
    addTimeToQuery(eventDate.toMillis());
    document.querySelector(".event-title").textContent =
      event.target.selectedOptions[0].textContent;
    const eventDifference = getTimeDifference(DateTime.local(), eventDate);
    setupTimer(eventDifference);
    addNameEventToQuery(event.target.selectedOptions[0].textContent);
    startBGTimer(eventDate.toMillis());
  });
  document.body.appendChild(select);
}
function setupTimer(eventDifference) {
  // TODO: Get rid of this stupid global variable that has cause so much trouble
  date = eventDifference;
  document.getElementById("timer")?.remove();
  createTimer();
  setTimeValues(eventDifference);
  // TODO: Probably better to use gsap.globalTimeLine.clear() here instead of
  //  iterating over this array
  if (timelines.length) {
    timelines.forEach((timeline) => timeline.kill());
  }
  gsap.globalTimeline.resume();
  createTimeline(timeUnits.seconds, 0);
  document.addEventListener("visibilitychange", onVisibilityChange);
}

/**
 * Retrieves the event time from the query parameters in the URL. If not found
 * or not able to parse, returns an object with all properties set to 0. The
 * time is expected to be in milliseconds.
 * @returns {Object} An object representing the event time, with properties for
 *  years, months, days, hours, minutes, and seconds.
 */
function getTimeFromQuery() {
  const urlParams = new URLSearchParams(window.location.search);
  const eventDate = urlParams.get("time");
  try {
    if (eventDate) {
      return getTimeDifference(
        DateTime.local(),
        DateTime.fromMillis(parseInt(eventDate)),
      );
    }
  } catch (error) {
    console.error("Error parsing event time:", error);
  }
  return null;
}

/**
 * Adds the specified time to the query string of the current URL.
 * @param {string} time - The time to be added to the query string,
 *  in milliseconds.
 */
function addTimeToQuery(time) {
  const urlParams = new URLSearchParams(window.location.search);
  urlParams.set("time", time);
  window.history.replaceState(
    {},
    "",
    `${window.location.pathname}?${urlParams}`,
  );
}

document.getElementById("darkModeToggle").addEventListener("change", () => {
  document.body.classList.toggle("dark-mode-body");

  const timeUnits = document.querySelectorAll(".time-unit");
  timeUnits.forEach((unit) => {
    unit.classList.toggle("dark-mode-time-unit");
  });

  document.getElementById("eventForm").classList.toggle("dark-mode-form");
});

function setEventName(eventName) {
  const eventTitle = document.querySelector(".event-title");
  eventTitle.textContent = eventName;
}

function setDateFromForm(formDate) {
  const eventDate = DateTime.fromISO(formDate);
  addTimeToQuery(eventDate.toMillis());
  const eventDifference = getTimeDifference(
    DateTime.local(),
    eventDate.plus({ seconds: 1 }),
  );
  targetDate = eventDate.plus({ seconds: 1 });
  date = eventDifference;
  setupTimer(eventDifference);
  startBGTimer(eventDate.toMillis());
}

document.getElementById("eventForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const eventName = document.getElementById("eventNameInput").value;
  const eventDate = document.getElementById("eventDateInput").value;
  setEventName(eventName);
  setDateFromForm(eventDate);
  addNameEventToQuery(eventName);
  document.getElementById("eventNameInput").value = "Event name";
});

function addNameEventToQuery(eventName) {
  const urlParams = new URLSearchParams(window.location.search);
  urlParams.set("eventName", eventName);
  window.history.replaceState(
    {},
    "",
    `${window.location.pathname}?${urlParams}`,
  );
}

// This is probably not the best way to do that, instead better stick with the add
// event listener method
window.shareEvent = () => {
  const url = window.location.href;
  const shareData = {
    title: "Event Countdown",
    text: "Check out this event countdown!",
    url: url,
  };

  if (navigator.share) {
    navigator.share(shareData);
  } else {
    console.error("Web Share API not supported");
  }
};

function getEventNameFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const eventName = urlParams.get("eventName");
  if (!eventName) {
    return "New Year 2025";
  }
  return eventName;
}

function getMillisFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const eventDate = urlParams.get("time");
  if (!eventDate) {
    return /* time to new year 2025 in milliseconds */ 1735689600000;
  }
  return eventDate;
}

document
  .getElementById("notifyButton")
  .addEventListener("click", () => Notification.requestPermission());

document.querySelector(".event-title").addEventListener("input", (event) => {
  const eventName = event.target.textContent;
  addNameEventToQuery(eventName);
});

// Entry point for the application
let date =
  getTimeFromQuery() ||
  // New Year's Day 2025
  // TODO: Set label of the event to the default New Year
  // TODO: Do not use hardcoded 2025
  getTimeDifference(DateTime.local(), DateTime.fromISO("2025-01-01"));
let eventName = getEventNameFromURL();
setEventName(eventName);
startBGTimer(getMillisFromURL());
setupTimer(date);

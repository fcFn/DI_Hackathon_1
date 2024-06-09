// Import DateTime and Duration from the Luxon library
import { DateTime } from "luxon";
import gsap from "gsap";
// Get the current date and time in the local time zone
const now = DateTime.local();

// Create a future date by adding 2 hours and 3 seconds to the current date
// TODO: set that from an input in the HTML
const date = now.plus({ hours: 2, seconds: 3 });

// Function to calculate the difference between two dates
function getTimeDifference(startDate, endDate) {
  // Calculate the difference between the two dates
  const diff = endDate.diff(startDate, [
    "years",
    "months",
    "days",
    "hours",
    "minutes",
    "seconds",
  ]);

  foo
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
  timer.id = "timer";

  // Set the inner HTML of the timer
  timer.innerHTML = `
  <div id="timer">
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
    </div>
  `;

  // Append the timer to the body of the document
  document.body.appendChild(timer);
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
        return Math.floor(date.diff(DateTime.local(), ["months", "days"]).days);
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
function setTimeValues(difference) {
  // Set the text content of each time unit to the corresponding value in the difference object
  timeUnits.years.unit().textContent = difference.years;
  timeUnits.months.unit().textContent = difference.months;
  timeUnits.days.unit().textContent = difference.days;
  timeUnits.hours.unit().textContent = difference.hours;
  timeUnits.minutes.unit().textContent = difference.minutes;
  timeUnits.seconds.unit().textContent = difference.seconds.toFixed(0);
}

// Array to store the timelines for the timer
const timelines = [];

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

  // Set the transform property of the new element to translateY(-100%)
  newElement.style.transform = "translateY(-100%)";

  // Append the new element to the parent of the target element
  target.parentNode.appendChild(newElement);

  // Create a new timeline with the specified delay
  const timeline = gsap.timeline({
    delay,
    onComplete() {
      // Stop the timer if the target date has been reached
      if (DateTime.local().plus({ seconds: 1 }) >= date) {
        document.removeEventListener("visibilitychange", onVisibilityChange);
        gsap.globalTimeline.pause();
      }

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
      .to(target, { duration: 0.5, y: "100%", ease: "none" })
      .to(newElement, { duration: 0.5, y: "0%", ease: "none" }, "<"),
  );
};

// Calculate the difference between the current date and the future date
const difference = getTimeDifference(now, date);

// Create the timer
createTimer();

// Set the values of the time units
setTimeValues(difference);

// Create a timeline for the seconds unit
createTimeline(timeUnits.seconds, 0);

// Add an event listener for the visibilitychange event
// When the visibility of the document changes, call the onVisibilityChange function
document.addEventListener("visibilitychange", onVisibilityChange);

// Function to handle the visibilitychange event
function onVisibilityChange() {
  // If the visibility of the document is visible, update the timer
  if (document.visibilityState === "visible") {
    // Kill all the timelines
    timelines.forEach((timeline) => timeline.kill());

    // Remove the timer from the DOM
    document.getElementById("timer").remove();

    // Create a new timer
    createTimer();

    // Update the time difference after being in background
    const difference = getTimeDifference(DateTime.local(), date);

    // Set the values of the time units
    setTimeValues(difference);

    // Create a new timeline for the seconds unit
    createTimeline(timeUnits.seconds, 0);
  }
}

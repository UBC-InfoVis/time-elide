/*
 * Workflow:
 * 1. Prepare slice filters (user input)
 * 2. Load data
 * 3. Prepare all slices within given date range (we want to keep track of missing data)
 * 4. Filter and group input data based on slices
 * 5. Compute summary statistics
 */
import * as d3 from "d3";
import { slicedData } from "./stores";

/*
 * 1. Prepare slice filters
 */

let nestedSlices, filteredDaysOfWeek;

// Raw input from web form
export function processData(selectedSlices, dataSource) {
  const slices = selectedSlices;

  // Format time strings as seconds
  slices.forEach((d) => {
    d.startTimeSec = hoursMinutesToSeconds(d.startTime);
    d.endTimeSec = hoursMinutesToSeconds(d.endTime);
  });

  // Group slices by day of week: [0] = day number, [1] = array of time periods
  nestedSlices = d3.groups(slices, (d) => +d.day);

  filteredDaysOfWeek = nestedSlices.map((d) => d[0]);

  /*
   * 2. Load and process raw data
   */

  if (dataSource.sample) {
    d3.csv(dataSource.url).then((data) => {
      sliceData(data, 'timestamp', 'value');
    })
    .catch((error) => console.error(error));
  } else {
    sliceData(dataSource.content, dataSource.timestampCol, dataSource.valueCol);
  }
}

function sliceData(data, timestampCol, valueCol) {
  // Parse strings and get date range
  data.forEach((d) => {
    d.timestamp = new Date(d[timestampCol]);
    d.value = +d[valueCol];
    const newTime = new Date();
    newTime.setHours(d.timestamp.getHours(), d.timestamp.getMinutes(), 0);
    d.time = newTime;
    const newDate = new Date(d.timestamp.valueOf());
    newDate.setHours(0, 0, 0);
    d.date = newDate;
  });

  data.sort((a, b) => a.timestamp - b.timestamp);
  const dateRange = d3.extent(data, (d) => d.timestamp);

  /*
   * 3. Prepare empty slices (some slices may remain empty in case of missing data)
   */

  let slicedDataDict = {};
  let currDate = dateRange[0];
  while (currDate <= dateRange[1]) {
    // First, check day of the week
    const currDay = currDate.getDay();
    if (filteredDaysOfWeek.includes(currDay)) {
      // Second, go through time periods of current day (maybe more than 1)
      nestedSlices[filteredDaysOfWeek.indexOf(currDay)][1].forEach(
        (timePeriod) => {
          // Create key based on date, start time, and end time
          const timeSliceKey = `${formatDate(currDate)}-${
            timePeriod.startTime
          }-${timePeriod.endTime}`;
          const splitStartTime = timePeriod.startTime.split(":");
          const exactDate = new Date(
            currDate.getFullYear(),
            currDate.getMonth(),
            currDate.getDate(),
            splitStartTime[0],
            splitStartTime[1]
          );

          slicedDataDict[timeSliceKey] = {
            date: new Date(exactDate), // or else this gets overwritten by the latest currDate (???)
            startTimeSec: timePeriod.startTimeSec,
            endTimeSec: timePeriod.endTimeSec,
            values: [],
          };
        }
      );
    }
    currDate.setDate(currDate.getDate() + 1);
  }

  /*
   * 4. Filter and group flat input data based on given time slices
   */
  data.forEach((d) => {
    // First, check day of the week
    const currDay = d.timestamp.getDay();
    if (filteredDaysOfWeek.includes(currDay)) {
      // Second, check if current timestamp is within one of the given time ranges
      const secondsOfDay = getSecondsOfDay(d.timestamp);
      for (let timePeriod of nestedSlices[
        filteredDaysOfWeek.indexOf(currDay)
      ][1]) {
        if (
          secondsOfDay >= timePeriod.startTimeSec &&
          secondsOfDay <= timePeriod.endTimeSec
        ) {
          const timeSliceKey = `${formatDate(d.timestamp)}-${
            timePeriod.startTime
          }-${timePeriod.endTime}`;
          slicedDataDict[timeSliceKey]["values"].push(d);
          break;
        } else {
        }
      }
    }
  });
  /*
   * 5. Compute summary statistics for each time slice
   */
  let timeSlices = [];
  let xPos = 0;
  let i = 0;
  for (const [key, timeSlice] of Object.entries(slicedDataDict)) {
    timeSlice.values.forEach((d, index) => {
      if (index == 0) {
        d.secondsSinceStart = 0;
      } else {
        d.secondsSinceStart =
          (d.timestamp.getTime() -
            timeSlice.values[0].timestamp.getTime()) /
          1000;
      }
    });

    timeSlice.minValue = d3.min(timeSlice.values, (d) => d.value);
    timeSlice.maxValue = d3.max(timeSlice.values, (d) => d.value);
    timeSlice.avgValue = d3.mean(timeSlice.values, (d) => d.value);
    timeSlice.medianValue = d3.median(timeSlice.values, (d) => d.value);
    timeSlice.lowerQuartileValue = d3.quantile(
      timeSlice.values,
      0.25,
      (d) => d.value
    );
    timeSlice.upperQuartileValue = d3.quantile(
      timeSlice.values,
      0.75,
      (d) => d.value
    );
    timeSlice.duration = timeSlice.endTimeSec - timeSlice.startTimeSec;
    timeSlice.xPos = xPos;
    xPos += timeSlice.duration;

    // Need to do this to compare dates to xScale without HH:MM time
    const day = new Date(timeSlice.date.valueOf());
    day.setHours(0, 0, 0);
    timeSlice.date = day;
    
    timeSlice.id = i;
    i++;

    timeSlices.push(timeSlice);
  }
  // Contains the final array of time slice data that we will visualize with D3
  slicedData.set(timeSlices);
}

/*
 * Utility functions
 */

const formatDate = d3.timeFormat("%Y-%m-%d");

// Return time of day in seconds (based on Date object)
function getSecondsOfDay(dt) {
  return dt.getSeconds() + 60 * dt.getMinutes() + 60 * 60 * dt.getHours();
}

// Convert HH:MM to seconds
function hoursMinutesToSeconds(hm) {
  const [hours, minutes] = hm.split(":");
  return +hours * 60 * 60 + +minutes * 60;
}

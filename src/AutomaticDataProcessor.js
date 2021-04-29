/*
 * Workflow:
 * 1. Load data
 * 2. Detect distance between slices
 * 3. Split data into slices
 * 4. Compute summary statistics
 */
import * as d3 from "d3";
import { slicedData, loading } from "./stores";

export async function processDataAutomatically(dataSource) {
  /*
   * 1. Load and process raw data
   */

  let result;

  if (dataSource.sample) {
    loading.set(true);
    await d3
      .csv(dataSource.url)
      .then((data) => {
        result = sliceData(data);
        loading.set(false); 
      })
      .catch((error) => console.error(error));
  } else {
    sliceData(dataSource.content);
  }

  return result;
}

function sliceData(data) {
  // Parse number and date strings
  data.forEach((d) => {
    d.timestamp = new Date(d.timestamp);
    d.value = +d["value"];
    const newTime = new Date();
    newTime.setHours(d.timestamp.getHours(), d.timestamp.getMinutes(), 0);
    d.time = newTime;
    const newDate = new Date(d.timestamp.valueOf());
    newDate.setHours(0, 0, 0);
    d.date = newDate;
  });

  data = data.sort((a, b) => a.timestamp - b.timestamp);

  /*
   * 2. Detect distance between slices (find appropriate splits)
   */
  //const windowSize = 10000;
  let distances = [];

  //for (let i = 1; i < data.length && i <= windowSize; i++) {
  for (let i = 1; i < data.length; i++) {
    distances.push(
      (data[i].timestamp.getTime() - data[i - 1].timestamp.getTime())/1000
    );
  }

  distances = distances.sort((a, b) => a - b);

  // Remove top 10 outliers
  let filtered_distances = distances.slice(0, distances.length-10);

  // Compute standard deviation based on filterd distances (= threshold = split between time slices)
  const distanceThreshold = d3.deviation(filtered_distances);

  /*
   * 3. Divide data points into time slices
   */
  let sliceIdx = 0;
  let timeSlices = [{ values: [data[0]] }];
  let prevTime = data[0].timestamp.getTime();

  for (let i = 1; i < data.length; i++) {
    if ((data[i].timestamp.getTime() - prevTime)/1000 >= distanceThreshold) {
      sliceIdx++;
      timeSlices[sliceIdx] = { values: [] };
    }
    prevTime = data[i].timestamp.getTime();
    timeSlices[sliceIdx].values.push(data[i]);
  }

  /*
   * 4. Compute summary statistics for each time slice
   */
  let xPos = 0;
  timeSlices.forEach((timeSlice, i, timeSlices) => {
    timeSlice.id = i;
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
    timeSlice.duration =
      (timeSlice.values[timeSlice.values.length - 1].timestamp.getTime() -
        timeSlice.values[0].timestamp.getTime())/1000;
    timeSlice.xPos = xPos;
    xPos += timeSlice.duration;

    // Need to do this to compare dates to xScale without HH:MM time
    const day = new Date(timeSlice.values[0].timestamp.valueOf());
    day.setHours(0, 0, 0);
    timeSlice.date = day;
  });

  // Contains the final array of time slice data that we will visualize with D3
  slicedData.set(timeSlices);

  return {
    nTotalSlices: timeSlices.length,
    threshold: distanceThreshold,
    medianWithinSliceDistance:
      d3.median(distances.filter((d) => d < distanceThreshold)),
    medianBetweenSliceDistance:
      d3.median(distances.filter((d) => d >= distanceThreshold)),
    distances: distances,
  };
}

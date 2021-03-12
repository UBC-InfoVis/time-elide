/*
 * Workflow:
 * 1. Load data
 * 2. Detect distance between slices
 * 3. Split data into slices
 * 4. Compute summary statistics
 */
import * as d3 from "d3";
import { slicedData } from "./stores";


export async function processDataAutomatically(dataSourceUrl) {

  /*
   * 1. Load and process raw data
   */

  let result;

  await d3.csv(dataSourceUrl)
    .then((data) => {
      // Parse number and date strings
      data.forEach((d) => {
        d.timestamp = new Date(d.timestamp);
        d.value = +d["value"];
      });

      data.sort((a, b) => a.timestamp - b.timestamp);
      

      /*
       * 2. Detect distance between slices (find appropriate splits)
       */
      const windowSize = 10000;
      let distances = [];

      for (let i = 1; i < data.length && i <= windowSize; i++) {
        distances.push(data[i].timestamp.getTime() - data[i-1].timestamp.getTime());
      }
      distances.sort();
      const distanceThreshold = d3.deviation(distances)*2;


      /*
       * 3. Divide data points into time slices
       */
      let sliceIdx = 0;
      let timeSlices = [{ values: [data[0]] }];
      let prevTime = data[0].timestamp.getTime();

      for (let i = 1; i < data.length; i++) {
        if (data[i].timestamp.getTime() - prevTime >= distanceThreshold) {
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
      timeSlices.forEach(timeSlice => {
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
        timeSlice.duration = timeSlice.values[timeSlice.values.length-1].timestamp.getTime() - timeSlice.values[0].timestamp.getTime();
        timeSlice.xPos = xPos;
        xPos += timeSlice.duration;
      });

      result = {
        nTotalSlices: timeSlices.length,
        threshold: distanceThreshold/1000,
        medianWithinSliceDistance: d3.median(distances.filter(d => d < distanceThreshold))/1000,
        medianBetweenSliceDistance: d3.median(distances.filter(d => d >= distanceThreshold))/1000,
      };
      
      // Contains the final array of time slice data that we will visualize with D3
      slicedData.set(timeSlices);
    })
    .catch((error) => console.error(error));

  return result;
}

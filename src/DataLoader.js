
import * as d3 from "d3";

import {
  loading,
  loadedData 
} from "./stores";

export async function loadData(dataSource) {

  /*
   * 1. Load and process raw data
   */

  let result;

  loading.set(true);

  if (dataSource.sample) {
    await d3
      .csv(dataSource.url)
      .then((data) => {
        result = processDataAttributes(data, 'timestamp', 'value');
      })
      .catch((error) => console.error(error));
  } else {
    result = processDataAttributes(dataSource.content, dataSource.timestampCol, dataSource.valueCol);
  }

  loadedData.set(result);
  loading.set(false);
}

function processDataAttributes(data, timestampCol, valueCol) {
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

  return data;
}
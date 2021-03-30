<script>
  import * as d3 from "d3";
  //   import { onMount } from "svelte";

  import { containerWidth, containerHeight } from "./stores";
  import Axis from "./Axis.svelte";
  import { pointRadial } from "d3-shape";

  //   import Timeline from "./Timeline.svelte";

  export let data;

  const dataKey = "avgValue";

  const margin = { top: 0, right: 5, bottom: 40, left: 5 };
  // const timelineMargin = { top: 20, right: 5, bottom: 30, left: 5 };

  let width, height, xScale, yScale, colorScale;
  let svg;

  //   // Store selected time slice
  let activeIndex;

  // set the dimensions and margins of the graph

  // Build X scales and axis:
  $: {
    width = $containerWidth - margin.left - margin.right;
    xScale = d3.scaleTime();
    console.log(data);
  }

  $: {
    height = $containerHeight - margin.top - margin.bottom;
  }

  /*   $: {
    let xExtent = d3.extent(data, (d) => d.xPos);
    if (data.length > 0) {
      xExtent[1] += data[data.length - 1].duration;
    }
    xScale.domain(xExtent).range([0, width]);
  } */

  $: {
    const minTime = d3.min(data, (d) =>
      d3.min(d.values, (k) => {
        // dummy year/month/day to just compare times
        const time = new Date(
          2000,
          1,
          1,
          k.timestamp.getHours(),
          k.timestamp.getMinutes(),
          k.timestamp.getSeconds()
        );
        return time;
      })
    );
    const maxTime = d3.max(data, (d) =>
      d3.max(d.values, (k) => {
        // dummy year/month/day to just compare times
        const time = new Date(
          2000,
          1,
          1,
          k.timestamp.getHours(),
          k.timestamp.getMinutes(),
          k.timestamp.getSeconds()
        );
        return time;
      })
    );

    xScale.domain([minTime, maxTime]).range([0, width]);
    console.log("minTime", minTime);
    console.log("maxTime", maxTime);
  }

  // Build X scales and axis:
  $: {
    let yExtent = d3.extent(data, (d) => d.date);
    yScale = d3.scaleTime().domain(yExtent).range([height, 0]);
  }

  // Build color scale
  $: {
    const globalMinValue = d3.min(data, (d) => d.minValue);
    console.log("globalMinValue", globalMinValue);
    const globalMaxValue = d3.max(data, (d) => d.maxValue);
    console.log("globalMaxValue", globalMaxValue);
    colorScale = d3
      .scaleSequential()
      .domain([globalMinValue, globalMaxValue])
      .interpolator(d3.interpolateBlues);
  }
</script>

<svg height={$containerHeight} width={$containerWidth} bind:this={svg}>
  {#each data as slice, index}
    <g transform="translate({margin.left},{margin.top})" key="index">
      {#each slice.values as point, index}
        <rect
          x={xScale(
            new Date(
              2000,
              1,
              1,
              point.timestamp.getHours(),
              point.timestamp.getMinutes(),
              point.timestamp.getSeconds()
            )
          )}
          y={yScale(
            new Date(
              point.timestamp.getFullYear(),
              point.timestamp.getMonth(),
              point.timestamp.getDate(),
              0,
              0,
              0
            )
          )}
          width={10}
          fill={colorScale(point.value)}
          height={10}
          on:mouseover={() => (activeIndex = index)}
          on:mouseout={() => (activeIndex = null)}
          class="square"
        />
      {/each}
    </g>
  {/each}

  <Axis {width} {height} scale={yScale} position="left" />
  <!-- Add x-axis line at the bottom -->
  <line
    y1={height + 1}
    y2={height + 1}
    x2={width}
    class="gridline gridline-primary"
  />
</svg>

<style>
  .square {
    margin: 1px;
  }
</style>

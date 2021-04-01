<script>
  import * as d3 from "d3";
  //   import { onMount } from "svelte";

  import { containerWidth, containerHeight } from "./stores";
  import Axis from "./Axis.svelte";
  //   import Timeline from "./Timeline.svelte";

  export let data;

  const margin = { top: 0, right: 5, bottom: 40, left: 5, yAxis: 75 };
  // const timelineMargin = { top: 20, right: 5, bottom: 30, left: 5 };

  let width, height, xScale, yScale, colorScale;
  let yAxisTickFormat;
  let svg;

  // Store selected time slice
  let activeIndex;

  // Build X scale and axis:
  $: {
    height = $containerHeight - margin.top - margin.bottom;
    yScale = d3.scaleTime();
    yAxisTickFormat = d3.timeFormat("%H:%M");
    console.log(data);
  }

  $: {
    width = $containerWidth - margin.left - margin.right;
  }

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

    yScale.domain([minTime, maxTime]).range([0, height]);
  }

  // Build Y scale and axis:
  $: {
    let xExtent = d3.extent(data, (d) => d.date);
    xScale = d3.scaleTime().domain(xExtent).range([width, 0]);
  }

  // Build color scale
  $: {
    const globalMinValue = d3.min(data, (d) => d.minValue);
    // console.log("globalMinValue", globalMinValue);
    const globalMaxValue = d3.max(data, (d) => d.maxValue);
    // console.log("globalMaxValue", globalMaxValue);
    colorScale = d3
      .scaleSequential()
      .domain([globalMinValue, globalMaxValue])
      .interpolator(d3.interpolateBlues);
  }
</script>

<svg
  height={$containerHeight}
  width={$containerWidth}
  bind:this={svg}
  transform="translate({margin.yAxis}, 0)"
>
  {#each data as slice, index}
    <g transform="translate({margin.left},{margin.top})" key="index">
      {#each slice.values as point, index}
        <rect
          x={xScale(
            new Date(
              point.timestamp.getFullYear(),
              point.timestamp.getMonth(),
              point.timestamp.getDate(),
              0,
              0,
              0
            )
          )}
          y={yScale(
            new Date(
              2000,
              1,
              1,
              point.timestamp.getHours(),
              point.timestamp.getMinutes(),
              point.timestamp.getSeconds()
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

  <Axis {width} {height} scale={xScale} position="bottom" />
  <Axis
    {width}
    {height}
    tickFormat={yAxisTickFormat}
    scale={yScale}
    position="left"
  />
</svg>

<style>
  .square {
    margin: 1px;
  }
</style>

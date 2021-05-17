<script>
  import dayjs from "dayjs";
  import duration from "dayjs/plugin/duration";
  import relativeTime from "dayjs/plugin/relativeTime";
  dayjs.extend(duration);
  dayjs.extend(relativeTime);

  import * as d3 from "d3";

  import Axis from "../chart_support/Axis.svelte";

  export let data;

  let binnedData = [];

  // General chart settings
  const containerWidth = 600;
  const containerHeight = 260;
  const margin = { top: 5, right: 30, bottom: 50, left: 40 };

  let width, height, xScale, yScale;
  let svg;
  let xAxisTickFormat = (d) => dayjs.duration(d, "seconds").humanize();

  // Initialize global x- and y-scales
  $: {
    width = containerWidth - margin.left - margin.right;
    height = containerHeight - margin.top - margin.bottom;

    if (data.length > 0) {
      // Convert milliseconds to seconds
      data = data.map((d) => d / 1000);

      binnedData = d3.bin().thresholds(30)(data);

      xScale = d3
        .scaleLinear()
        .domain([binnedData[0].x0, binnedData[binnedData.length - 1].x1])
        .range([0, width]);

      yScale = d3
        .scaleLinear()
        .domain([0, d3.max(binnedData, (d) => d.length)])
        .nice()
        .range([height, 0]);
    }
  }
</script>

<svg height={containerHeight} width={containerWidth} bind:this={svg}>
  <g transform="translate({margin.left},{margin.top})">
    {#each binnedData as bin, index}
      {#if bin.length > 0}
        <rect
          x={xScale(bin.x0) + 1}
          y={yScale(bin.length)}
          width={Math.max(0, xScale(bin.x1) - xScale(bin.x0) - 1)}
          height={Math.max(2, yScale(0) - yScale(bin.length))}
        />
      {/if}
    {/each}

    <!-- Add axes 
    <Axis {width} {height} tickFormat={xAxisTickFormat} scale={yScale} position="left" />-->
    <Axis
      {width}
      {height}
      tickFormat={xAxisTickFormat}
      ticks="5"
      scale={xScale}
      position="bottom"
    />
  </g>
</svg>

<style>
  rect {
    fill: #ccd3e2;
    shape-rendering: crispEdges;
  }
</style>

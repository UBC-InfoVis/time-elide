<script>
  import * as d3 from "d3";
  import { onMount } from "svelte";
  import { fade } from 'svelte/transition';
  import { tooltipData } from "./stores";

  import Axis from "./Axis.svelte";

  // Tooltip size
  const tooltipPadding = 8;
  const tooltipMarginTop = -80;
  const tooltipMarginLeft = 20;
  const tooltipWidth = 300;
  let tooltipPositionX = 0;

  // Chart size
  const chartWidthContainer = tooltipWidth;
  const chartHeightContainer = 120;
  const margin = { top: 10, right: 5, bottom: 20, left: 30 };
  let chartWidth = chartWidthContainer - margin.left - margin.right;
  let chartHeight = chartHeightContainer - margin.top - margin.bottom;

  let windowWidth;
  let currentSliceId;
  let svg;

  let xScale = d3.scaleTime().range([0, chartWidth]);
  let yScale = d3.scaleLinear().range([chartHeight, 0]);
  let formatDate = d3.timeFormat("%A, %B %d, %Y");

  $: if($tooltipData) {
    // Update scales only if the slice changes; not the mouse position
    if ($tooltipData.slice.id != currentSliceId) {
      xScale.domain(d3.extent($tooltipData.slice.values, (d) => d.timestamp));
      yScale.domain([0, d3.max($tooltipData.slice.values, (d) => d.value)]);
      currentSliceId = $tooltipData.slice.id;
    }
    // Tooltip is positioned on the right side by default
    // Move tooltip to the left if there is not enough space within in the browser window
    if ((tooltipMarginLeft + $tooltipData.coordinates[0] + tooltipWidth + tooltipPadding * 2) > windowWidth) {
      tooltipPositionX = $tooltipData.coordinates[0] - (tooltipMarginLeft + tooltipWidth + tooltipPadding * 2);
    } else {
      tooltipPositionX = tooltipMarginLeft + $tooltipData.coordinates[0];
    }
  }

  const lineGenerator = d3.line()
      .x((d) => xScale(d.timestamp))
      .y((d) => yScale(d.value));

</script>

<svelte:window bind:innerWidth={windowWidth} />

{#if $tooltipData}
  <div
    id="tooltip"
    style="
      left: {tooltipPositionX}px;
      top: {tooltipMarginTop + $tooltipData.coordinates[1]}px;
      min-width: {tooltipWidth}px;
    "
  >
    
    <div class="tooltip-title">
      {formatDate($tooltipData.slice.date)}
    </div>

    <svg height={chartHeightContainer} width={chartWidthContainer} bind:this={svg}>
      <g transform="translate({margin.left},{margin.top})">
        <Axis
          width={chartWidth}
          height={chartHeight}
          showGridLines={true}
          ticks={4}
          tickFormat={d3.format("~s")}
          scale={yScale}
          position="left"
        />
        <Axis 
          width={chartWidth}
          height={chartHeight}
          ticks={4}
          tickFormat={d3.timeFormat("%H:%M")}
          scale={xScale}
          position="bottom"
        />
        <path 
          class="ts-avg"
          d={lineGenerator($tooltipData.slice.values)}
        />
      </g>
    </svg>
  </div>
{/if}

<style>
  #tooltip {
    background: #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    border-radius: 2px;
    padding: 8px;
    position: absolute;
    pointer-events: none;
  }
  #tooltip :global(.axis .domain) {
    display: none;
  }
  #tooltip :global(.axis line) {
    stroke: #f1f1f1;
    shape-rendering: crispEdges;
  }
  #tooltip :global(.axis text) {
    fill: #777;
  }
  .tooltip-title {
    font-size: .875rem;
    font-weight: 500;
  }
</style>

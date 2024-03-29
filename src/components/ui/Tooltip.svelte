<script>
  import * as d3 from "d3";
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { tooltipData } from "../../stores/ui";
  import { roundNumber, abbreviateNumber } from "../../utilities";
  import Axis from "../chart_support/Axis.svelte";

  // Tooltip size
  const tooltipPadding = 8;
  const tooltipMarginTop = -80;
  const tooltipMarginLeft = 20;
  const tooltipWidth = 300;
  let tooltipPositionX = 0;

  // Chart size
  const chartWidthContainer = tooltipWidth;
  const chartHeightContainer = 120;
  const margin = { top: 15, right: 5, bottom: 20, left: 30 };
  let chartWidth = chartWidthContainer - margin.left - margin.right;
  let chartHeight = chartHeightContainer - margin.top - margin.bottom;

  let windowWidth;
  let currentSliceId;
  let svg;

  let minTime, maxTime;

  let xScale = d3.scaleTime().range([0, chartWidth]);
  let yScale = d3.scaleLinear().range([chartHeight, 0]);
  let formatDate = d3.timeFormat("%A, %B %d, %Y");
  let formatTime = d3.timeFormat("%H:%M");

  $: if ($tooltipData) {
    // Update scales only if the slice changes; not the mouse position
    if ($tooltipData.slice.id != currentSliceId) {
      xScale.domain(d3.extent($tooltipData.slice.values, (d) => d.timestamp));
      yScale.domain([0, d3.max($tooltipData.slice.values, (d) => d.value)]);
      currentSliceId = $tooltipData.slice.id;
    }
    // Tooltip is positioned on the right side by default
    // Move tooltip to the left if there is not enough space within in the browser window
    if (
      tooltipMarginLeft +
        $tooltipData.coordinates[0] +
        tooltipWidth +
        tooltipPadding * 2 >
      windowWidth
    ) {
      tooltipPositionX =
        $tooltipData.coordinates[0] -
        (tooltipMarginLeft + tooltipWidth + tooltipPadding * 2);
    } else {
      tooltipPositionX = tooltipMarginLeft + $tooltipData.coordinates[0];
    }

    minTime = d3.min($tooltipData.slice.values, (d) => d.timestamp);
    maxTime = d3.max($tooltipData.slice.values, (d) => d.timestamp);
  }

  const lineGenerator = d3
    .line()
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
    <div class="tooltip-subtitle">
      {formatTime(minTime)} - {formatTime(maxTime)}
    </div>

    <svg
      height={chartHeightContainer}
      width={chartWidthContainer}
      bind:this={svg}
    >
      <g transform="translate({margin.left},{margin.top})">
        <Axis
          width={chartWidth}
          height={chartHeight}
          showGridLines={true}
          ticks={4}
          tickFormat={(d) => abbreviateNumber(d)}
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
        <path class="ts-avg" d={lineGenerator($tooltipData.slice.values)} />
        {#if $tooltipData.referenceLine}
          <line
            class="reference-line"
            x2={chartWidth}
            y1={yScale($tooltipData.referenceLine.value)}
            y2={yScale($tooltipData.referenceLine.value)}
          />
          <text
            class="reference-title"
            text-anchor="end"
            x={chartWidth}
            dy="0.35em"
            y={yScale($tooltipData.referenceLine.value) - 8}
            >{$tooltipData.referenceLine.title}</text
          >
        {/if}
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
    font-size: 0.875rem;
    font-weight: 500;
  }
  .tooltip-subtitle {
    font-size: 0.775rem;
    font-weight: 400;
    color: #999;
  }
  .reference-line {
    stroke: #696996;
    stroke-width: 1px;
  }
  .reference-title {
    fill: #696996;
    font-size: 0.65rem;
  }
</style>

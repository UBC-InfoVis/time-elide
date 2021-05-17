<script>
  import dayjs from "dayjs";
  import duration from "dayjs/plugin/duration";
  import relativeTime from "dayjs/plugin/relativeTime";
  dayjs.extend(duration);
  dayjs.extend(relativeTime);

  import * as d3 from "d3";
  import { dataSource } from "../../stores/ui";
  import {
    globalSettings,
    chartSpecificSettings,
  } from "../../stores/chartConfig";

  import { secondsToHM, abbreviateNumber } from "../../utilities";

  import Timeline from "../chart_support/Timeline.svelte";
  import Axis from "../chart_support/Axis.svelte";

  export let data;

  // Store selected time slice
  let activeIndex;

  let containerWidth = $globalSettings.width.default;
  let containerHeight = $globalSettings.height.default;

  // Modes for x-scale
  const NORMALIZED_DURATION = "normalized duration";
  const ABSOLUTE_DURATION = "absolute duration";
  const ABSOLUTE_TIME = "absolute time";
  const xScaleModes = [NORMALIZED_DURATION, ABSOLUTE_DURATION, ABSOLUTE_TIME];
  let xScaleMode =
    $chartSpecificSettings.multiSeriesLineChart.xScaleMode.default;

  let showTimeline = $globalSettings.showTimeline.default;

  let lineOpacity =
    $chartSpecificSettings.multiSeriesLineChart.lineOpacity.default;
  // General chart settings
  const margin = { top: 20, right: 15, bottom: 30, left: 50 };
  const timelineMargin = { top: 10, right: 15, bottom: 30, left: 50 };

  let width, height, xScale, yScale, sliceXScale, lineGenerator;
  let svg;
  let xAxisTickFormat;

  // update these local vars whenever their value in the store changes via user input
  $: xScaleMode =
    $chartSpecificSettings.multiSeriesLineChart.xScaleMode.selectedValue;
  $: showTimeline = $globalSettings.showTimeline.selectedValue;
  $: lineOpacity =
    $chartSpecificSettings.multiSeriesLineChart.lineOpacity.selectedValue;

  // Initialize global x- and y-scales
  $: {
    containerWidth = $globalSettings.width.selectedValue;
    width = containerWidth - margin.left - margin.right;
    containerHeight = $globalSettings.height.selectedValue;
    height = containerHeight - margin.top - margin.bottom;
    yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.maxValue)])
      .range([height, 0]);
  }

  $: if (data.length > 0) {
    // Prepare data based on the selected x-scale mode
    data.forEach((slice) => {
      if (xScaleMode == NORMALIZED_DURATION) {
        sliceXScale = d3
          .scaleLinear()
          .domain([0, d3.max(slice.values, (d) => d.secondsSinceStart)])
          .range([0, 100]);
      }

      slice.values.forEach((d) => {
        if (xScaleMode == NORMALIZED_DURATION) {
          d.xPos = sliceXScale(d.secondsSinceStart);
        } else if (xScaleMode == ABSOLUTE_TIME) {
          d.xPos = new Date();
          d.xPos.setHours(d.timestamp.getHours());
          d.xPos.setMinutes(d.timestamp.getMinutes());
        } else {
          // ABSOLUTE_DURATION
          d.xPos = d.secondsSinceStart;
        }
      });
    });

    // Set x-scale based on the selected mode
    if (xScaleMode == ABSOLUTE_TIME) {
      const minTime = d3.min(data, (d) => d3.min(d.values, (k) => k.xPos));
      const maxTime = d3.max(data, (d) => d3.max(d.values, (k) => k.xPos));
      xScale = d3.scaleTime().domain([minTime, maxTime]).range([0, width]);
      xAxisTickFormat = d3.timeFormat("%H:%M");
    } else {
      xScale = d3.scaleLinear().range([0, width]);
      if (xScaleMode == NORMALIZED_DURATION) {
        xScale.domain([0, 100]);
        xAxisTickFormat = (d) => d + "%";
      } else {
        // ABSOLUTE_DURATION
        xScale.domain([0, d3.max(data, (d) => d.duration)]);
        // xAxisTickFormat = d => dayjs.duration(d, "seconds").humanize();
        xAxisTickFormat = (d) => secondsToHM(d);
      }
    }

    lineGenerator = d3
      .line()
      .x((d) => xScale(d.xPos))
      .y((d) => yScale(d.value));
  }

  let xAxisLabel;
  $: switch (xScaleMode) {
    case NORMALIZED_DURATION:
      xAxisLabel = "Slice duration (%)";
      break;
    case ABSOLUTE_DURATION:
      xAxisLabel = "Slice duration (hours:minutes)";
      break;
    default:
      xAxisLabel = "Time of day";
  }
</script>

<svg height={containerHeight} width={containerWidth} bind:this={svg}>
  <text
    class="axis-label"
    text-anchor="end"
    transform="translate(10, {margin.top}), rotate(-90)"
    >{$dataSource.variable ? $dataSource.variable : "Value"}</text
  >
  <text class="axis-label" dy="0.71em" transform="translate({margin.left},0)"
    >{xAxisLabel} →</text
  >
  <defs>
    <clipPath id="clip">
      <rect {width} {height} />
    </clipPath>
  </defs>
  <g transform="translate({margin.left},{margin.top})">
    <!-- Bind data to SVG elements -->
    {#each data as slice, index}
      <path
        class="ts-avg {index == activeIndex
          ? 'selected colour-scheme-lines'
          : ''}"
        d={lineGenerator(slice.values)}
        style="stroke-opacity: {index !== activeIndex ? lineOpacity : 1}"
        on:mouseover={() => (activeIndex = index)}
        on:mouseout={() => (activeIndex = null)}
      />
    {/each}

    <!-- Add axes -->
    <Axis
      {width}
      {height}
      tickFormat={(d) => abbreviateNumber(d)}
      scale={yScale}
      position="left"
    />
    <Axis
      {width}
      {height}
      tickFormat={xAxisTickFormat}
      scale={xScale}
      position="bottom"
    />
  </g>
</svg>

{#if showTimeline}
  <Timeline {data} bind:activeIndex margin={timelineMargin} />
{/if}

<style>
  g path.selected.ts-avg.colour-scheme-lines {
    stroke-width: 1.75px;
  }
</style>

<script>
  import dayjs from 'dayjs';
  import duration from 'dayjs/plugin/duration';
  import relativeTime from 'dayjs/plugin/relativeTime';
  dayjs.extend(duration);
  dayjs.extend(relativeTime);

  import * as d3 from "d3";
  import { onMount } from "svelte";
  import { containerWidth, containerHeight } from "./stores";
  import { secondsToHM } from "./utilities";

  import Axis from "./Axis.svelte";

  export let data;

  // Modes for x-scale
  const NORMALIZED_DURATION = "normalized duration";
  const ABSOLUTE_DURATION = "absolute duration";
  const ABSOLUTE_TIME = "absolute time";
  const xScaleModes = [NORMALIZED_DURATION, ABSOLUTE_DURATION, ABSOLUTE_TIME];
  let selectedXScaleMode = NORMALIZED_DURATION;

  // General chart settings
  const margin = { top: 20, right: 10, bottom: 30, left: 40 };

  let width, height, xScale, yScale, sliceXScale, lineGenerator;
  let svg;
  let xAxisTickFormat;

  // Initialize global x- and y-scales
  $: {
    width = $containerWidth - margin.left - margin.right;
    height = $containerHeight - margin.top - margin.bottom;
    yScale = d3.scaleLinear()
        .domain([0, d3.max(data, (d) => d.maxValue)])
        .range([height, 0]);
  }

  $: if (data.length > 0) {
    // Prepare data based on the selected x-scale mode
    data.forEach((slice) => {
      if (selectedXScaleMode == NORMALIZED_DURATION) {
        sliceXScale = d3.scaleLinear()
          .domain([0, d3.max(slice.values, d => d.secondsSinceStart)])
          .range([0, 100]);
      }

      slice.values.forEach((d) => {
        if (selectedXScaleMode == NORMALIZED_DURATION) {
          d.xPos = sliceXScale(d.secondsSinceStart);
        } else if (selectedXScaleMode == ABSOLUTE_TIME) {
          d.xPos = new Date;
          d.xPos.setHours(d.timestamp.getHours());
          d.xPos.setMinutes(d.timestamp.getMinutes());
        } else { // ABSOLUTE_DURATION
          d.xPos = d.secondsSinceStart;
        }
      });
    });

    // Set x-scale based on the selected mode
    if (selectedXScaleMode == ABSOLUTE_TIME) {
      const minTime = d3.min(data, d => d3.min(d.values, k => k.xPos));
      const maxTime = d3.max(data, d => d3.max(d.values, k => k.xPos));
      xScale = d3.scaleTime()
          .domain([minTime, maxTime])
          .range([0, width]);
      xAxisTickFormat = null;
    } else {
      xScale = d3.scaleLinear().range([0, width]);
      if (selectedXScaleMode == NORMALIZED_DURATION) {
        xScale.domain([0, 100]);
        xAxisTickFormat = d => d + '%';
      } else { // ABSOLUTE_DURATION
        xScale.domain([0, d3.max(data, d => d.duration)]);
        // xAxisTickFormat = d => dayjs.duration(d, "seconds").humanize();
        xAxisTickFormat = d => secondsToHM(d);
      }
    }

    lineGenerator = d3.line()
        .x((d) => xScale(d.xPos))
        .y((d) => yScale(d.value));
  }
</script>

<select bind:value={selectedXScaleMode}>
  {#each xScaleModes as mode}
    <option value={mode}>{mode}</option>
  {/each}
</select>


<svg height={$containerHeight} width={$containerWidth} bind:this={svg}>
  <g transform="translate({margin.left},{margin.top})">
    <!-- Bind data to SVG elements -->
    {#each data as slice}
      <path class="ts-avg" d={lineGenerator(slice.values)} style="stroke-opacity: 0.3" />
    {/each}

    <!-- Add axes -->
    <Axis {width} {height} scale={yScale} position="left" />
    <Axis {width} {height} tickFormat={xAxisTickFormat} scale={xScale} position="bottom" />
  </g>
</svg>

<style>
</style>

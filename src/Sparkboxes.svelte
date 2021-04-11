<script>
  import * as d3 from "d3";
  import { onMount } from "svelte";
  import {
    containerWidth,
    containerHeight,
    tooltipData,
    chartSpecificSettings,
  } from "./stores";

  import Timeline from "./Timeline.svelte";
  import TimeSliceAxis from "./TimeSliceAxis.svelte";
  import Axis from "./Axis.svelte";

  export let data;

  // General chart settings
  const margin = { top: 20, right: 15, bottom: 30, left: 40 };
  const timelineMargin = { top: 20, right: 15, bottom: 30, left: 40 };

  let width, height, xScale, yScale;
  let svg;

  let zoomXScale, zoomTransform;
  let zoomFactor = 1;

  // Store selected time slice
  let activeIndex;

  let selectedLayers = $chartSpecificSettings.sparkboxes.layers.default;
  let showTimeline = $chartSpecificSettings.sparkboxes.showTimeline.default;
  let colourScheme = $chartSpecificSettings.sparkboxes.colourScheme.default;

  // get selected layers from store and save in local var
  $: {
    selectedLayers = $chartSpecificSettings.sparkboxes.layers.selectedValue;
  }
  $: {
    showTimeline = $chartSpecificSettings.sparkboxes.showTimeline.selectedValue;
  }
  $: {
    colourScheme = $chartSpecificSettings.sparkboxes.colourScheme.selectedValue;
  }
  // Initialize global x- and y-scales
  $: {
    width = $containerWidth - margin.left - margin.right;
    xScale = d3.scaleLinear();
  }

  $: {
    height = $containerHeight - margin.top - margin.bottom;
    yScale = d3.scaleLinear();
  }

  $: {
    let xExtent = d3.extent(data, (d) => d.xPos);
    // Add width of last slice (xPos is always the beginning of a slice)
    if (data.length > 0) {
      xExtent[1] += data[data.length - 1].duration;
    }
    xScale.domain(xExtent).range([0, width]);
    zoomXScale = xScale;
  }

  $: yScale.domain([0, d3.max(data, (d) => d.maxValue)]).range([height, 0]);

  // The widths of slices are variable so we need to prepare custom x-scales and line generators
  $: data.forEach((slice) => {
    slice.xScaleCustom = d3
      .scaleTime()
      .domain(d3.extent(slice.values, (d) => d.timestamp));

    // Line path generator based on custom x-scale and global y-scale
    slice.lineGenerator = d3
      .line()
      .x((d) => slice.xScaleCustom(d.timestamp))
      .y((d) => yScale(d.value));
  });

  // Allow users to zoom into 8 slices
  $: maxZoomFactor = Math.max(1, data.length / 8);

  function getSvgAveragePath(slice, zoomFactor) {
    slice.xScaleCustom.range([0, zoomFactor * xScale(slice.duration)]);
    let lineGenerator = d3
      .line()
      .x((d) => slice.xScaleCustom(d.timestamp))
      .y((d) => yScale(d.value));
    return lineGenerator(slice.values);
  }

  onMount(() => {
    d3.select(svg).call(
      d3
        .zoom()
        .extent([
          [0, 0],
          [width, height],
        ])
        .scaleExtent([1, maxZoomFactor])
        .translateExtent([
          [0, 0],
          [width, height],
        ])
        .on("zoom", zoomed)
    );
  });

  function zoomed({ transform }) {
    zoomXScale = transform.rescaleX(xScale);
    zoomFactor = transform.k;
    zoomTransform = transform;
  }
</script>

<svg height={$containerHeight} width={$containerWidth} bind:this={svg}>
  <defs>
    <clipPath id="clip">
      <rect {width} {height} />
    </clipPath>
  </defs>
  <g transform="translate({margin.left},{margin.top})">
    <g clip-path="url(#clip)">
      <!-- Bind data to SVG elements -->
      {#each data as slice, index}
        {#if slice.xPos >= zoomXScale.domain()[0] || slice.duration <= zoomXScale.domain()[1]}
          <g
            transform="translate({zoomXScale(slice.xPos)},0)"
            class={index == activeIndex ? "selected" : ""}
          >
            {#if selectedLayers.includes("min-max")}
              <rect
                class="ts-min-max {colourScheme === 'lines'
                  ? 'colour-scheme-lines'
                  : 'colour-scheme-boxes'}"
                width={zoomFactor * xScale(slice.duration)}
                height={yScale(slice.minValue) - yScale(slice.maxValue)}
                y={yScale(slice.maxValue)}
              />
            {/if}
            {#if selectedLayers.includes("iqr")}
              <rect
                class="ts-iqr {colourScheme === 'lines'
                  ? 'colour-scheme-lines'
                  : 'colour-scheme-boxes'}"
                width={zoomFactor * xScale(slice.duration)}
                height={yScale(slice.lowerQuartileValue) -
                  yScale(slice.upperQuartileValue)}
                y={yScale(slice.upperQuartileValue)}
              />
            {/if}
            {#if selectedLayers.includes("median")}
              <line
                class="ts-median-2 {colourScheme === 'lines'
                  ? 'colour-scheme-lines'
                  : 'colour-scheme-boxes'}"
                x2={zoomFactor * xScale(slice.duration)}
                y1={yScale(slice.medianValue)}
                y2={yScale(slice.medianValue)}
              />
            {/if}
            {#if selectedLayers.includes("avg")}
              <path
                class="ts-avg {colourScheme === 'lines'
                  ? 'colour-scheme-lines'
                  : 'colour-scheme-boxes'}"
                d={getSvgAveragePath(slice, zoomFactor)}
              />
            {/if}
            {#if data.length <= 50}
              <text
                class="ts-x-label"
                y={height + 20}
                x={zoomXScale(slice.duration) / 2}>{index + 1}</text
              >
            {/if}
            <rect
              class="ts-overlay"
              width={zoomFactor * xScale(slice.duration)}
              {height}
              on:mouseover={(event) => {
                activeIndex = index;
                tooltipData.set({
                  slice: slice,
                  coordinates: [event.pageX, event.pageY],
                });
              }}
              on:mousemove={(event) =>
                ($tooltipData.coordinates = [event.pageX, event.pageY])}
              on:mouseout={() => {
                activeIndex = null;
                tooltipData.set(undefined);
              }}
            />
          </g>
        {/if}
      {/each}
    </g>

    <!-- Add y-axis -->
    <Axis
      {width}
      {height}
      tickFormat={d3.format("~s")}
      scale={yScale}
      position="left"
    />

    <!-- Add x-axis -->
    <TimeSliceAxis
      {width}
      {height}
      {xScale}
      variableLabelWidth={true}
      {data}
      {zoomFactor}
      {zoomXScale}
    />
  </g>
</svg>
{#if showTimeline}
  <Timeline
    {data}
    bind:activeIndex
    margin={timelineMargin}
    zoom={zoomTransform}
  />
{/if}

<style>
</style>

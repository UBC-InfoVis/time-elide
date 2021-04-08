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

  export let data;

  const dataKey = "avgValue";

  const margin = { top: 5, right: 5, bottom: 30, left: 15 };
  const timelineMargin = { top: 20, right: 5, bottom: 30, left: 15 };

  let width, height, xScale;
  let svg;

  let zoomXScale, zoomTransform;
  let zoomFactor = 1;

  // Store selected time slice
  let activeIndex;

  let showTimeline = $chartSpecificSettings.colourHeatmap.showTimeline.default;

  $: {
    showTimeline =
      $chartSpecificSettings.colourHeatmap.showTimeline.selectedValue;
  }

  $: {
    width = $containerWidth - margin.left - margin.right;
    height = $containerHeight - margin.top - margin.bottom;
    xScale = d3.scaleLinear();
  }

  $: colorScale = d3
    .scaleSequential()
    .domain(d3.extent(data, (d) => d[dataKey]))
    .interpolator(d3.interpolateBlues);

  $: {
    let xExtent = d3.extent(data, (d) => d.xPos);
    if (data.length > 0) {
      xExtent[1] += data[data.length - 1].duration;
    }
    xScale.domain(xExtent).range([0, width]);
    zoomXScale = xScale;
  }

  // Allow users to zoom into 8 slices
  $: maxZoomFactor = Math.max(1, data.length / 8);

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
  <g transform="translate({margin.left},{margin.top})">
    {#each data as slice, index}
      {#if slice.xPos >= zoomXScale.domain()[0] || slice.duration <= zoomXScale.domain()[1]}
        <rect
          x={zoomXScale(slice.xPos)}
          width={zoomFactor * xScale(slice.duration)}
          fill={colorScale(slice[dataKey])}
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
      {/if}
    {/each}

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
  rect {
    shape-rendering: crispEdges;
  }
  rect:hover {
    stroke: red;
  }
</style>

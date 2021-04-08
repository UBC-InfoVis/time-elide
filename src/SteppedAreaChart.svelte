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

  const dataKey = "maxValue";

  // General chart settings
  const margin = { top: 20, right: 15, bottom: 30, left: 40 };
  const timelineMargin = { top: 20, right: 15, bottom: 30, left: 40 };

  let width, height, xScale, yScale;
  let svg;

  let zoomXScale, zoomTransform;
  let zoomFactor = 1;

  // Store selected time slice
  let activeIndex;

  let showTimeline =
    $chartSpecificSettings.steppedAreaChart.showTimeline.default;

  $: {
    showTimeline =
      $chartSpecificSettings.steppedAreaChart.showTimeline.selectedValue;
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

  $: yScale.domain([0, d3.max(data, (d) => d[dataKey])]).range([height, 0]);

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
  <defs>
    <clipPath id="clip">
      <rect {width} {height} />
    </clipPath>
  </defs>
  <g transform="translate({margin.left},{margin.top})">
    <g clip-path="url(#clip)">
      {#each data as slice, index}
        {#if slice.xPos >= zoomXScale.domain()[0] || slice.duration <= zoomXScale.domain()[1]}
          <g
            transform="translate({zoomXScale(slice.xPos)},0)"
            class={index == activeIndex ? "selected" : ""}
          >
            <rect
              class="ts"
              y={yScale(slice[dataKey])}
              height={height - yScale(slice[dataKey])}
              width={zoomFactor * xScale(slice.duration)}
            />
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

            {#if data.length <= 50}
              <text
                class="ts-x-label"
                y={height + 20}
                x={zoomXScale(slice.duration) / 2}>{index + 1}</text
              >
            {/if}
          </g>
        {/if}
      {/each}
    </g>

    <!-- Add y-axis -->
    <Axis {width} {height} scale={yScale} position="left" />

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
  rect.ts {
    fill: #ccd3e2;
    shape-rendering: crispEdges;
  }
  .selected .ts {
    fill: #885e5e;
  }
</style>

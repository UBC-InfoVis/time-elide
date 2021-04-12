<script>
  import * as d3 from "d3";
  import { onMount } from "svelte";

  import { globalSettings, tooltipData, chartSpecificSettings } from "./stores";

  import Timeline from "./Timeline.svelte";
  import TimeSliceAxis from "./TimeSliceAxis.svelte";

  export let data;

  const margin = { top: 5, right: 5, bottom: 30, left: 15 };
  const timelineMargin = { top: 20, right: 5, bottom: 30, left: 15 };

  let width, height, xScale, colorScale;
  let svg;

  let zoomXScale, zoomTransform;
  let zoomFactor = 1;

  let aggregationOptions = {
    average: "avgValue",
    max: "maxValue",
    median: "medianValue",
    min: "minValue"
  }

  // Store selected time slice
  let activeIndex;

  let containerWidth = $globalSettings.width.default;
  let containerHeight = $globalSettings.height.default;
  let showTooltip = $globalSettings.showTooltip.default;

  let aggregation = $chartSpecificSettings.colourHeatmap.aggregation.default;
  let normalizeSliceWidths =
    $chartSpecificSettings.colourHeatmap.normalizeSliceWidths.default;
  let normalizedWidth;
  $: aggregationValue = aggregationOptions[aggregation];

  $: {
    aggregation =
      $chartSpecificSettings.colourHeatmap.aggregation.selectedValue;
  }
  $: {
    normalizeSliceWidths =
      $chartSpecificSettings.colourHeatmap.normalizeSliceWidths.selectedValue;
  }
  $: {
    showTooltip = $globalSettings.showTooltip.selectedValue;
  }

  $: {
    containerWidth = $globalSettings.width.selectedValue;
    containerHeight = $globalSettings.height.selectedValue;
    width = containerWidth - margin.left - margin.right;
    height = containerHeight - margin.top - margin.bottom;
    xScale = d3.scaleLinear();
    normalizedWidth = width / data.length;
  }

  $: {
    colorScale = d3
      .scaleSequential()
      .domain(d3.extent(data, (d) => d[aggregationValue]))
      .interpolator(d3.interpolateBlues);
  }

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

<svg height={containerHeight} width={containerWidth} bind:this={svg}>
  <g transform="translate({margin.left},{margin.top})">
    {#each data as slice, index}
      {#if slice.xPos >= zoomXScale.domain()[0] || slice.duration <= zoomXScale.domain()[1]}
        <rect
          x={normalizeSliceWidths
            ? index * normalizedWidth // help... how to move x-pos accordingly when zoomed in?
            : zoomXScale(slice.xPos)}
          width={normalizeSliceWidths
            ? zoomFactor * normalizedWidth
            : zoomFactor * xScale(slice.duration)}
          fill={colorScale(slice[aggregationValue])}
          {height}
          on:mouseover={(event) => {
            activeIndex = index;
            if (showTooltip) {
              tooltipData.set({
                slice: slice,
                coordinates: [event.pageX, event.pageY],
                referenceLine: {
                  value: slice[aggregationValue],
                  title: aggregation
                }
              });
            }
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

{#if $globalSettings.showTimeline.selectedValue}
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
